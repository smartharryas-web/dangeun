from datetime import datetime
from sqlalchemy import ForeignKey, false, true
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class User(Base):
  __tablename__ = 'users'

  id: Mapped[int] = mapped_column(primary_key=True)
  username: Mapped[str] = mapped_column(unique=True)
  password_hash: Mapped[str]


class RefreshToken(Base):
  __tablename__ = 'refresh_tokens'

  # 토큰마다 고유 번호(jti)
  id: Mapped[str] = mapped_column(primary_key=True)
  user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))


class Product(Base):
  __tablename__ = 'products'

  id: Mapped[int] = mapped_column(primary_key=True)
  title: Mapped[str]
  price: Mapped[int]
  description: Mapped[str]
  image_url: Mapped[str]
  location: Mapped[str]
  status: Mapped[str] = mapped_column(default='판매중')
  seller_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
  created_at: Mapped[datetime] = mapped_column(default=datetime.now)

  # 상품 정보 칸 (예전 상품은 비어 있을 수 있음)
  category: Mapped[str | None]
  condition: Mapped[str | None]  # 상품 상태: 새상품 · 사용감 적음 등
  brand: Mapped[str | None]
  tags: Mapped[str | None]  # 띄어쓰기로 구분 ("나이키 한정판")
  # 거래 방식 (server_default = 예전 상품에도 채워 넣는 값)
  negotiable: Mapped[bool] = mapped_column(default=False, server_default=false())  # 가격 제안 받기
  can_meet: Mapped[bool] = mapped_column(default=True, server_default=true())  # 직거래
  can_ship: Mapped[bool] = mapped_column(default=False, server_default=false())  # 택배
  shipping_included: Mapped[bool] = mapped_column(default=False, server_default=false())  # 배송비 포함
  has_warranty: Mapped[bool] = mapped_column(default=False, server_default=false())  # 보증서 · 영수증 있음 (판매자 제공)
  view_count: Mapped[int] = mapped_column(default=0, server_default='0')

  # 이 상품에 달린 찜들 (DB 칸이 아니라 likes 표를 따라가는 길 — len()으로 찜 수를 센다)
  likes: Mapped[list['Like']] = relationship()
  # 사진 여러 장 (position 순서대로). image_url은 대표 사진(첫 장)으로 그대로 둔다
  # cascade: 상품을 지우거나 사진 목록을 바꾸면 사진 줄도 같이 지운다
  images: Mapped[list['ProductImage']] = relationship(order_by='ProductImage.position', cascade='all, delete-orphan')


class ProductImage(Base):
  __tablename__ = 'product_images'

  id: Mapped[int] = mapped_column(primary_key=True)
  # ondelete CASCADE: 상품이 지워지면 사진 줄도 DB가 알아서 지움 (seed가 상품을 지워도 안 터짐)
  product_id: Mapped[int] = mapped_column(ForeignKey('products.id', ondelete='CASCADE'))
  url: Mapped[str]
  position: Mapped[int]


class Like(Base):
  __tablename__ = 'likes'

  id: Mapped[int] = mapped_column(primary_key=True)
  user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
  product_id: Mapped[int] = mapped_column(ForeignKey('products.id'))


class Comment(Base):
  __tablename__ = 'comments'

  id: Mapped[int] = mapped_column(primary_key=True)
  product_id: Mapped[int] = mapped_column(ForeignKey('products.id'))
  user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
  content: Mapped[str]
  created_at: Mapped[datetime] = mapped_column(default=datetime.now)
  # 수정하기 전에는 비어 있음(None)
  updated_at: Mapped[datetime | None]


class TempProduct(Base):
  __tablename__ = 'temp_products'

  id: Mapped[int] = mapped_column(primary_key=True)
  user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), unique=True)
  title: Mapped[str | None]
  category: Mapped[str | None]
  price: Mapped[int | None]
  description: Mapped[str | None]
  location: Mapped[str | None]
  image_url: Mapped[str | None]
