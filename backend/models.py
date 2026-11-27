from datetime import datetime
from sqlalchemy import ForeignKey
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

  # 이 상품에 달린 찜들 (DB 칸이 아니라 likes 표를 따라가는 길 — len()으로 찜 수를 센다)
  likes: Mapped[list['Like']] = relationship()


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
