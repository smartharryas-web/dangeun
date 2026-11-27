import uuid
from pathlib import Path
from typing import Annotated, Literal
from fastapi import APIRouter, HTTPException, Form, File, UploadFile
from datetime import datetime, timedelta
from sqlalchemy import select, delete, or_, func
from schemas import ProductOut, ProductDetailOut, StatusUpdate, ProductFormIn, MarketOut, ReportCreate
from deps import SessionDep, CurrentUserDep, OptionalUserDep
from models import Product, ProductImage, Comment, Like, User, ChatRoom, Report
from routers.notifications import notify

# 상품 관련 주소 모음
router = APIRouter(prefix='/api/products', tags=['products'])

# backend/uploads/products 폴더에 상품 사진을 저장한다
UPLOAD_DIR = Path(__file__).resolve().parent.parent / 'uploads' / 'products'


# ── 여러 주소가 같이 쓰는 도우미 ──

# 지금 보는 사람이 이 상품을 찜했는지 (로그인 안 했으면 False)
def liked_by(product: Product, user: User | None):
  return user is not None and any(like.user_id == user.id for like in product.likes)


# 상품 → 목록 한 칸 모양
def to_list_item(product: Product, user: User | None):
  return ProductOut(
    id=product.id,
    title=product.title,
    price=product.price,
    image_url=product.image_url,
    location=product.location,
    status=product.status,
    created_at=product.created_at,
    like_count=len(product.likes),
    liked=liked_by(product, user),
    category=product.category,
    bumped_at=product.bumped_at,
  )


# 상품 → 상세 모양 (상세 · 올리기 · 고치기 · 상태 바꾸기가 같이 씀)
def to_detail(product: Product, seller_username: str, user: User | None):
  return ProductDetailOut(
    id=product.id,
    title=product.title,
    price=product.price,
    description=product.description,
    image_url=product.image_url,
    location=product.location,
    status=product.status,
    seller_id=product.seller_id,
    seller_username=seller_username,
    created_at=product.created_at,
    like_count=len(product.likes),
    liked=liked_by(product, user),
    # 사진 표에 줄이 없는 예전 상품(시드)은 대표 사진 하나만
    images=[image.url for image in product.images] or [product.image_url],
    category=product.category,
    condition=product.condition,
    brand=product.brand,
    tags=product.tags.split() if product.tags else [],
    negotiable=product.negotiable,
    can_meet=product.can_meet,
    can_ship=product.can_ship,
    shipping_included=product.shipping_included,
    has_warranty=product.has_warranty,
    view_count=product.view_count,
    buyer_id=product.buyer_id,
    has_review=len(product.reviews) > 0,
    bumped_at=product.bumped_at,
  )


# 태그 정리: "#나이키  한정판" → "나이키 한정판" (5개까지, 하나에 9글자까지)
def clean_tags(tags: str | None):
  words = [w.lstrip('#') for w in (tags or '').split() if w.lstrip('#')]
  if len(words) > 5:
    raise HTTPException(status_code=400, detail='태그는 5개까지 넣을 수 있습니다.')
  if any(len(w) > 9 for w in words):
    raise HTTPException(status_code=400, detail='태그는 하나에 9글자까지입니다.')
  return ' '.join(words) or None


MAX_PRICE = 21_000_000_000_000  # 가격은 21조 원까지 (말도 안 되는 숫자로 DB가 넘치지 않게)


# 가격 범위 검사 (올리기 · 고치기 · 임시저장이 같이 씀)
def check_price(price: int | None):
  if price is not None and price > MAX_PRICE:
    raise HTTPException(status_code=400, detail='가격은 21조 원까지 입력할 수 있어요.')


# 양식 칸을 상품에 옮겨 담기 (올리기 · 고치기가 같이 씀)
def apply_form(product: Product, data: ProductFormIn):
  check_price(data.price)
  product.title = data.title
  product.price = data.price
  product.description = data.description
  product.location = data.location
  product.category = data.category
  product.condition = data.condition
  product.brand = data.brand
  product.tags = clean_tags(data.tags)
  product.negotiable = data.negotiable
  product.can_meet = data.can_meet
  product.can_ship = data.can_ship
  # 택배를 안 하면 배송비 포함도 의미가 없다
  product.shipping_included = data.shipping_included and data.can_ship
  product.has_warranty = data.has_warranty


# 올린 사진 파일 지우기 (시드 사진 /uploads/choco.jpg 등은 화면 쪽 파일이라 건드리지 않음)
def remove_photo(url: str):
  if url.startswith('/uploads/products/'):
    (UPLOAD_DIR / Path(url).name).unlink(missing_ok=True)


# 사진 여러 장 저장: 예전 사진(줄 · 파일)을 지우고 받은 순서대로 새로 저장, 첫 장이 대표 사진
def save_images(product: Product, images: list[UploadFile]):
  if len(images) == 0 or len(images) > 10:
    raise HTTPException(status_code=400, detail='사진은 1장 이상 10장 이하로 넣어 주세요.')

  for old in product.images:
    remove_photo(old.url)
  if not product.images:
    remove_photo(product.image_url)
  product.images.clear()

  UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
  for position, image in enumerate(images):
    filename = f'{uuid.uuid4()}{Path(image.filename).suffix}'
    (UPLOAD_DIR / filename).write_bytes(image.file.read())
    product.images.append(ProductImage(url=f'/uploads/products/{filename}', position=position))

  product.image_url = product.images[0].url


# 내 상품 하나 꺼내기 (고치기 · 지우기 · 상태 바꾸기가 같이 씀): 없으면 404, 남의 거면 403
def get_my_product(product_id: int, db: SessionDep, user: CurrentUserDep):
  product = db.get(Product, product_id)

  if not product:
    raise HTTPException(status_code=404, detail='없는 상품입니다.')

  if product.seller_id != user.id:
    raise HTTPException(status_code=403, detail='내 상품만 고치거나 지울 수 있습니다.')

  return product


# ── 주소 ──

# 상품 목록: 로그인 없이 누구나
# q 검색어(제목 · 설명 · 브랜드 · 태그) · category 카테고리 · sort 정렬 · exclude_sold 판매완료 빼기 · seller_id 한 사람 상품만
@router.get('', response_model=list[ProductOut])
def list_products(
  db: SessionDep,
  user: OptionalUserDep,
  q: str | None = None,
  category: str | None = None,
  sort: Literal['latest', 'price_asc', 'price_desc', 'likes'] = 'latest',
  exclude_sold: bool = False,
  seller_id: int | None = None,
):
  stmt = select(Product)

  if q:
    word = f'%{q.strip()}%'
    stmt = stmt.where(or_(
      Product.title.ilike(word),
      Product.description.ilike(word),
      Product.brand.ilike(word),
      Product.tags.ilike(word),
    ))
  if category:
    stmt = stmt.where(Product.category == category)
  if exclude_sold:
    stmt = stmt.where(Product.status != '판매완료')
  if seller_id is not None:
    stmt = stmt.where(Product.seller_id == seller_id)

  if sort == 'price_asc':
    stmt = stmt.order_by(Product.price.asc())
  elif sort == 'price_desc':
    stmt = stmt.order_by(Product.price.desc())
  else:
    # 끌어올렸으면 그 시간, 아니면 올린 시간으로 (coalesce = 앞이 비어 있으면 뒤 값)
    stmt = stmt.order_by(func.coalesce(Product.bumped_at, Product.created_at).desc())

  products = db.scalars(stmt).all()

  # 찜 많은 순은 관계를 따라가 센 다음 정렬
  if sort == 'likes':
    products = sorted(products, key=lambda p: len(p.likes), reverse=True)

  return [to_list_item(p, user) for p in products]


# 상품 고치기: 칸은 상품 올리기와 같고, 사진은 넣었을 때만 통째로 바꾼다
@router.patch('/{product_id}', response_model=ProductDetailOut)
def update_product(
  product_id: int,
  db: SessionDep,
  user: CurrentUserDep,
  data: Annotated[ProductFormIn, Form()],
  images: Annotated[list[UploadFile], File()] = [],
):
  product = get_my_product(product_id, db, user)
  apply_form(product, data)
  if images:
    save_images(product, images)
  db.commit()

  return to_detail(product, user.username, user)


# 판매 상태 바꾸기: 판매중 · 예약중 · 판매완료 중 하나로 (내 상품만)
@router.patch('/{product_id}/status', response_model=ProductDetailOut)
def update_status(product_id: int, data: StatusUpdate, db: SessionDep, user: CurrentUserDep):
  product = get_my_product(product_id, db, user)
  product.status = data.status

  # 판매완료 때 고른 구매자는 이 상품으로 채팅한 사람이어야 한다 (그 사람만 후기를 쓸 수 있음)
  if data.status == '판매완료' and data.buyer_id is not None:
    chatted = db.scalar(select(ChatRoom).where(ChatRoom.product_id == product_id, ChatRoom.buyer_id == data.buyer_id))
    if not chatted:
      raise HTTPException(status_code=400, detail='이 상품으로 채팅한 사람만 구매자로 고를 수 있습니다.')
    product.buyer_id = data.buyer_id
    notify(db, data.buyer_id, f"'{product.title}' 거래가 완료됐어요. 거래 후기를 남겨 주세요.", f'/product/{product_id}')
  elif data.status != '판매완료':
    product.buyer_id = None
  db.commit()

  return to_detail(product, user.username, user)


# 상품 지우기: 댓글 · 찜이 상품 번호를 붙잡고 있어서 그것부터 지운다 (사진 줄은 cascade로 같이)
@router.delete('/{product_id}', status_code=204)
def delete_product(product_id: int, db: SessionDep, user: CurrentUserDep):
  product = get_my_product(product_id, db, user)

  db.execute(delete(Comment).where(Comment.product_id == product_id))
  db.execute(delete(Like).where(Like.product_id == product_id))
  for image in product.images:
    remove_photo(image.url)
  remove_photo(product.image_url)
  db.delete(product)
  db.commit()


# 비슷한 상품: 같은 카테고리에서 아직 안 팔린 것, 최신 6개
@router.get('/{product_id}/similar', response_model=list[ProductOut])
def similar_products(product_id: int, db: SessionDep, user: OptionalUserDep):
  product = db.get(Product, product_id)

  if not product:
    raise HTTPException(status_code=404, detail='없는 상품입니다.')
  if not product.category:
    return []

  products = db.scalars(
    select(Product)
    .where(Product.category == product.category, Product.id != product_id, Product.status != '판매완료')
    .order_by(Product.created_at.desc())
    .limit(6)
  ).all()

  return [to_list_item(p, user) for p in products]


# 시세: 같은 카테고리에서 판매완료된 상품 가격의 평균 · 최저 · 최고
@router.get('/{product_id}/market', response_model=MarketOut)
def market_price(product_id: int, db: SessionDep):
  product = db.get(Product, product_id)

  if not product:
    raise HTTPException(status_code=404, detail='없는 상품입니다.')

  if not product.category:
    return MarketOut(category=None, count=0, average=None, lowest=None, highest=None)

  count, average, lowest, highest = db.execute(
    select(func.count(), func.avg(Product.price), func.min(Product.price), func.max(Product.price))
    .where(Product.category == product.category, Product.status == '판매완료')
  ).one()

  return MarketOut(
    category=product.category,
    count=count,
    average=round(average) if average is not None else None,
    lowest=lowest,
    highest=highest,
  )


BUMP_GAP = timedelta(hours=24)  # 끌어올리기는 하루에 한 번


# 끌어올리기: 내 상품을 최신순 맨 위로 (판매완료는 안 됨, 마지막으로 올리거나 끌어올린 뒤 24시간이 지나야)
@router.post('/{product_id}/bump', response_model=ProductDetailOut)
def bump_product(product_id: int, db: SessionDep, user: CurrentUserDep):
  product = get_my_product(product_id, db, user)

  if product.status == '판매완료':
    raise HTTPException(status_code=400, detail='판매완료된 상품은 끌어올릴 수 없습니다.')

  wait = (product.bumped_at or product.created_at) + BUMP_GAP - datetime.now()
  if wait.total_seconds() > 0:
    hours = int(wait.total_seconds() // 3600) + 1
    raise HTTPException(status_code=400, detail=f'끌어올리기는 하루에 한 번이에요. 약 {hours}시간 뒤에 다시 할 수 있어요.')

  product.bumped_at = datetime.now()
  db.commit()

  return to_detail(product, user.username, user)


# 신고하기: 정해진 이유 중 하나, 한 사람이 한 상품에 한 번 (내 상품은 안 됨)
# 쌓인 신고는 나중에 운영자가 DB에서 본다 (관리자 화면은 아직 없음)
@router.post('/{product_id}/reports', status_code=201)
def report_product(product_id: int, data: ReportCreate, db: SessionDep, user: CurrentUserDep):
  product = db.get(Product, product_id)

  if not product:
    raise HTTPException(status_code=404, detail='없는 상품입니다.')
  if product.seller_id == user.id:
    raise HTTPException(status_code=400, detail='내 상품은 신고할 수 없습니다.')
  if db.scalar(select(Report).where(Report.product_id == product_id, Report.reporter_id == user.id)):
    raise HTTPException(status_code=409, detail='이미 신고한 상품입니다.')

  db.add(Report(product_id=product_id, reporter_id=user.id, reason=data.reason))
  db.commit()
  return {'ok': True}
