# OvaCare-main/pcos-ml-api/Dockerfile (modified)
FROM python:3.10-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN python -m pip install --upgrade pip setuptools wheel

COPY requirements.txt .

# prefer binary wheels and avoid expensive builds
RUN pip install --no-cache-dir --prefer-binary -r requirements.txt

COPY . .

ENV PORT=5001
EXPOSE 5001

CMD ["python", "app.py"]
