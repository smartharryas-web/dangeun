from fastapi import APIRouter, HTTPException
from sqlalchemy import select, func, or_
from schemas import ShopOut, ProductOut, BadgesOut, FollowOut
from deps import SessionDep, CurrentUserDep, OptionalUserDep
from models import User, Product, Like, Follow, Review, Notification, ChatRoom, Message
from routers.ProdList import to_list_item
from routers.notifications import notify

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


# 메뉴 줄 숫자 딱지: 안 읽은 알림 수 · 안 읽은 채팅 메시지 수 (화면이 몇 초마다 물어봄)
@router.get('/me/badges', response_model=BadgesOut)
def my_badges(db: SessionDep, user: CurrentUserDep):
  notifications = db.scalar(
    select(func.count()).select_from(Notification)
    .where(Notification.user_id == user.id, Notification.is_read == False)  # noqa: E712
  )
  chats = db.scalar(
    select(func.count()).select_from(Message)
    .join(ChatRoom, ChatRoom.id == Message.room_id)
    .where(
      or_(ChatRoom.buyer_id == user.id, ChatRoom.seller_id == user.id),
      Message.sender_id != user.id,
      Message.is_read == False,  # noqa: E712
    )
  )
  return BadgesOut(notifications=notifications, chats=chats)


def follower_count(db, seller_id: int):
  return db.scalar(select(func.count()).select_from(Follow).where(Follow.seller_id == seller_id))


# 판매자 상점 정보: 이름 · 판매 중 · 거래 완료 · 팔로워 · 후기 (상품 목록은 GET /api/products?seller_id=로)
@router.get('/{user_id}', response_model=ShopOut)
def get_shop(user_id: int, db: SessionDep, viewer: OptionalUserDep):
  user = db.get(User, user_id)

  if not user:
    raise HTTPException(status_code=404, detail='없는 사용자입니다.')

  products = db.scalars(select(Product).where(Product.seller_id == user_id)).all()
  ratings = db.scalars(select(Review.rating).where(Review.seller_id == user_id)).all()
  following = viewer is not None and db.scalar(
    select(Follow).where(Follow.follower_id == viewer.id, Follow.seller_id == user_id)
  ) is not None

  return ShopOut(
    id=user.id,
    username=user.username,
    selling_count=len([p for p in products if p.status != '판매완료']),
    sold_count=len([p for p in products if p.status == '판매완료']),
    follower_count=follower_count(db, user_id),
    following=following,
    review_count=len(ratings),
    rating_avg=round(sum(ratings) / len(ratings), 1) if ratings else None,
  )


# 상점 팔로우 켜고 끄기 (찜처럼 주소 하나로 토글, 나 자신은 못 함)
@router.post('/{user_id}/follow', response_model=FollowOut)
def toggle_follow(user_id: int, db: SessionDep, user: CurrentUserDep):
  seller = db.get(User, user_id)

  if not seller:
    raise HTTPException(status_code=404, detail='없는 사용자입니다.')
  if seller.id == user.id:
    raise HTTPException(status_code=400, detail='내 상점은 팔로우할 수 없습니다.')

  follow = db.scalar(select(Follow).where(Follow.follower_id == user.id, Follow.seller_id == user_id))
  if follow:
    db.delete(follow)
  else:
    db.add(Follow(follower_id=user.id, seller_id=user_id))
    notify(db, user_id, f'{user.username}님이 내 상점을 팔로우했어요.', f'/shop/{user.id}')
  db.commit()

  return FollowOut(following=follow is None, follower_count=follower_count(db, user_id))
