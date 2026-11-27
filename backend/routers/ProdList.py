from fastapi import APIRouter
from sqlalchemy import select
from schemas import ProductOut
from deps import SessionDep
from models import Product

# 상품 관련 주소 모음
router = APIRouter(prefix='/api/products', tags=['products'])


# 상품 목록: 로그인 없이 누구나
@router.get('', response_model=list[ProductOut])
def list_products(db: SessionDep):
  return db.scalars(select(Product)).all()
