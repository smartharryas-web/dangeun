from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from schemas import OfferCreate, OfferUpdate, OfferOut
from deps import SessionDep, CurrentUserDep
from models import Product, Offer, User
from routers.notifications import notify

router = APIRouter(tags=['offers'])

MIN_RATE = 0.7  # 판매가의 70% 미만은 제안 못 함 (조사: 베스티에르 콜렉티브 방식)


def to_out(offer: Offer, db):
  buyer = db.get(User, offer.buyer_id)
  return OfferOut(
    id=offer.id, price=offer.price, status=offer.status, created_at=offer.created_at,
    buyer_id=offer.buyer_id, buyer_username=buyer.username,
  )


# 가격 제안하기: 판매자가 "가격 제안 받기"를 켠 판매중 상품에만, 내 상품엔 못 함
# 이미 기다리는 제안이 있으면 가격만 바꾼다 (상품 하나에 한 사람당 기다리는 제안 하나)
@router.post('/api/products/{product_id}/offers', response_model=OfferOut, status_code=201)
def create_offer(product_id: int, data: OfferCreate, db: SessionDep, user: CurrentUserDep):
  product = db.get(Product, product_id)

  if not product:
    raise HTTPException(status_code=404, detail='없는 상품입니다.')
  if product.seller_id == user.id:
    raise HTTPException(status_code=400, detail='내 상품에는 가격을 제안할 수 없습니다.')
  if not product.negotiable:
    raise HTTPException(status_code=400, detail='가격 제안을 받지 않는 상품입니다.')
  if product.status != '판매중':
    raise HTTPException(status_code=400, detail='판매중인 상품에만 제안할 수 있습니다.')
  if data.price >= product.price:
    raise HTTPException(status_code=400, detail='판매 가격보다 낮게 제안해 주세요.')
  if data.price < product.price * MIN_RATE:
    raise HTTPException(status_code=400, detail=f'판매 가격의 70%({int(product.price * MIN_RATE):,}원) 이상으로 제안해 주세요.')

  offer = db.scalar(select(Offer).where(
    Offer.product_id == product_id, Offer.buyer_id == user.id, Offer.status == '대기',
  ))
  if offer:
    offer.price = data.price
  else:
    offer = Offer(product_id=product_id, buyer_id=user.id, price=data.price)
    db.add(offer)

  notify(db, product.seller_id, f"{user.username}님이 '{product.title}'에 {data.price:,}원을 제안했어요.", f'/product/{product_id}')
  db.commit()

  return to_out(offer, db)


# 제안 목록: 판매자는 전부, 다른 사람은 내 제안만 (최근 것부터)
@router.get('/api/products/{product_id}/offers', response_model=list[OfferOut])
def list_offers(product_id: int, db: SessionDep, user: CurrentUserDep):
  product = db.get(Product, product_id)

  if not product:
    raise HTTPException(status_code=404, detail='없는 상품입니다.')

  stmt = select(Offer).where(Offer.product_id == product_id).order_by(Offer.id.desc())
  if product.seller_id != user.id:
    stmt = stmt.where(Offer.buyer_id == user.id)

  return [to_out(o, db) for o in db.scalars(stmt).all()]


# 제안 수락 · 거절 (판매자만, 기다리는 제안만). 수락하면 상품은 예약중이 된다
@router.patch('/api/offers/{offer_id}', response_model=OfferOut)
def answer_offer(offer_id: int, data: OfferUpdate, db: SessionDep, user: CurrentUserDep):
  offer = db.get(Offer, offer_id)

  if not offer:
    raise HTTPException(status_code=404, detail='없는 제안입니다.')

  product = db.get(Product, offer.product_id)
  if product.seller_id != user.id:
    raise HTTPException(status_code=403, detail='내 상품의 제안만 답할 수 있습니다.')
  if offer.status != '대기':
    raise HTTPException(status_code=400, detail='이미 답한 제안입니다.')

  offer.status = data.status
  if data.status == '수락':
    product.status = '예약중'
  word = '수락됐어요. 판매자와 채팅으로 거래를 이어가 보세요' if data.status == '수락' else '거절됐어요'
  notify(db, offer.buyer_id, f"'{product.title}' {offer.price:,}원 제안이 {word}.", f'/product/{product.id}')
  db.commit()

  return to_out(offer, db)
