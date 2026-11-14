# FastAPI Expense Tracker API

Placement-ready FastAPI backend with MySQL, SQLAlchemy, JWT authentication, bcrypt password hashing, protected expense CRUD, filtering, search, pagination, CORS, and pytest tests.

## 1. Create MySQL database

```sql
CREATE DATABASE expense_db;
```

## 2. Setup on Windows

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and replace `YOUR_MYSQL_PASSWORD`.

## 3. Run

```bash
uvicorn app.main:app --reload
```

Swagger:
http://127.0.0.1:8000/docs

ReDoc:
http://127.0.0.1:8000/redoc

## 4. Test

```bash
pytest -v
```

Tests use an isolated SQLite database and do not modify your MySQL database.

## Endpoints

POST `/register`
POST `/login`
GET `/profile`
POST `/expenses`
GET `/expenses`
GET `/expenses/{expense_id}`
PUT `/expenses/{expense_id}`
DELETE `/expenses/{expense_id}`
GET `/expenses/search?keyword=food`
GET `/expenses/page?skip=0&limit=10`

## Important

Never commit `.env` to GitHub.
