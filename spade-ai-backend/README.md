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
| `MAP_DATA_DIR` | No | `data/jessore` (one-time import, then deleted) |
| `ADMIN_EMAIL` | No | empty (skip admin bootstrap) |
| `ADMIN_PASSWORD` | No | empty (skip admin bootstrap) |
| `ADMIN_NAME` | No | `SPADE Admin` |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register a normal user (mobile app) |
| POST | `/api/v1/auth/login` | Sign in with email and password |
| POST | `/api/v1/users` | Administrator creates an account |
| GET | `/api/v1/users` | Administrator lists accounts |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| GET | `/api/v1/auth/me` | Get current user |
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/maps/jessore/summary` | Jashore nutrient summary (admin) |
| GET | `/api/v1/maps/jessore/plan` | Field collection plan (admin) |
| GET | `/api/v1/maps/jessore/layers/{layer}` | GeoJSON layer `districts`, `upazilas`, or `points` (admin) |

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (at least 8 characters) before starting the API. On startup the backend creates that account as an administrator if the email is not already registered. The website at `/maps/jessore` loads these datasets through the API after that administrator signs in.

Map documents are stored in the `map_datasets` table. On startup the API copies `data/jessore` into that table, checks the file checksum, and deletes the files. Requests never read the files. Anonymous and non-admin callers get no document body.

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
