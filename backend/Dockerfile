FROM python:3.11-slim

# Install uv for fast dependency resolution
RUN pip install uv

WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies using uv
RUN uv pip install --system -r pyproject.toml

# Copy application code
COPY . .

# Expose port (Render/Koyeb defaults to 8000/10000 but it's best to use PORT env var)
ENV PORT=8000
EXPOSE $PORT

# Start application
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
