from fastapi import APIRouter, HTTPException, Depends, Response, Cookie
from schemas import UserCreate, UserOut, Token
from deps import SessionDep, password_hash, create_access_token, create_refresh_token, CurrentUserDep, SECRET_KEY, ALGORITHM
from models import User, RefreshToken
from sqlalchemy import select
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated
import jwt
import uuid

router = APIRouter(prefix='/api/auth', tags=['auth'])

@router.post('/signup', response_model=UserOut, status_code=201)
def signup(data: UserCreate, db: SessionDep):
  user = db.scalar(select(User).where(User.username == data.username))
  
  if user:
    raise HTTPException(status_code=409, detail='사용중인 아이디입니다.')
  
  hashed_pw = password_hash.hash(data.password)
  user = User(username=data.username, password_hash=hashed_pw)
  db.add(user)
  db.commit()

  return user


@router.post('/login', response_model=Token)
def login(form: Annotated[OAuth2PasswordRequestForm, Depends()] , db: SessionDep, response: Response):
  user = db.scalar(select(User).where(User.username == form.username))

  # 유저가 없거나 비밀번호가 일치하지 않는다면
  if user is None or not password_hash.verify(form.password, user.password_hash):
    raise HTTPException(status_code=401, detail='아이디 또는 비밀번호가 틀렸습니다.')

  # 장부에 한 줄 적기
  jti = uuid.uuid4().hex
  db.add(RefreshToken(id=jti, user_id=user.id))
  db.commit()

  # refresh token은 httpOnly 쿠키로
  response.set_cookie(
    'refresh_token',
    create_refresh_token(user.id, jti),
    httponly=True,
    samesite='lax',
    max_age=60 * 60 * 24 * 14,
    path='/api/auth',
  )
  token = create_access_token(user.id)

  return {'access_token': token, 'token_type': 'bearer'}


@router.post('/refresh', response_model=Token)
def refresh(db: SessionDep, refresh_token: Annotated[str | None, Cookie()] = None):
  if refresh_token is None:
    raise HTTPException(status_code=401, detail='로그인이 필요합니다.')
  try:
    payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
  except jwt.InvalidTokenError:
    raise HTTPException(status_code=401, detail='다시 로그인해 주세요.')

  user = db.get(User, int(payload['sub']))
  if payload.get('type') != 'refresh' or user is None:
    raise HTTPException(status_code=401, detail='다시 로그인해 주세요.')

  # 장부에 없으면(로그아웃한 토큰) 안 된다
  if db.get(RefreshToken, payload.get('jti')) is None:
    raise HTTPException(status_code=401, detail='다시 로그인해 주세요.')

  return {'access_token': create_access_token(user.id), 'token_type': 'bearer'}


@router.post('/logout', status_code=204)
def logout(response: Response, db: SessionDep, refresh_token: Annotated[str | None, Cookie()] = None):
  # 장부에서 그 줄을 지운다
  if refresh_token:
    try:
      payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
      row = db.get(RefreshToken, payload.get('jti'))
      if row:
        db.delete(row)
        db.commit()
    except jwt.InvalidTokenError:
      pass
  response.delete_cookie('refresh_token', path='/api/auth')


@router.get('/me', response_model=UserOut)
def me(user: CurrentUserDep):
  return user

