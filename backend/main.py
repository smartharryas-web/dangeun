from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from routers import auth, products, ProdList, comments, tempMemory, newProduct, likes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origins=['http://localhost:5173', 'http://localhost:5174'],
  allow_headers=['Authorization', 'Content-Type'],
  allow_credentials=True,
  allow_methods=['*'],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(ProdList.router)
app.include_router(comments.router)
app.include_router(tempMemory.router)
app.include_router(newProduct.router)
app.include_router(likes.router)

# 올린 사진을 /uploads 주소로 보여 준다
UPLOAD_ROOT = Path(__file__).resolve().parent / 'uploads'
UPLOAD_ROOT.mkdir(exist_ok=True)
app.mount('/uploads', StaticFiles(directory=UPLOAD_ROOT), name='uploads')
