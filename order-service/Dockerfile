FROM python:3.8

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

EXPOSE 5002

CMD ["uvicorn","app.main:app","--host=0.0.0.0","--port=5002","--reload"]

