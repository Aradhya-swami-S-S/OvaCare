# OvaCare-main/pcos-ml-api/Dockerfile
FROM python:3.11-slim

# Small system deps for building wheels if absolutely required
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Upgrade pip and related tools so pip selects wheels
RUN python -m pip install --upgrade pip setuptools wheel

# Copy only requirements first to leverage Docker cache
COPY requirements.txt .

# Install dependencies (prefer wheels)
RUN pip install --no-cache-dir -r requirements.txt

# Copy rest of the source
COPY . .

ENV PORT=5001
EXPOSE 5001

CMD ["python", "app.py"]
