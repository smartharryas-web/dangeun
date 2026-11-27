import uuid
from pathlib import Path
from fastapi import APIRouter, HTTPException, Form, File, UploadFile
from typing import Annotated
from schemas import ProductDetailOut
from deps import SessionDep, CurrentUserDep
from models import Product

router = APIRouter(prefix='/api/products', tags=['products'])

# backend/uploads/products 폴더에 상품 사진을 저장한다
UPLOAD_DIR = Path(__file__).resolve().parent.parent / 'uploads' / 'products'


@router.post('', response_model=ProductDetailOut, status_code=201)
def create_product(
  db: SessionDep,
  user: CurrentUserDep,
  title: Annotated[str, Form()],
  price: Annotated[int, Form()],
  description: Annotated[str, Form()],
  location: Annotated[str, Form()],
  images: Annotated[list[UploadFile], File()] = [],
):
  if len(images) == 0 or len(images) > 10:
    raise HTTPException(status_code=400, detail='사진은 1장 이상 10장 이하로 넣어 주세요.')

  # 사진은 첫 번째 한 장만 저장한다
  UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
  first = images[0]
  filename = f'{uuid.uuid4()}{Path(first.filename).suffix}'
  (UPLOAD_DIR / filename).write_bytes(first.file.read())

  product = Product(
    title=title,
    price=price,
    description=description,
    image_url=f'/uploads/products/{filename}',
    location=location,
    seller_id=user.id,
  )
  db.add(product)
  db.commit()

  return ProductDetailOut(
    id=product.id,
    title=product.title,
    price=product.price,
    description=product.description,
    image_url=product.image_url,
    location=product.location,
    status=product.status,
    seller_id=product.seller_id,
    seller_username=user.username,
    created_at=product.created_at,
  )
