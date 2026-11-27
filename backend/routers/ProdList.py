import uuid
from pathlib import Path
from typing import Annotated
from fastapi import APIRouter, HTTPException, Form, File, UploadFile
from sqlalchemy import select, delete
from schemas import ProductOut, ProductDetailOut, StatusUpdate
from deps import SessionDep, CurrentUserDep, OptionalUserDep
from models import Product, Comment, Like, User
from routers.newProduct import UPLOAD_DIR

# 상품 관련 주소 모음
router = APIRouter(prefix='/api/products', tags=['products'])


# 지금 보는 사람이 이 상품을 찜했는지 (로그인 안 했으면 False)
def liked_by(product: Product, user: User | None):
  return user is not None and any(like.user_id == user.id for like in product.likes)


# 상품 → 상세 모양 (상세 · 고치기 · 상태 바꾸기가 같이 씀)
def to_detail(product: Product, seller_username: str, user: User | None):
  return ProductDetailOut(
    id=product.id,
    title=product.title,
    price=product.price,
    description=product.description,
    image_url=product.image_url,
    location=product.location,
    status=product.status,
    seller_id=product.seller_id,
    seller_username=seller_username,
    created_at=product.created_at,
    like_count=len(product.likes),
    liked=liked_by(product, user),
  )


# 상품 목록: 로그인 없이 누구나, 최신순(방금 올린 게 맨 위)
@router.get('', response_model=list[ProductOut])
def list_products(db: SessionDep, user: OptionalUserDep):
  products = db.scalars(select(Product).order_by(Product.created_at.desc())).all()

  return [
    ProductOut(
      id=p.id,
      title=p.title,
      price=p.price,
      image_url=p.image_url,
      location=p.location,
      status=p.status,
      created_at=p.created_at,
      like_count=len(p.likes),
      liked=liked_by(p, user),
    )
    for p in products
  ]


# 내 상품 하나 꺼내기 (고치기 · 지우기 · 상태 바꾸기가 같이 씀): 없으면 404, 남의 거면 403
def get_my_product(product_id: int, db: SessionDep, user: CurrentUserDep):
  product = db.get(Product, product_id)

  if not product:
    raise HTTPException(status_code=404, detail='없는 상품입니다.')

  if product.seller_id != user.id:
    raise HTTPException(status_code=403, detail='내 상품만 고치거나 지울 수 있습니다.')

  return product


# 올린 사진 파일 지우기 (시드 사진 /uploads/choco.jpg 등은 화면 쪽 파일이라 건드리지 않음)
def remove_photo(image_url: str):
  if image_url.startswith('/uploads/products/'):
    (UPLOAD_DIR / Path(image_url).name).unlink(missing_ok=True)


# 상품 고치기: 칸은 상품 올리기와 같고, 사진은 넣었을 때만 바꾼다
@router.patch('/{product_id}', response_model=ProductDetailOut)
def update_product(
  product_id: int,
  db: SessionDep,
  user: CurrentUserDep,
  title: Annotated[str, Form()],
  price: Annotated[int, Form()],
  description: Annotated[str, Form()],
  location: Annotated[str, Form()],
  images: Annotated[list[UploadFile], File()] = [],
):
  product = get_my_product(product_id, db, user)

  if len(images) > 10:
    raise HTTPException(status_code=400, detail='사진은 10장을 넘게 넣을 수 없습니다.')

  # 새 사진이 오면 첫 장으로 바꾸고 예전 파일은 지운다
  if images:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    first = images[0]
    filename = f'{uuid.uuid4()}{Path(first.filename).suffix}'
    (UPLOAD_DIR / filename).write_bytes(first.file.read())
    remove_photo(product.image_url)
    product.image_url = f'/uploads/products/{filename}'

  product.title = title
  product.price = price
  product.description = description
  product.location = location
  db.commit()

  return to_detail(product, user.username, user)


# 판매 상태 바꾸기: 판매중 · 예약중 · 판매완료 중 하나로 (내 상품만)
@router.patch('/{product_id}/status', response_model=ProductDetailOut)
def update_status(product_id: int, data: StatusUpdate, db: SessionDep, user: CurrentUserDep):
  product = get_my_product(product_id, db, user)
  product.status = data.status
  db.commit()

  return to_detail(product, user.username, user)


# 상품 지우기: 댓글 · 찜이 상품 번호를 붙잡고 있어서 그것부터 지운다
@router.delete('/{product_id}', status_code=204)
def delete_product(product_id: int, db: SessionDep, user: CurrentUserDep):
  product = get_my_product(product_id, db, user)

  db.execute(delete(Comment).where(Comment.product_id == product_id))
  db.execute(delete(Like).where(Like.product_id == product_id))
  remove_photo(product.image_url)
  db.delete(product)
  db.commit()
