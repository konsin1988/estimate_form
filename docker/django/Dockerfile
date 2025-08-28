FROM python:3.11-slim

WORKDIR /app

COPY ./docker/django/requirements.txt /tmp/requirements.txt

RUN apt-get update && \
    apt-get install -y build-essential && apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

RUN pip install -r /tmp/requirements.txt

COPY ./backend/ /app/

CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
# CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]
