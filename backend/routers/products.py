from fastapi import APIRouter, HTTPException
from schemas import ProductDetailOut, CommentOut, CommentCreate
from deps import SessionDep, CurrentUserDep
from models import Product, User, Comment
from sqlalchemy import select

router = APIRouter(prefix='/api/products', tags=['products'])


# 상품 상세: 로그인 없이 누구나 (상품 목록처럼)
@router.get('/{product_id}', response_model=ProductDetailOut)
def get_product(product_id: int, db: SessionDep):
  product = db.scalar(select(Product).where(Product.id == product_id))

  if not product:
    raise HTTPException(status_code=404, detail='없는 상품입니다.')

  seller = db.scalar(select(User).where(User.id == product.seller_id))

  return ProductDetailOut(
    id=product.id,
    title=product.title,
    price=product.price,
    description=product.description,
    image_url=product.image_url,
    location=product.location,
    status=product.status,
    seller_id=product.seller_id,
    seller_username=seller.username,
    created_at=product.created_at,
  )


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
