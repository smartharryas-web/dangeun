import uuid
from pathlib import Path
from fastapi import APIRouter, HTTPException, Form, File, UploadFile
from typing import Annotated
from schemas import TempMemoryOut
from deps import SessionDep, CurrentUserDep
from models import TempProduct
from sqlalchemy import select

router = APIRouter(prefix='/api/tempMemory', tags=['tempMemory'])

# backend/uploads/temp 폴더에 임시저장 사진을 저장한다
UPLOAD_DIR = Path(__file__).resolve().parent.parent / 'uploads' / 'temp'


def to_out(temp: TempProduct):
  return TempMemoryOut(
    title=temp.title,
    category=temp.category,
    price=temp.price,
    description=temp.description,
    location=temp.location,
    images=[temp.image_url] if temp.image_url else [],
  )


@router.post('', response_model=TempMemoryOut, status_code=201)
def save_temp(
  db: SessionDep,
  user: CurrentUserDep,
  title: Annotated[str | None, Form()] = None,
  category: Annotated[str | None, Form()] = None,
  price: Annotated[int | None, Form()] = None,
  description: Annotated[str | None, Form()] = None,
  location: Annotated[str | None, Form()] = None,
  images: Annotated[list[UploadFile], File()] = [],
):
  if len(images) > 10:
    raise HTTPException(status_code=400, detail='사진은 10장을 넘게 넣을 수 없습니다.')

  temp = db.scalar(select(TempProduct).where(TempProduct.user_id == user.id))

  if temp:
    raise HTTPException(status_code=409, detail='임시저장은 하나만 가능합니다.')

  # 사진은 첫 번째 한 장만 저장한다
  image_url = None
  if images:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    first = images[0]
    filename = f'{uuid.uuid4()}{Path(first.filename).suffix}'
    (UPLOAD_DIR / filename).write_bytes(first.file.read())
    image_url = f'/uploads/temp/{filename}'

  temp = TempProduct(
    user_id=user.id,
    title=title,
    category=category,
    price=price,
    description=description,
    location=location,
    image_url=image_url,
  )
  db.add(temp)
  db.commit()

  return to_out(temp)
