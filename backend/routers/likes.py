from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from schemas import LikeOut
from deps import SessionDep, CurrentUserDep
from models import Product, Like
from routers.notifications import notify

router = APIRouter(prefix='/api/products', tags=['likes'])


# 찜 토글: 같은 주소 하나로 켜고 끈다 (이미 찜했으면 빼고, 아니면 넣는다)
@router.post('/{product_id}/like', response_model=LikeOut)
def toggle_like(product_id: int, db: SessionDep, user: CurrentUserDep):
  product = db.get(Product, product_id)

  if not product:
    raise HTTPException(status_code=404, detail='없는 상품입니다.')

  like = db.scalar(select(Like).where(Like.product_id == product_id, Like.user_id == user.id))

  if like:
    db.delete(like)
  else:
    db.add(Like(user_id=user.id, product_id=product_id))
    # 판매자에게 알림 (내 상품을 내가 찜한 건 빼고)
    if product.seller_id != user.id:
      notify(db, product.seller_id, f"{user.username}님이 '{product.title}'을 찜했어요.", f'/product/{product_id}')
  db.commit()

  # commit 뒤에 product.likes를 다시 읽어 와서 센다
  return LikeOut(liked=like is None, like_count=len(product.likes))
