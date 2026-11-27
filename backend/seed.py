from datetime import datetime
from sqlalchemy import select, delete
from sqlalchemy.orm import Session
from database import engine
from deps import password_hash
from models import User, Product, Like

USERNAMES = ['asdf', 'qwer', 'zxcv']  # 비밀번호는 아이디와 같다

PRODUCTS = [
  {
    'title': '촉촉한 초코칩',
    'price': 50000000,
    'description': '제가 정말 아끼는 초코칩입니다. 여러분은 그 가치를 사고 계신거에요. 안 살꺼면 가세요. 디씨는 안됩니다. 감히 제가 아끼는 촉촉한 초코칩을 제값주지 않고 가져가려고 하지 마세요',
    'image_url': '/uploads/choco.jpg',  # 임시 값
    'location': '이촌동 파리크라상 앞',
    'status': '판매완료',
    'seller': 'asdf',
    'created_at': datetime(2025, 11, 27),
  },
  {
    'title': '갤럭시 s23',
    'price': 1230000,
    'description': '제 개인정보가 있는 소중한 폰입니다.',
    'image_url': '/uploads/galaxy.jpg',  # 임시 값
    'location': '홍제역',
    'status': '판매중',
    'seller': 'zxcv',
    'created_at': datetime(2026, 10, 10),
  },
  {
    'title': '양말',
    'price': 32000000,
    'description': '세탁 안 했습니다. 유명 아이돌이 신었던걸로 추정됩니다. 가치를 아시는 분만 연락주세요. 구하느라 힘들었습니다.',
    'image_url': '/uploads/socks.jpg',  # 임시 값
    'location': '김일성종합대학 정문 앞',
    'status': '예약중',
    'seller': 'qwer',
    'created_at': datetime(2026, 11, 27),
  },
]

with Session(engine) as db:
  # 사용자: 없는 아이디만 만든다 (이미 있는 사용자는 그대로 둔다)
  users = {}
  for username in USERNAMES:
    user = db.scalar(select(User).where(User.username == username))
    if user is None:
      user = User(username=username, password_hash=password_hash.hash(username))
      db.add(user)
    users[username] = user
  db.flush()  # id를 미리 받아 둔다

  # 상품: 다시 실행해도 같은 결과가 되도록 지우고 새로 넣는다 (찜이 상품을 가리키므로 찜부터)
  db.execute(delete(Like))
  db.execute(delete(Product))

  for p in PRODUCTS:
    db.add(Product(
      title=p['title'],
      price=p['price'],
      description=p['description'],
      image_url=p['image_url'],
      location=p['location'],
      status=p['status'],
      seller_id=users[p['seller']].id,
      created_at=p['created_at'],
    ))

  db.commit()
  print('시드 완료: 사용자', len(USERNAMES), '명, 상품', len(PRODUCTS), '개')
