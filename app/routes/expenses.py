
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.expense import Expense
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.expense import (
    ExpenseCreate,
    ExpenseResponse,
    ExpenseUpdate,
)

router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"],
)


# =========================
# CREATE EXPENSE
# =========================

@router.post(
    "",
    response_model=ExpenseResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_expense = Expense(
        user_id=current_user.id,
        title=expense.title,
        amount=expense.amount,
        category=expense.category,
    )

    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    return new_expense


# =========================
# GET EXPENSES
# FILTER + SEARCH + PAGINATION
# =========================

@router.get("")
def get_expenses(
    category: str | None = None,
    search: str | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    query = db.query(Expense).filter(
        Expense.user_id == current_user.id
    )


    # =========================
    # CATEGORY FILTER
    # =========================

    if category:

        query = query.filter(
            Expense.category == category
        )


    # =========================
    # SEARCH BY TITLE
    # =========================

    if search:

        query = query.filter(
            Expense.title.ilike(
                f"%{search}%"
            )
        )


    # =========================
    # TOTAL COUNT
    # =========================

    total = query.count()


    # =========================
    # PAGINATION
    # =========================

    offset = (page - 1) * limit

    expenses = (
        query
        .offset(offset)
        .limit(limit)
        .all()
    )


    # =========================
    # CHECK NEXT PAGE
    # =========================

    has_next = (
        page * limit
    ) < total


    # =========================
    # RESPONSE
    # =========================

    return {
        "items": expenses,
        "page": page,
        "limit": limit,
        "total": total,
        "has_next": has_next,
    }


# =========================
# GET EXPENSE BY ID
# =========================

@router.get(
    "/{expense_id}",
    response_model=ExpenseResponse,
)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    expense = (
        db.query(Expense)
        .filter(
            Expense.id == expense_id,
            Expense.user_id == current_user.id,
        )
        .first()
    )


    if expense is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found",
        )


    return expense


# =========================
# UPDATE EXPENSE
# =========================

@router.put(
    "/{expense_id}",
    response_model=ExpenseResponse,
)
def update_expense(
    expense_id: int,
    expense_data: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    expense = (
        db.query(Expense)
        .filter(
            Expense.id == expense_id,
            Expense.user_id == current_user.id,
        )
        .first()
    )


    if expense is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found",
        )


    expense.title = expense_data.title
    expense.amount = expense_data.amount
    expense.category = expense_data.category


    db.commit()
    db.refresh(expense)


    return expense


# =========================
# DELETE EXPENSE
# =========================

@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    expense = (
        db.query(Expense)
        .filter(
            Expense.id == expense_id,
            Expense.user_id == current_user.id,
        )
        .first()
    )


    if expense is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found",
        )


    db.delete(expense)
    db.commit()


    return {
        "message": "Expense deleted successfully"
    }
