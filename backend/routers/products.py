from fastapi import APIRouter, HTTPException
from schemas import ProductDetailOut
from deps import SessionDep, CurrentUserDep
from models import Product, User
from sqlalchemy import select

router = APIRouter(prefix='/api/products', tags=['products'])


@router.get('/{product_id}', response_model=ProductDetailOut)
def get_product(product_id: int, db: SessionDep, user: CurrentUserDep):
  product = db.scalar(select(Product).where(Product.id == product_id))

  if not product:
    raise HTTPException(status_code=404, detail='없는 상품입니다.')

  seller = db.scalar(select(User).where(User.id == product.seller_id))

  return ProductDetailOut(
    id=product.id,
    title=product.title,
    price=product.price,
    description=product.description,
    image_url=product.image_url,
    location=product.location,
    status=product.status,
    seller_id=product.seller_id,
    seller_username=seller.username,
    created_at=product.created_at,
  )
