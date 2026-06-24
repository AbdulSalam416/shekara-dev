FROM python:3.11-slim-bookworm

# Install UV
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set working directory
WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies (frozen to lockfile, no-install-project first)
RUN uv sync --frozen --no-install-project --no-dev

# Copy application source code
COPY apps/ ./apps/
COPY README.md ./

# Sync the project itself (without dev dependencies)
RUN uv sync --frozen --no-dev

# Set environment variables
ENV PORT=8000
ENV HOST=0.0.0.0
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8000

# Run FastAPI app
CMD ["uv", "run", "uvicorn", "apps.ai_service.main:app", "--host", "0.0.0.0", "--port", "8000"]
