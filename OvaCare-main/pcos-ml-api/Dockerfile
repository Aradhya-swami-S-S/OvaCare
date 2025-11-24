# OvaCare-main/pcos-ml-api/Dockerfile
FROM python:3.11-slim

# Install minimal build deps (kept small). Many packages come as wheels on 3.11 so compile isn't needed.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Upgrade pip & tools so wheels are chosen
RUN python -m pip install --upgrade pip setuptools wheel

# Copy only requirements first for caching
COPY requirements.txt .

# Install dependencies (prefer wheels)
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the source
COPY . .

ENV PORT=5001
EXPOSE 5001

CMD ["python", "app.py"]
