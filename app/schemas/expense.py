from pydantic import BaseModel, ConfigDict, Field


class ExpenseCreate(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    amount: float = Field(gt=0)
    category: str = Field(min_length=1, max_length=50)


class ExpenseUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    amount: float = Field(gt=0)
    category: str = Field(min_length=1, max_length=50)


class ExpenseResponse(BaseModel):
    id: int
    user_id: int
    title: str
    amount: float
    category: str

    model_config = ConfigDict(from_attributes=True)
