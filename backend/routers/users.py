from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from schemas import ShopOut, ProductOut
from deps import SessionDep, CurrentUserDep
from models import User, Product, Like
from routers.ProdList import to_list_item

router = APIRouter(prefix='/api/users', tags=['users'])


# 내가 찜한 상품 (최근에 찜한 것부터)
@router.get('/me/likes', response_model=list[ProductOut])
def my_likes(db: SessionDep, user: CurrentUserDep):
  products = db.scalars(
    select(Product).join(Like, Like.product_id == Product.id)
    .where(Like.user_id == user.id)
    .order_by(Like.id.desc())
  ).all()
  return [to_list_item(p, user) for p in products]


# 판매자 상점 정보: 이름 · 판매 중 개수 · 거래 완료 개수 (상품 목록은 GET /api/products?seller_id=로)
@router.get('/{user_id}', response_model=ShopOut)
def get_shop(user_id: int, db: SessionDep):
  user = db.get(User, user_id)

  if not user:
    raise HTTPException(status_code=404, detail='없는 사용자입니다.')

  products = db.scalars(select(Product).where(Product.seller_id == user_id)).all()

  return ShopOut(
    id=user.id,
    username=user.username,
    selling_count=len([p for p in products if p.status != '판매완료']),
    sold_count=len([p for p in products if p.status == '판매완료']),
  )
