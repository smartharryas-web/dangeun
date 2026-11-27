from fastapi import FastAPI
from routers import auth, products
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origins=['http://localhost:5173'],
  allow_headers=['Authorization'],
  allow_credentials=True,
  allow_methods=['*'],
)

app.include_router(auth.router)
app.include_router(products.router)
