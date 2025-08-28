FROM python:3.11-slim

WORKDIR /app

ENV DB_HOST='db'
ENV DB_PORT=5432
ENV DB_USER='admin' 
ENV DB_PASSWORD=1234
ENV DB_NAME='skud_va' 

COPY requirements.txt /tmp/

RUN pip install -r /tmp/requirements.txt

COPY ./estimate_updater.py .

CMD ["python", "estimate_updater.py"]
 
