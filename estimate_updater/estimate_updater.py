import pandas as pd
from dotenv import load_dotenv
import os
from sqlalchemy import create_engine, text
from datetime import datetime
from dateutil.relativedelta import relativedelta

class YearUpdater:
    def __init__(self):
        self.__get_engine()
        
    def __load_dotenv(self):
        load_dotenv()
        return {
            'user': os.getenv("DB_USER"),
            'password': os.getenv("DB_PASSWORD"),
            'host': os.getenv("DB_HOST"),
            'port': os.getenv("DB_PORT"),
            'db_name': os.getenv("DB_NAME"),
            'schema': 'fin'
        }

    def __get_engine(self):
        conf = self.__load_dotenv()
        self.__engine = create_engine(f"postgresql+psycopg2://{conf['user']}:{conf['password']}@{conf['host']}:{conf['port']}/{conf['db_name']}")

    def __read_sql_query(self, query):
        with self.__engine.begin() as con:
            return pd.read_sql_query(query, con)

    def __get_all_frc(self):
        c_year = datetime.now().year
        query = f"""
            select rev.company, rev.frc 
            from fin.revenue_est_2025 rev
            group by rev.company, rev.frc
            """
        return self.__read_sql_query(query)
       

    def __get_all_dates(self):
        c_year = datetime.now().year
        return pd.DataFrame({'date_dt': [datetime(c_year, 1, 1).date() + relativedelta(months=i) for i in range(12)],
                            'estimate_date': [datetime(c_year, 1, 1).date()] * 12,
                            'est_amount': [None] * 12,
                            'hcl_amount': [None] * 12,
                            'contr_amount': [None] * 12})

    def update_table(self):
        company_frc = self.__get_all_frc()
        dates_amounts = self.__get_all_dates()
        result_df = company_frc.join(dates_amounts, how='cross')[['company', 'date_dt', 
                                                                  'estimate_date', 'frc',
                                                                 'est_amount', 'hcl_amount', 'contr_amount']]
        with self.__engine.connect() as con:
            result_df.to_sql("revenue_est_2025", con, schema='fin', if_exists='append', index=False)

class MonthlyUpdater:
    def __init__(self):
        
        self.__get_engine()
        
    def __load_dotenv(self):
        load_dotenv()
        return {
            'user': os.getenv("DB_USER"),
            'password': os.getenv("DB_PASSWORD"),
            'host': os.getenv("DB_HOST"),
            'port': os.getenv("DB_PORT"),
            'db_name': os.getenv("DB_NAME"),
            'schema': 'fin'
        }

    def __get_engine(self):
        conf = self.__load_dotenv()
        self.__engine = create_engine(f"postgresql+psycopg2://{conf['user']}:{conf['password']}@{conf['host']}:{conf['port']}/{conf['db_name']}")
        print(f"postgresql+psycopg2://{conf['user']}:{conf['password']}@{conf['host']}:{conf['port']}/{conf['db_name']}")

    def __read_sql_query(self, query):
        with self.__engine.begin() as con:
            return pd.read_sql_query(query, con)

    def update_table(self):
        c_month = datetime.now().month 
        c_year = datetime.now().year
        print(f"Month = {c_month}, year = {c_year}")
        query = f"""
            select * 
            from fin.revenue_est_2025 rev
            where date_part('month', rev.estimate_date) = {c_month - 1}
            and date_part('year', rev.estimate_date) = {c_year}
            and date_part('month', rev.date_dt) >= {c_month}
        """
        data = self.__read_sql_query(query)[['company', 'date_dt', 'estimate_date', 'frc', 'est_amount', 'hcl_amount', 'contr_amount']].assign(estimate_date = lambda x: x['estimate_date'] + relativedelta(months=1))
        print(f"Data load successfully. Data: {data}")
        with self.__engine.connect() as con:
            data.to_sql("revenue_est_2025", con, schema='fin', if_exists='append', index=False)
        print("Db successfully updated")


def main():
    TYPE_UPD = os.getenv('TYPE_UPD')
    if TYPE_UPD == 'month':
        monthly_upd = MonthlyUpdater()
        monthly_upd.update_table()
    elif TYPE_UPD == 'year':
        year_upd = YearUpdater()
        year_upd.update_table()

if __name__ == "__main__":
    main()




