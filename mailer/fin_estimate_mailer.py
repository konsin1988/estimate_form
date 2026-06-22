from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.sdk import Variable
from airflow.decorators import task

from sqlalchemy import text
import os
import pandas as pd
from datetime import datetime, date, timedelta, timezone

import smtplib 
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from email import encoders  
from email.message import EmailMessage

from helpers.skud_worker import SkudWorker, ColumnTypes, FileData
worker = SkudWorker()

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'start_date': datetime(2026, 5, 15),
    'retries': 1
}

with DAG(
    'FIN_estimate_mailer',
    default_args=default_args,
    catchup=False,
    max_active_runs=1,
    schedule="13 10 1,6,10,14 * *",
    tags =['fin', 'estimate', 'mail'],
    description='',
) as dag:


    @task(retries=1, retry_delay=timedelta(minutes=1), execution_timeout=timedelta(minutes=10))
    def user_mailer():
        date_now = date.today()
        day = date_now.day
        month = date_now.month
        year = date_now.year
        date_stop = date_now.replace(day=8).strftime("%d.%m.%Y")

        # In January spam in 10 and 14 days
        if (month == 1 and day in (1,6)) or (month != 1 and day not in (1,6)):
            return 

        months = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 
                         'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь']

        query = """
            select fu."user", fu.email, fu.is_revenue, fu.is_cost, fu.is_dup
            from fin.frc_user fu
            where fu.is_revenue + fu.is_cost + fu.is_dup > 0
            union all
            select fu."user", fu.email, 1, 1, 1
            from fin.frc_user fu
            where frc = 'admin'
        """
        df = (
            worker.skud_sql_query(query)
            #.query('email == "d.konshin@rt-techpriemka.ru"')
        )
        users = {"revenue": list(df.query("is_revenue == 1")['email']),
                "cost": list(df.query("is_cost == 1")['email']),
                "dup": list(df.query("is_dup == 1")['email'])}

        print(users)

        subject = f'Актуализация прогнозов за {months[month - 1]} - декабрь {year} года'
        filename = 'Инструкция v2.docx'
        filepath = "/opt/airflow/mnt/estimate_mailer_attachment/attach.docx"


        reminder = f"<strong>В срок до {date_stop} включительно</strong> прошу " if day < 5 else f"Напоминаю, что <strong>в срок до {date_stop} включительно</strong> нужно "
        revenue_msg_text = f"""
        <html>
            <p>Уважаемые коллеги!<br /></p>
            <p>{reminder}актуализировать прогнозные
            значения на {months[month - 1]} – декабрь {year} года
            <u>в разрезе степени контрактации: контракт (договоры заключены), высокая степень контрактации (договоры в процессе заключения),
            прогноз (договоры планируются к заключению)</u>.</p>

            <p>Итоговое значение (Контракт + ВСК + Прогноз) составляет прогнозную величину выручки.</p>

            <p>Инструкция по заполнению прогноза через портал во вложении. 
            <p>Ссылка на портал СКИД - https://skid.rtt.digital</p>
            <p>Прошу обратить внимание, что данные вносятся в <strong>рублях</strong> (не тысячах рублей) и <strong>без НДС</strong>.</p>
             <br />
             По возникающим вопросам обращаться к Чайковскому И.С. тел.326 </br>
        </html>
        """

        for mail in users['revenue']:
            worker.send_mail(mail, revenue_msg_text, subject=subject, filename=filename, filepath=filepath)


    user_mailer()
