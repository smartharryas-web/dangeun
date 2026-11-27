import uuid
from pathlib import Path
from typing import Annotated
from fastapi import APIRouter, HTTPException, Form, File, UploadFile
from sqlalchemy import select, delete
from schemas import ProductOut, ProductDetailOut
from deps import SessionDep, CurrentUserDep
from models import Product, Comment, Like
from routers.newProduct import UPLOAD_DIR

# 상품 관련 주소 모음
router = APIRouter(prefix='/api/products', tags=['products'])


# 상품 목록: 로그인 없이 누구나, 최신순(방금 올린 게 맨 위)
@router.get('', response_model=list[ProductOut])
def list_products(db: SessionDep):
  return db.scalars(select(Product).order_by(Product.created_at.desc())).all()


# 내 상품 하나 꺼내기 (고치기 · 지우기가 같이 씀): 없으면 404, 남의 거면 403
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

  return ProductDetailOut(
    id=product.id,
    title=product.title,
    price=product.price,
    description=product.description,
    image_url=product.image_url,
    location=product.location,
    status=product.status,
    seller_id=product.seller_id,
    seller_username=user.username,
    created_at=product.created_at,
  )


# 상품 지우기: 댓글 · 찜이 상품 번호를 붙잡고 있어서 그것부터 지운다
@router.delete('/{product_id}', status_code=204)
def delete_product(product_id: int, db: SessionDep, user: CurrentUserDep):
  product = get_my_product(product_id, db, user)

  db.execute(delete(Comment).where(Comment.product_id == product_id))
  db.execute(delete(Like).where(Like.product_id == product_id))
  remove_photo(product.image_url)
  db.delete(product)
  db.commit()
