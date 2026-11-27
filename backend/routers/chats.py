from fastapi import APIRouter, HTTPException
from sqlalchemy import select, or_, update
from schemas import ChatRoomOut, MessageCreate, MessageOut, BuyerOut
from deps import SessionDep, CurrentUserDep
from models import Product, ChatRoom, Message, User

# 채팅: 실시간 연결(웹소켓) 대신 화면이 몇 초마다 "새 메시지 있어?" 하고 물어보는 방식
router = APIRouter(tags=['chats'])


# 채팅방 → 목록 한 칸 모양 (상대방 · 마지막 메시지 · 안 읽은 수)
def to_out(room: ChatRoom, user: User, db):
  product = db.get(Product, room.product_id)
  i_am_seller = room.seller_id == user.id
  other = db.get(User, room.buyer_id if i_am_seller else room.seller_id)
  last = room.messages[-1] if room.messages else None
  unread = len([m for m in room.messages if m.sender_id != user.id and not m.is_read])

  return ChatRoomOut(
    id=room.id,
    product_id=product.id,
    product_title=product.title,
    product_image_url=product.image_url,
    product_price=product.price,
    product_status=product.status,
    other_id=other.id,
    other_username=other.username,
    i_am_seller=i_am_seller,
    last_message=last.content if last else None,
    last_at=last.created_at if last else None,
    unread=unread,
  )


# 내 방만 꺼내기: 없으면 404, 내가 판매자도 구매자도 아니면 403
def get_my_room(room_id: int, db, user: User):
  room = db.get(ChatRoom, room_id)
  if not room:
    raise HTTPException(status_code=404, detail='없는 채팅방입니다.')
  if user.id not in (room.buyer_id, room.seller_id):
    raise HTTPException(status_code=403, detail='내 채팅방이 아닙니다.')
  return room


# 상품 상세의 "채팅하기": 이 상품으로 이미 만든 방이 있으면 그 방, 없으면 새로 만든다
@router.post('/api/products/{product_id}/chat', response_model=ChatRoomOut)
def open_chat(product_id: int, db: SessionDep, user: CurrentUserDep):
  product = db.get(Product, product_id)

  if not product:
    raise HTTPException(status_code=404, detail='없는 상품입니다.')
  if product.seller_id == user.id:
    raise HTTPException(status_code=400, detail='내 상품에는 채팅할 수 없습니다.')

  room = db.scalar(select(ChatRoom).where(ChatRoom.product_id == product_id, ChatRoom.buyer_id == user.id))
  if not room:
    room = ChatRoom(product_id=product_id, buyer_id=user.id, seller_id=product.seller_id)
    db.add(room)
    db.commit()

  return to_out(room, user, db)


# 판매완료 때 고를 구매자 후보: 이 상품으로 채팅한 사람들 (판매자만)
@router.get('/api/products/{product_id}/buyers', response_model=list[BuyerOut])
def chat_buyers(product_id: int, db: SessionDep, user: CurrentUserDep):
  product = db.get(Product, product_id)

  if not product:
    raise HTTPException(status_code=404, detail='없는 상품입니다.')
  if product.seller_id != user.id:
    raise HTTPException(status_code=403, detail='내 상품만 볼 수 있습니다.')

  rooms = db.scalars(select(ChatRoom).where(ChatRoom.product_id == product_id)).all()
  return [BuyerOut(id=r.buyer_id, username=db.get(User, r.buyer_id).username) for r in rooms]


# 내 채팅방 목록 (최근 메시지가 온 방부터)
@router.get('/api/chats', response_model=list[ChatRoomOut])
def my_chats(db: SessionDep, user: CurrentUserDep):
  rooms = db.scalars(select(ChatRoom).where(or_(ChatRoom.buyer_id == user.id, ChatRoom.seller_id == user.id))).all()
  result = [to_out(r, user, db) for r in rooms]
  # 메시지가 없는 방은 만든 순서대로 맨 뒤
  return sorted(result, key=lambda r: (r.last_at is not None, r.last_at or 0, r.id), reverse=True)


# 채팅방 하나 (방 위쪽에 상품 · 상대방 보여 줄 때)
@router.get('/api/chats/{room_id}', response_model=ChatRoomOut)
def get_chat(room_id: int, db: SessionDep, user: CurrentUserDep):
  return to_out(get_my_room(room_id, db, user), user, db)


# 메시지 받기: after_id보다 뒤에 온 것만 (화면이 3초마다 마지막 번호를 보내 새 것만 받음)
# 받으면서 상대가 보낸 메시지는 읽음으로 바꾼다
@router.get('/api/chats/{room_id}/messages', response_model=list[MessageOut])
def get_messages(room_id: int, db: SessionDep, user: CurrentUserDep, after_id: int = 0):
  room = get_my_room(room_id, db, user)

  db.execute(
    update(Message)
    .where(Message.room_id == room.id, Message.sender_id != user.id, Message.is_read == False)  # noqa: E712
    .values(is_read=True)
  )
  db.commit()

  return db.scalars(
    select(Message).where(Message.room_id == room.id, Message.id > after_id).order_by(Message.id)
  ).all()


# 메시지 보내기
@router.post('/api/chats/{room_id}/messages', response_model=MessageOut, status_code=201)
def send_message(room_id: int, data: MessageCreate, db: SessionDep, user: CurrentUserDep):
  room = get_my_room(room_id, db, user)
  message = Message(room_id=room.id, sender_id=user.id, content=data.content)
  db.add(message)
  db.commit()
  return message
