from fastapi import APIRouter, HTTPException
from schemas import ProductDetailOut, CommentOut, CommentCreate
from deps import SessionDep, CurrentUserDep, OptionalUserDep
from models import Product, User, Comment
from sqlalchemy import select
from routers.ProdList import to_detail

router = APIRouter(prefix='/api/products', tags=['products'])


# 상품 상세: 로그인 없이 누구나 (상품 목록처럼)
@router.get('/{product_id}', response_model=ProductDetailOut)
def get_product(product_id: int, db: SessionDep, user: OptionalUserDep):
  product = db.scalar(select(Product).where(Product.id == product_id))

  if not product:
    raise HTTPException(status_code=404, detail='없는 상품입니다.')

  seller = db.scalar(select(User).where(User.id == product.seller_id))

  # 조회수: 판매자 본인이 본 건 세지 않는다
  if user is None or user.id != product.seller_id:
    product.view_count += 1
    db.commit()

  # 찜 수 · 내가 찜했는지까지 넣은 상세 모양 (ProdList.py의 to_detail을 같이 씀)
  return to_detail(product, seller.username, user)


# 댓글 목록: 로그인 없이 누구나 (쓰기 · 고치기 · 지우기는 로그인 필요)
@router.get('/{product_id}/comments', response_model=list[CommentOut])
def list_comments(product_id: int, db: SessionDep):
  product = db.scalar(select(Product).where(Product.id == product_id))

  if not product:
    raise HTTPException(status_code=404, detail='없는 상품입니다.')

  comments = db.scalars(
    select(Comment).where(Comment.product_id == product_id).order_by(Comment.created_at)
  ).all()

  result = []
  for comment in comments:
    writer = db.scalar(select(User).where(User.id == comment.user_id))
    result.append(CommentOut(
      id=comment.id,
      content=comment.content,
      created_at=comment.created_at,
      updated_at=comment.updated_at,
      user_id=comment.user_id,
      username=writer.username,
    ))

  return result


@router.post('/{product_id}/comments', response_model=CommentOut, status_code=201)
def create_comment(product_id: int, data: CommentCreate, db: SessionDep, user: CurrentUserDep):
  product = db.scalar(select(Product).where(Product.id == product_id))

  if not product:
    raise HTTPException(status_code=404, detail='없는 상품입니다.')

  comment = Comment(product_id=product_id, user_id=user.id, content=data.content)
  db.add(comment)
  db.commit()

  return CommentOut(
    id=comment.id,
    content=comment.content,
    created_at=comment.created_at,
    updated_at=comment.updated_at,
    user_id=user.id,
    username=user.username,
  )
