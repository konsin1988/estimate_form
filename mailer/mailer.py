import pandas as pd
from sqlalchemy import create_engine, text
from datetime import datetime, timedelta, date
import smtplib 
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from email import encoders  
from email.message import EmailMessage
import os
from dotenv import load_dotenv

class Mailer:
    def __init__(self):
        self.__db_env_names = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"]
        self.__mail_env_names = ["ADDR_FROM", "MAIL_PASSWORD"]
        self.__months = ['январь', 'февраль', 'март', 'апрель', 'апрель', 'май', 'июнь', 'июль',
                         'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь']
        self.__set_engine()

    def __get_env(self, v_names):
        load_dotenv()
        return [os.getenv(x) for x in v_names]

    def __set_engine(self):
        host, port, user, password, db_name = self.__get_env(self.__db_env_names)
        self.__engine = create_engine(f"postgresql+psycopg2://{user}:{password}@{host}:{int(port)}/{db_name}", pool_pre_ping=True)

    def __get_users(self):
        query = '''select concat_ws(' ', split_part("user", ' ', 2), split_part("user", ' ', 3)) as user, email from fin.frc_user;'''
        with self.__engine.connect() as con:
            df = pd.read_sql_query(query, con)
        return list(zip(df['user'], df['email']))

    def __get_month_year(self):
        cur_date = date.today()
        return cur_date.day, cur_date.month, cur_date.year

    def __get_msg_text(self, io):
        day, month, year = self.__get_month_year()
        date_stop = datetime(year, month, 8).strftime('%d.%m.%Y')
        reminder = f"<strong>В срок до {date_stop} включительно</strong> прошу " if day < 5 else f"Напоминаю, что <strong>в срок до {date_stop} включительно</strong> нужно "
        msg_sign = """
        --<br/><br/>
        <p><strong>С уважением, <br/>Илья Чайковский<br/></strong></p>
<p>Руководитель проектов</p>
<p>Направление "Фабрика данных"</p>
<p>АО «РТ-Техприемка»</p>
<p>i.chaykovskiy@rt-techpriemka.ru</p>
<p>https://rttec.ru</p>
<p>+7(903)228-16-12<br/></p>
        """
        msg_text = f"""
        <html>
            <p>Добрый день, {io}!<br /></p>
            <p>{reminder}актуализировать прогнозные
            значения на {self.__months[month]} – декабрь {year} года
            <u>в разрезе степени контрактации: контракт (договоры заключены), высокая степень контрактации (договоры в процессе заключения),
            прогноз (договоры планируются к заключению)</u>.</p>

            <p>Итоговое значение (Контракт + ВСК + Прогноз) составляет прогнозную величину выручки.</p>

            <p>Инструкция по заполнению прогноза через портал во вложении.
            Прошу обратить внимание, что данные вносятся в <strong>рублях</strong> (не тысячах рублей) и <strong>без НДС</strong>.
             <br />
            {msg_sign}
        </html>
        """
        return msg_text

    def __mail(self, addr_to, io):
        day, month, year = self.__get_month_year()
        msg = EmailMessage()
        addr_from, password = self.__get_env(self.__mail_env_names)
        msg['From'] = addr_from
        msg['To'] = addr_to
        msg['Subject'] = f'Актуализация прогнозов за {self.__months[month]} - декабрь {year} года'
        msg.add_alternative(self.__get_msg_text(io), subtype='html')

        file_name = 'Инструкция v2.docx'
        with open('attach.docx', 'rb') as f:
            file_data = f.read()

        msg.add_attachment(file_data, maintype='application', subtype='vnd.openxmlformats-officedocument.wordprocessingml.document', filename=file_name)

        server = smtplib.SMTP_SSL('94.100.180.160', 465)
        server.login(addr_from, password)
        server.sendmail(addr_from , addr_to, msg.as_string())
        server.quit()

    def spamming(self):
        for io, mail in self.__get_users():
            self.__mail(mail, io)

def main():
    mailer = Mailer()
    mailer.spamming()

if __name__ == "__main__":
    main()
