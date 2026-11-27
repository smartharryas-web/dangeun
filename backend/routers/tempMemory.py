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

  # 이미 있으면 덮어쓴다: 예전 사진 파일과 예전 줄을 지우고, 아래에서 새로 만든다
  if temp:
    if temp.image_url:
      (UPLOAD_DIR / Path(temp.image_url).name).unlink(missing_ok=True)
    db.delete(temp)
    db.flush()  # 사용자마다 하나(unique)라서, 새 줄을 넣기 전에 예전 줄부터 지운다

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


@router.get('', response_model=TempMemoryOut)
def get_temp(db: SessionDep, user: CurrentUserDep):
  temp = db.scalar(select(TempProduct).where(TempProduct.user_id == user.id))

  if not temp:
    raise HTTPException(status_code=404, detail='임시저장이 없습니다.')

  return to_out(temp)


@router.delete('', status_code=204)
def delete_temp(db: SessionDep, user: CurrentUserDep):
  temp = db.scalar(select(TempProduct).where(TempProduct.user_id == user.id))

  if not temp:
    raise HTTPException(status_code=404, detail='임시저장이 없습니다.')

  # 저장된 사진 파일도 같이 지운다
  if temp.image_url:
    (UPLOAD_DIR / Path(temp.image_url).name).unlink(missing_ok=True)

  db.delete(temp)
  db.commit()
