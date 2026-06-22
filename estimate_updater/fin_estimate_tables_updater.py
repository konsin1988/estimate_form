from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.sdk import Variable
from airflow.decorators import task

from sqlalchemy import text
import os
import pandas as pd
from datetime import datetime, date, timedelta, timezone


from helpers.skud_worker import SkudWorker, ColumnTypes, FileData
worker = SkudWorker()

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'start_date': datetime(2026, 5, 15),
    'retries': 1
}

with DAG(
    'FIN_estimate_tables_updater',
    default_args=default_args,
    catchup=False,
    max_active_runs=1,
    schedule="13 2,5,8 1 * *",
    tags =['fin', 'estimate', 'cost'],
    description='Update cost_est table every start of month',
) as dag:

    ################################################ COST EST UPDATER ###########################################

    @task(retries=1, retry_delay=timedelta(minutes=1), execution_timeout=timedelta(minutes=10))
    def costest_updater():
        query = """
            select max(ce.estimate_date) as max_dt
            from fin.cost_est ce
        """
        max_est_dt = worker.skud_sql_query(query)['max_dt'].values[0]

        estimate_date = datetime.now().date().replace(day=1)
        current_month = datetime.now().month

        if max_est_dt == estimate_date:
            print(f"The estimate date of month {estimate_date} already exists in the table")

        dates = [estimate_date.replace(month=i).strftime("%Y-%m-%d") for i in range(current_month, 13)]
        dates_df = pd.DataFrame({"date_dt": dates})

        # not dup
        query = """
            select fm.frc as frc_owner, 
                fm.type_1c, 
                cm.cons_type
            from fin.cost_frc_mapping fm
            left join fin.cost_consolidate_mapping cm
            on fm.type_1c = cm.type_1c
            where fm.frc <> 'Управление персоналом'
            """
        df = worker.skud_sql_query(query)
        
        est_not_dup = (
            df
            .assign(
                estimate_date = estimate_date,
                company =  'АО "РТ-Техприемка"',
                frc = None,
            )
            .merge(dates_df, how="cross")
            [['company', 'date_dt', 'estimate_date', 'frc', 'cons_type', 'type_1c', 'frc_owner']]
            .sort_values(['frc_owner', 'cons_type', 'type_1c', 'date_dt'])
        )

        # dup
        query = """
            with dup_frc as (
                select * from fin.frc_index fi
                where fi.dup_frc is true
            ), dup_mapping as (
                select cdm.type_1c, cdm.frc_owner, cdm.cons_type
                from fin.cost_dup_mapping cdm
                where cdm.division in ('ФОТ', 'Страховые взносы', 'Прочие затраты на персонал')
            )
            select cdm.type_1c, cdm.frc_owner, cdm.cons_type, fi.frc
            from dup_mapping cdm
            cross join dup_frc fi
            union all
            select cdm.type_1c, cdm.frc_owner, cdm.cons_type, null as frc
            from fin.cost_dup_mapping cdm
            where cdm.division in ('Прочие расходы') 
            """
        
        dup = worker.skud_sql_query(query)
        
        est_dup = (
            dup
            .assign(
                estimate_date = estimate_date,
                company =  'АО "РТ-Техприемка"',
            )
            .merge(dates_df, how="cross")
             [['company', 'date_dt', 'estimate_date', 'frc', 'cons_type', 'type_1c', 'frc_owner']]
            .sort_values(['frc_owner', 'cons_type', 'type_1c', 'date_dt'])
        )
        
        # Total
        cost_est_append = pd.concat([est_not_dup, est_dup])

        s = """insert into fin.cost_est (company, date_dt, estimate_date, frc, cons_type, type_1c, frc_owner) 
            values """

        for _, item in cost_est_append.iterrows():
            s += f"""('{item.company}', '{item.date_dt}', 
                '{item.estimate_date}', {'null' if item.frc is None else f"'{item.frc}'"}, 
                '{item.cons_type}', 
                '{item.type_1c}', '{item.frc_owner}'), """
        s = s[:-2] + """ on conflict 
            (company, date_dt, estimate_date, frc, cons_type, type_1c, frc_owner) 
            do nothing;"""

        worker.execute_sql(s)


    @task(retries=1, retry_delay=timedelta(minutes=1), execution_timeout=timedelta(minutes=10))
    def revenue_updater():
        query = """
            select max(re.estimate_date) as max_dt
            from fin.revenue_est_2025 re
        """
        max_est_dt = worker.skud_sql_query(query)['max_dt'].values[0]

        estimate_date = datetime.now().date().replace(day=1)
        current_month = datetime.now().month

        if max_est_dt == estimate_date:
            print(f"The estimate date of month {estimate_date} already exists in the table")
        
        dates = [estimate_date.replace(month=i).strftime("%Y-%m-%d") for i in range(current_month, 13)]
        dates_df = pd.DataFrame({"date_dt": dates})

        query = f"""
            select distinct frc, 'АО "РТ-Техприемка"' as company, null as est_amount, null as hcl_amount, null as contr_amount, '{estimate_date}' as estimate_date
            from fin.frc_user
            where is_revenue = 1
            """
        revenues = (
            worker.skud_sql_query(query)
            .merge(dates_df, how="cross")
            [['company', 'date_dt', 'estimate_date', 'frc', 'est_amount', 'hcl_amount', 'contr_amount']]
        )

        cols = ColumnTypes(
            float_columns=['est_amount', 'hcl_amount', 'contr_amount'],
            date_columns=['date_dt', 'estimate_date'],
            text_columns=['company', 'frc'],
            columns_in_order=['company', 'date_dt', 'estimate_date', 'frc', 'est_amount', 'hcl_amount', 'contr_amount'],
        )
    
        # Convert dtypes in pandas 
        revenues = worker.convert_dtypes(revenues, cols)
    
        # Set appropriate order and number of cols
        revenues = revenues[cols.columns_in_order]
        
        database_table_name = 'fin.revenue_est_2025'
        st = worker.create_database_query(revenues, database_table_name, cols) 
        st = st[:-2] + """ on conflict (date_dt, estimate_date, frc) do nothing;"""
        worker.execute_sql(st)




    costest_updater()
    revenue_updater()
