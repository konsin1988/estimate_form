# ==========================================
# Stage 1: Build dependencies
# ==========================================
FROM python:3.11-slim-bookworm AS builder

# Set shell to fail fast on pipeline errors
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies needed to compile Python packages (e.g., psycopg2 for PostgreSQL)
# Cleans up apt caches immediately to keep layer size down
RUN apt-get update && apt-get install --no-install-recommends -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies into a localized wheelhouse directory
RUN pip install --no-cache-dir --upgrade pip
COPY ./docker/django/requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt


# ==========================================
# Stage 2: Final Runtime Environment
# ==========================================
FROM python:3.11-slim-bookworm AS runner

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

# Create a non-privileged user and group for security
RUN groupadd -g 10001 django && \
    useradd -u 10000 -g django -m -s /bin/bash django

# Install ONLY runtime shared libraries (libpq is required for runtime Postgres connections)
RUN apt-get update && apt-get install --no-install-recommends -y \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy compiled wheels from the builder stage and install them
COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .
RUN pip install --no-cache-dir /wheels/* && rm -rf /wheels

# Copy application source code and adjust ownership to the secure user
COPY --chown=django:django ./backend .

# Switch away from root to the secure user
USER django

# Expose the application port
EXPOSE "8000" 

# Run production WSGI/ASGI server (Gunicorn)
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "backend.wsgi:application"]
