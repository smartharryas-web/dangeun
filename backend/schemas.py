from datetime import datetime
from pydantic import BaseModel, Field


class UserOut(BaseModel):
  id: int
  username: str


class UserCreate(BaseModel):
  username: str = Field(min_length=3, max_length=20)
  password: str = Field(min_length=4)


class Token(BaseModel):
  access_token: str
  token_type: str


# 상품 목록에서 상품 하나 (description · seller_id는 목록에 안 씀)
class ProductOut(BaseModel):
  id: int
  title: str
  price: int
  image_url: str
  location: str
  status: str
  created_at: datetime


# 상품 상세 (목록 칸 + 설명 · 판매자)
class ProductDetailOut(BaseModel):
  id: int
  title: str
  price: int
  description: str
  image_url: str
  location: str
  status: str
  seller_id: int
  seller_username: str
  created_at: datetime
