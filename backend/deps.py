from fastapi import Depends, HTTPException
from pwdlib import PasswordHash
from sqlalchemy.orm import Session
from typing import Annotated
from database import engine
from models import User
import jwt
from datetime import datetime, timedelta, timezone
from fastapi.security import OAuth2PasswordBearer
from config import settings

password_hash = PasswordHash.recommended()

def get_db():
  with Session(engine) as db:
    yield db

SessionDep = Annotated[Session, Depends(get_db)]


SECRET_KEY = settings.SECRET_KEY
ALGORITHM = 'HS256'

def create_access_token(user_id: int):
  exp = datetime.now(timezone.utc) + timedelta(minutes=30)
  return jwt.encode({'sub': str(user_id), 'exp': exp}, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(user_id: int, jti: str):
  exp = datetime.now(timezone.utc) + timedelta(days=14)
  return jwt.encode({'sub': str(user_id), 'exp': exp, 'type': 'refresh', 'jti': jti}, SECRET_KEY, algorithm=ALGORITHM)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/api/auth/login')

def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: SessionDep):
  try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
  except jwt.InvalidTokenError:
    raise HTTPException(status_code=401, detail='토큰이 올바르지 않습니다.', headers={'WWW-Authenticate': 'Bearer'})

  # refresh token으로는 들어오지 못한다
  if payload.get('type') == 'refresh':
    raise HTTPException(status_code=401, detail='토큰이 올바르지 않습니다.', headers={'WWW-Authenticate': 'Bearer'})

  user = db.get(User, int(payload['sub']))

  if user is None:
    raise HTTPException(status_code=401, detail='없는 사용자입니다.', headers={'WWW-Authenticate': 'Bearer'})

  return user

CurrentUserDep = Annotated[User, Depends(get_current_user)]
