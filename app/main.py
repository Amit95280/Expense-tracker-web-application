from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import Base, engine
from app.models import user, expense
from app.routes.auth import router as auth_router
from app.routes.expenses import router as expense_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Expense Tracker API",
    description="Multi-user expense tracker backend built with FastAPI.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(expense_router)


@app.get("/")
def home():
    return {"message": "Expense API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}
