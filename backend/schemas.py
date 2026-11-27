from datetime import datetime
from typing import Literal
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
  like_count: int = 0
  liked: bool = False  # 지금 보는 사람이 찜했는지 (로그인 안 했으면 False)
  category: str | None = None


# 상품 올리기 · 고치기 양식 칸 (form-data). 사진(images)은 따로 받는다
# 양식 칸이 많아서 하나씩 Form()으로 받지 않고 묶음 하나로 받는다 (처음 쓰는 방식: Annotated[ProductFormIn, Form()])
class ProductFormIn(BaseModel):
  title: str = Field(min_length=1, max_length=40)
  price: int = Field(ge=0)
  description: str = Field(min_length=1, max_length=2000)
  location: str = Field(min_length=1)
  category: str | None = None
  condition: str | None = None
  brand: str | None = None
  tags: str | None = None  # 띄어쓰기로 구분, 5개까지, 하나에 9글자까지
  negotiable: bool = False
  can_meet: bool = True
  can_ship: bool = False
  shipping_included: bool = False
  has_warranty: bool = False


# 댓글 쓰기 요청 (내용은 비어 있으면 안 됨)
class CommentCreate(BaseModel):
  content: str = Field(min_length=1)


# 댓글 수정 요청 (내용은 비어 있으면 안 됨)
class CommentUpdate(BaseModel):
  content: str = Field(min_length=1)


# 댓글 하나 (쓴 사람 아이디 포함, updated_at은 수정하기 전엔 None)
class CommentOut(BaseModel):
  id: int
  content: str
  created_at: datetime
  updated_at: datetime | None
  user_id: int
  username: str


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
  like_count: int = 0
  liked: bool = False
  images: list[str] = []
  category: str | None = None
  condition: str | None = None
  brand: str | None = None
  tags: list[str] = []
  negotiable: bool = False
  can_meet: bool = True
  can_ship: bool = False
  shipping_included: bool = False
  has_warranty: bool = False
  view_count: int = 0


# 같은 카테고리에서 판매완료된 가격 모음 (시세)
class MarketOut(BaseModel):
  category: str | None
  count: int
  average: int | None
  lowest: int | None
  highest: int | None


# 판매자 상점 정보
class ShopOut(BaseModel):
  id: int
  username: str
  selling_count: int
  sold_count: int


# 찜 누른 결과 (켜졌는지 · 지금 찜 수)
class LikeOut(BaseModel):
  liked: bool
  like_count: int


# 판매 상태 바꾸기 요청: 셋 중 하나만 (Literal = 이 글자들 말고는 422)
class StatusUpdate(BaseModel):
  status: Literal['판매중', '예약중', '판매완료']


# 임시저장 (쓰다 만 내용이라 비어 있어도 됨)
class TempMemoryOut(BaseModel):
  title: str | None
  category: str | None
  price: int | None
  description: str | None
  location: str | None
  images: list[str]
