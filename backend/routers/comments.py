from datetime import datetime
from fastapi import APIRouter, HTTPException
from schemas import CommentOut, CommentUpdate
from deps import SessionDep, CurrentUserDep
from models import Comment
from sqlalchemy import select

router = APIRouter(prefix='/api/comments', tags=['comments'])


@router.patch('/{comment_id}', response_model=CommentOut)
def update_comment(comment_id: int, data: CommentUpdate, db: SessionDep, user: CurrentUserDep):
  comment = db.scalar(select(Comment).where(Comment.id == comment_id))

  if not comment:
    raise HTTPException(status_code=404, detail='없는 댓글입니다.')

  if comment.user_id != user.id:
    raise HTTPException(status_code=403, detail='내 댓글만 고칠 수 있습니다.')

  comment.content = data.content
  comment.updated_at = datetime.now()
  db.commit()

  return CommentOut(
    id=comment.id,
    content=comment.content,
    created_at=comment.created_at,
    updated_at=comment.updated_at,
    user_id=user.id,
    username=user.username,
  )


@router.delete('/{comment_id}', status_code=204)
def delete_comment(comment_id: int, db: SessionDep, user: CurrentUserDep):
  comment = db.scalar(select(Comment).where(Comment.id == comment_id))

  if not comment:
    raise HTTPException(status_code=404, detail='없는 댓글입니다.')

  if comment.user_id != user.id:
    raise HTTPException(status_code=403, detail='내 댓글만 지울 수 있습니다.')

  db.delete(comment)
  db.commit()
