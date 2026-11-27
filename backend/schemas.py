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
  bumped_at: datetime | None = None  # 끌어올린 시간 (없으면 None)


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
  buyer_id: int | None = None  # 판매완료 때 고른 구매자
  has_review: bool = False  # 구매자가 후기를 썼는지
  bumped_at: datetime | None = None


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
  follower_count: int = 0
  following: bool = False  # 지금 보는 사람이 팔로우했는지
  review_count: int = 0
  rating_avg: float | None = None  # 별점 평균 (후기 없으면 None)


# 찜 누른 결과 (켜졌는지 · 지금 찜 수)
class LikeOut(BaseModel):
  liked: bool
  like_count: int


# 판매 상태 바꾸기 요청: 셋 중 하나만 (Literal = 이 글자들 말고는 422)
class StatusUpdate(BaseModel):
  status: Literal['판매중', '예약중', '판매완료']
  buyer_id: int | None = None  # 판매완료일 때만: 채팅한 사람 중 산 사람 (후기를 쓸 수 있게)


# 임시저장 (쓰다 만 내용이라 비어 있어도 됨)
class TempMemoryOut(BaseModel):
  title: str | None
  category: str | None
  price: int | None
  description: str | None
  location: str | None
  images: list[str]


# ── 새 시스템 ──

# 가격 제안
class OfferCreate(BaseModel):
  price: int = Field(ge=0)


class OfferUpdate(BaseModel):
  status: Literal['수락', '거절']


class OfferOut(BaseModel):
  id: int
  price: int
  status: str
  created_at: datetime
  buyer_id: int
  buyer_username: str


# 채팅방 목록 한 칸
class ChatRoomOut(BaseModel):
  id: int
  product_id: int
  product_title: str
  product_image_url: str
  product_price: int
  product_status: str
  other_id: int  # 상대방
  other_username: str
  i_am_seller: bool
  last_message: str | None
  last_at: datetime | None
  unread: int  # 안 읽은 상대 메시지 수


class MessageCreate(BaseModel):
  content: str = Field(min_length=1, max_length=1000)


class MessageOut(BaseModel):
  id: int
  sender_id: int
  content: str
  created_at: datetime
  is_read: bool


# 알림
class NotificationOut(BaseModel):
  id: int
  message: str
  link: str
  is_read: bool
  created_at: datetime


# 메뉴 줄 숫자 딱지
class BadgesOut(BaseModel):
  notifications: int
  chats: int


# 후기
class ReviewCreate(BaseModel):
  rating: int = Field(ge=1, le=5)
  content: str = Field(min_length=1, max_length=500)


class ReviewOut(BaseModel):
  id: int
  rating: int
  content: str
  created_at: datetime
  reviewer_id: int
  reviewer_username: str
  product_id: int
  product_title: str


# 팔로우 누른 결과
class FollowOut(BaseModel):
  following: bool
  follower_count: int


# 신고 (정해진 이유 중 하나)
class ReportCreate(BaseModel):
  reason: Literal['가품 의심', '사기 의심', '외부 채널 유도', '거래 금지 품목', '기타']


# 판매완료 때 고를 수 있는 구매자 (이 상품으로 채팅한 사람)
class BuyerOut(BaseModel):
  id: int
  username: str
