from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.user import UserRole


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
    
    @classmethod
    def from_orm(cls, obj):
        if hasattr(obj, 'role'):
            obj.role = obj.role.value if hasattr(obj.role, 'value') else str(obj.role)
        return super().from_orm(obj)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str