from fastapi import APIRouter
from sqlalchemy import select, update
from schemas import NotificationOut
from deps import SessionDep, CurrentUserDep
from models import Notification

router = APIRouter(prefix='/api/notifications', tags=['notifications'])


# 알림 하나 넣기 (찜 · 댓글 · 가격 제안 · 후기 · 팔로우 등에서 부른다, commit은 부른 쪽이 한다)
def notify(db, user_id: int, message: str, link: str):
  db.add(Notification(user_id=user_id, message=message, link=link))


# 내 알림 (최근 50개)
@router.get('', response_model=list[NotificationOut])
def my_notifications(db: SessionDep, user: CurrentUserDep):
  return db.scalars(
    select(Notification).where(Notification.user_id == user.id).order_by(Notification.id.desc()).limit(50)
  ).all()


# 내 알림 전부 읽음으로 (알림 화면을 열 때 부름)
@router.post('/read-all', status_code=204)
def read_all(db: SessionDep, user: CurrentUserDep):
  db.execute(update(Notification).where(Notification.user_id == user.id).values(is_read=True))
  db.commit()
