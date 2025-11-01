FROM python:3.11-slim

WORKDIR /app

ENV DB_HOST='172.16.3.158'
ENV DB_PORT=5432
ENV DB_USER='d_konshin' 
ENV DB_PASSWORD=Rjymiby2003
ENV DB_NAME='skud_va' 

COPY requirements.txt /tmp/

RUN pip install -r /tmp/requirements.txt

COPY ./estimate_updater.py .

CMD ["python", "estimate_updater.py"]
 
