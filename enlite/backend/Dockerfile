# -------------------------------
# 1. Base Image
# -------------------------------
FROM python:3.11-slim

# -------------------------------
# 2. System Dependencies
# -------------------------------
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        python3-dev \
        libpq-dev \
        gcc \
        g++ \
        curl \
        && rm -rf /var/lib/apt/lists/*

# -------------------------------
# 3. Set Work Directory
# -------------------------------
WORKDIR /app

# -------------------------------
# 4. Copy Backend Files
# -------------------------------
COPY . /app

# -------------------------------
# 5. Install Python Dependencies
# -------------------------------
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# -------------------------------
# 6. Collect Static Files
# -------------------------------
RUN python manage.py collectstatic --noinput || true

# -------------------------------
# 7. Expose Port
# -------------------------------
EXPOSE 8000

# -------------------------------
# 8. Start Server
# -------------------------------
CMD ["gunicorn", "backend.wsgi:application", "-b", "0.0.0.0:8000"]
