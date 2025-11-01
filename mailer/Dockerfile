FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt /tmp/requirements.txt

RUN pip3 install -r /tmp/requirements.txt

COPY mailer.py .
COPY attach.docx .

CMD ["python3", "/app/mailer.py"] 
