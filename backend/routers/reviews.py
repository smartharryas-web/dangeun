from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from schemas import ReviewCreate, ReviewOut
from deps import SessionDep, CurrentUserDep
from models import Product, Review, User
from routers.notifications import notify

router = APIRouter(tags=['reviews'])


def to_out(review: Review, db):
  return ReviewOut(
    id=review.id, rating=review.rating, content=review.content, created_at=review.created_at,
    reviewer_id=review.reviewer_id, reviewer_username=db.get(User, review.reviewer_id).username,
    product_id=review.product_id, product_title=db.get(Product, review.product_id).title,
  )


# 거래 후기 쓰기: 판매완료 때 판매자가 고른 구매자만, 상품 하나에 한 번
@router.post('/api/products/{product_id}/reviews', response_model=ReviewOut, status_code=201)
def create_review(product_id: int, data: ReviewCreate, db: SessionDep, user: CurrentUserDep):
  product = db.get(Product, product_id)

  if not product:
    raise HTTPException(status_code=404, detail='없는 상품입니다.')
  if product.status != '판매완료' or product.buyer_id != user.id:
    raise HTTPException(status_code=403, detail='이 상품을 산 사람만 후기를 쓸 수 있습니다.')
  if db.scalar(select(Review).where(Review.product_id == product_id)):
    raise HTTPException(status_code=409, detail='이미 후기를 썼습니다.')

  review = Review(product_id=product_id, reviewer_id=user.id, seller_id=product.seller_id, rating=data.rating, content=data.content)
  db.add(review)
  notify(db, product.seller_id, f"{user.username}님이 '{product.title}' 거래 후기를 남겼어요. (별 {data.rating}개)", f'/shop/{product.seller_id}')
  db.commit()

  return to_out(review, db)


# 판매자가 받은 후기 (최근 것부터)
@router.get('/api/users/{user_id}/reviews', response_model=list[ReviewOut])
def seller_reviews(user_id: int, db: SessionDep):
  reviews = db.scalars(select(Review).where(Review.seller_id == user_id).order_by(Review.id.desc())).all()
  return [to_out(r, db) for r in reviews]
