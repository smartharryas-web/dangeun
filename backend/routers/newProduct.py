from fastapi import APIRouter, Form, File, UploadFile
from typing import Annotated
from schemas import ProductDetailOut, ProductFormIn
from deps import SessionDep, CurrentUserDep
from models import Product
from routers.ProdList import apply_form, save_images, to_detail

router = APIRouter(prefix='/api/products', tags=['products'])


# 상품 올리기: 양식 칸은 ProductFormIn 묶음으로, 사진은 1~10장 전부 저장 (첫 장이 대표 사진)
# 칸 옮겨 담기 · 사진 저장 · 응답 모양은 고치기(ProdList.py)와 같은 도우미를 같이 쓴다
@router.post('', response_model=ProductDetailOut, status_code=201)
def create_product(
  db: SessionDep,
  user: CurrentUserDep,
  data: Annotated[ProductFormIn, Form()],
  images: Annotated[list[UploadFile], File()] = [],
):
  product = Product(seller_id=user.id, image_url='')
  apply_form(product, data)
  save_images(product, images)
  db.add(product)
  db.commit()

  return to_detail(product, user.username, user)
