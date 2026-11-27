from datetime import datetime
from sqlalchemy import select, delete
from sqlalchemy.orm import Session
from database import engine
from deps import password_hash
from models import User, Product, Like, Comment

USERNAMES = ['asdf', 'qwer', 'zxcv']  # 비밀번호는 아이디와 같다

PRODUCTS = [
  {
      'title': '촉촉한 초코칩',
      'price': 50000000,
      'description': '제가 정말 아끼는 초코칩입니다. 여러분은 그 가치를 사고 계신 거예요. 감히 제가 아끼는 촉촉한 초코칩을 제값 주지 않고 가져가려고 하지 마세요.',
      'image_url': 'https://picsum.photos/seed/cookie/512/512',
      'location': '이촌동 파리크라상 앞',
      'status': '판매완료',
      'seller': 'asdf',
      'created_at': datetime(2026, 11, 27),
  },
  {
      'title': '갤럭시 S23',
      'price': 1230000,
      'description': '제 개인정보가 있는 소중한 폰입니다. 개인정보까지 포함된 가격이라 초기화는 안 해드립니다.',
      'image_url': 'https://picsum.photos/seed/phone/512/512',
      'location': '홍제역',
      'status': '판매중',
      'seller': 'zxcv',
      'created_at': datetime(2026, 10, 10),
  },
  {
      'title': '유명 아이돌 추정 양말',
      'price': 32000000,
      'description': '세탁 안 했습니다. 유명 아이돌이 신었던 것으로 추정되며 근거는 딱히 없습니다. 가치를 아시는 분만 연락 주세요.',
      'image_url': 'https://picsum.photos/seed/socks/512/512',
      'location': '김일성종합대학 정문 앞',
      'status': '예약중',
      'seller': 'qwer',
      'created_at': datetime(2026, 11, 27),
  },
  {
      'title': '조선시대 에어팟',
      'price': 85000000,
      'description': '할아버지께 물려받은 조선시대 에어팟입니다. 세종대왕께서 사용하셨다는 이야기가 집안에서 전해집니다. 블루투스 연결은 안 됩니다.',
      'image_url': 'https://picsum.photos/seed/earbuds/512/512',
      'location': '경복궁역',
      'status': '판매중',
      'seller': 'asdf',
      'created_at': datetime(2026, 11, 24),
  },
  {
      'title': '한강 공기 한 병',
      'price': 1500000,
      'description': '지난주 일요일 새벽 한강에서 직접 채집한 공기입니다. 개봉 시 가치가 하락하니 절대 열지 마세요.',
      'image_url': 'https://picsum.photos/seed/bottle/512/512',
      'location': '여의나루역',
      'status': '판매중',
      'seller': 'qwer',
      'created_at': datetime(2026, 11, 23),
  },
  {
      'title': '전 여자친구의 편지',
      'price': 3500000,
      'description': '3년간의 추억이 담겨 있습니다. 제가 연애하면서 쓴 돈에 비하면 상당히 저렴하게 올렸습니다.',
      'image_url': 'https://picsum.photos/seed/letter/512/512',
      'location': '신촌역',
      'status': '판매중',
      'seller': 'zxcv',
      'created_at': datetime(2026, 11, 20),
  },
  {
      'title': '먹다 남은 붕어빵',
      'price': 800000,
      'description': '팥 붕어빵이고 머리 부분만 먹었습니다. 꼬리까지 팥이 들어 있는 희귀 매물이라 가격 제안 받지 않습니다.',
      'image_url': 'https://picsum.photos/seed/pastry/512/512',
      'location': '망원시장',
      'status': '판매완료',
      'seller': 'asdf',
      'created_at': datetime(2026, 11, 18),
  },
  {
      'title': '고장 난 게이밍 컴퓨터',
      'price': 7200000,
      'description': '전원이 안 켜지는 것 외에는 특별한 문제 없습니다. 내부 부품이 정상인지 확인할 방법이 없어서 정상 제품 가격으로 판매합니다.',
      'image_url': 'https://picsum.photos/seed/computer/512/512',
      'location': '용산역',
      'status': '판매중',
      'seller': 'qwer',
      'created_at': datetime(2026, 11, 16),
  },
  {
      'title': '운동 안 한 러닝머신',
      'price': 2500000,
      'description': '구매 후 3년간 옷걸이로만 사용해서 운동 기능은 사실상 새것입니다. 걸려 있는 옷까지 구매하시면 추가금 있습니다.',
      'image_url': 'https://picsum.photos/seed/treadmill/512/512',
      'location': '목동',
      'status': '예약중',
      'seller': 'zxcv',
      'created_at': datetime(2026, 11, 14),
  },
  {
      'title': '서울대 합격 기운 연필',
      'price': 18000000,
      'description': '서울대학교 앞에서 주운 연필입니다. 합격생이 사용했을 가능성이 높으며 불합격 시 환불은 어렵습니다.',
      'image_url': 'https://picsum.photos/seed/pencil/512/512',
      'location': '서울대입구역',
      'status': '판매중',
      'seller': 'asdf',
      'created_at': datetime(2026, 11, 12),
  },
  {
      'title': '평범하지 않은 돌멩이',
      'price': 99000000,
      'description': '등산 중 저와 눈이 마주친 돌입니다. 수억 년의 역사를 간직한 물건이니 일반적인 돌 가격과 비교하지 말아 주세요.',
      'image_url': 'https://picsum.photos/seed/stone/512/512',
      'location': '북한산우이역',
      'status': '판매중',
      'seller': 'qwer',
      'created_at': datetime(2026, 11, 10),
  },
  {
      'title': '투명 망토',
      'price': 45000000,
      'description': '완벽하게 투명해서 저도 어디에 있는지 모르겠습니다. 거래 장소에 두고 갈 테니 입금 후 직접 찾아가시면 됩니다.',
      'image_url': 'https://picsum.photos/seed/cloak/512/512',
      'location': '홍대입구역',
      'status': '판매중',
      'seller': 'zxcv',
      'created_at': datetime(2026, 11, 7),
  },
  {
      'title': '미래를 알려주는 달력',
      'price': 3000000,
      'description': '2027년에 어떤 날이 무슨 요일인지 정확하게 예측합니다. 지금까지 단 한 번도 예측에 실패한 적 없습니다.',
      'image_url': 'https://picsum.photos/seed/calendar/512/512',
      'location': '광화문역',
      'status': '판매완료',
      'seller': 'asdf',
      'created_at': datetime(2026, 11, 3),
  },
  {
      'title': '바람 빠진 축구공',
      'price': 750000,
      'description': '손흥민 선수와 같은 나라에서 사용된 축구공입니다. 공기는 구매자분께서 직접 구하셔야 합니다.',
      'image_url': 'https://picsum.photos/seed/football/512/512',
      'location': '월드컵경기장역',
      'status': '판매중',
      'seller': 'qwer',
      'created_at': datetime(2026, 10, 28),
  },
  {
      'title': '읽지 않은 전공책',
      'price': 450000,
      'description': '구매 당시의 학업에 대한 열정이 그대로 보존되어 있습니다. 한 페이지도 읽지 않았으므로 지식도 전혀 빠져나가지 않았습니다.',
      'image_url': 'https://picsum.photos/seed/textbook/512/512',
      'location': '혜화역',
      'status': '예약중',
      'seller': 'zxcv',
      'created_at': datetime(2026, 10, 23),
  },
  {
      'title': '금수저가 되고 싶은 숟가락',
      'price': 27000000,
      'description': '재질은 스테인리스지만 금수저가 될 잠재력이 충분합니다. 현재 가치보다 미래 가치를 보고 구매해 주세요.',
      'image_url': 'https://picsum.photos/seed/spoon/512/512',
      'location': '압구정역',
      'status': '판매중',
      'seller': 'asdf',
      'created_at': datetime(2026, 10, 18),
  },
  {
      'title': '다리 세 개짜리 의자',
      'price': 680000,
      'description': '원래 다리가 네 개였는데 하나를 제거하여 무게를 줄였습니다. 앉아 있을 때 균형감각과 코어 근육을 동시에 훈련할 수 있습니다.',
      'image_url': 'https://picsum.photos/seed/chair/512/512',
      'location': '성수동',
      'status': '판매중',
      'seller': 'qwer',
      'created_at': datetime(2026, 10, 12),
  },
  {
      'title': '사용 완료된 복권',
      'price': 10000000,
      'description': '당첨되지 않은 복권입니다. 당첨될 수도 있었던 무한한 가능성에 대한 가격이며 당첨금은 없습니다.',
      'image_url': 'https://picsum.photos/seed/lottery/512/512',
      'location': '상계동',
      'status': '판매완료',
      'seller': 'zxcv',
      'created_at': datetime(2026, 9, 28),
  },
  {
      'title': '태양열 손전등',
      'price': 1200000,
      'description': '햇빛이 충분할 때만 작동하는 손전등입니다. 어두운 곳에서는 작동하지 않으니 제품 특성을 이해하시는 분만 구매해 주세요.',
      'image_url': 'https://picsum.photos/seed/flashlight/512/512',
      'location': '불광역',
      'status': '예약중',
      'seller': 'asdf',
      'created_at': datetime(2026, 9, 15),
  },
  {
      'title': '오른쪽 슬리퍼 한 짝',
      'price': 490000,
      'description': '왼쪽은 잃어버렸지만 오른쪽은 상태 좋습니다. 왼쪽까지 필요하신 분은 다른 판매자에게 알아보시면 됩니다.',
      'image_url': 'https://picsum.photos/seed/slipper/512/512',
      'location': '잠실역',
      'status': '판매중',
      'seller': 'zxcv',
      'created_at': datetime(2026, 9, 1),
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

  # 상품: 다시 실행해도 같은 결과가 되도록 지우고 새로 넣는다 (찜 · 댓글이 상품을 가리키므로 먼저 지운다)
  db.execute(delete(Like))
  db.execute(delete(Comment))
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
