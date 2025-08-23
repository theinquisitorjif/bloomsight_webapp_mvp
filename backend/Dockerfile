FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY backend/ /app/
ENV PYTHONUNBUFFERED=1

EXPOSE 8000
CMD ["gunicorn", "-w", "4", "-k", "gthread", "-b", "0.0.0.0:8000", "wsgi:app"]
