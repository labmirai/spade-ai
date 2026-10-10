# Spade AI Backend

Async FastAPI backend with PostgreSQL, JWT authentication, and database migrations.

## Setup

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Set `DATABASE_URL`, `SECRET_KEY` in `.env`, then:

```bash
alembic upgrade head
uvicorn app.main:app --reload
```

## Environment Variables

| Variable | Required | Default |
|----------|----------|---------|
| `DATABASE_URL` | Yes | - |
| `SECRET_KEY` | Yes | - |
| `DEBUG` | No | `True` |
| `APP_NAME` | No | `Spade AI Backend` |
| `PORT` | No | `8000` |
| `CORS_ORIGINS` | No | `["http://localhost:3000", "http://localhost:8081"]` |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| GET | `/api/v1/auth/me` | Get current user |
| GET | `/api/v1/users` | List all users |
| GET | `/api/v1/health` | Health check |

## User Model

- `id` - Primary key
- `name` - User name
- `email` - Unique email
- `phone` - Optional phone number
- `role` - User role (admin/user)
- `is_active` - Account status
- `hashed_password` - Bcrypt hashed password
- `created_at` / `updated_at` - Timestamps

## Tech Stack

- FastAPI 0.115.12
- SQLAlchemy 2.0.40 with async
- asyncpg 0.30.0
- Alembic 1.15.2
- JWT authentication (python-jose)
