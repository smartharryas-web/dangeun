# SPEC

## 진행

| 단계 | 어떻게 | 끝 |
| --- | --- | --- |
| 1. 데이터 모델링 | **팀이 한 컴퓨터에서 같이**: 아래 `데이터 모델` 표를 채우고 → 모델 · 리비전 · `seed.py`(상품 몇 개) → main에 올림 → 모두 pull · `alembic upgrade head` · `uv run python seed.py` | 모두의 DB에 같은 표와 상품이 있다 |
| 2. 필수 기능 | `기능` 표의 `담당`을 나누고 각자 자기 브랜치에서. 하나 끝날 때마다 main에 합치고 팀원에게 알림 → 팀원은 pull | 필수 다섯이 main에서 돈다 |
| 3. 확장 | 팀이 같이 추가 기능을 고르고 `기능` 표에 더함. 새 표 · 칸이 필요하면 1처럼 같이 정함 → 2처럼 나눔 | 팀이 정함 |

## 데이터 모델

| 표 | 칸 | 이어지는 곳 |
| --- | --- | --- |
| users | id · username · password_hash | — (시작 저장소에 있음) |
| refresh_tokens | 로그인 유지용 | users (시작 저장소에 있음) |
| products | id · title · price · description · image_url · location · status · seller_id · created_at | seller_id → users |
| likes | id · user_id · product_id | user_id → users · product_id → products |
| temp_products | id · user_id · title · category · price · description · location · image_url | user_id → users (사용자마다 하나 — unique) |

## 기능

| 기능 | 구분 | 담당 | 상태 |
| --- | --- | --- | --- |
| 상품 목록 (사진 · 제목 · 가격 · 판매 상태) | 필수 | 심병규 | 끝 (사진은 임시) |
| 상품 상세 | 필수 | 이상록 | 끝 (사진은 임시) |
| 상품 올리기 + 사진 | 필수 | 한희 | 끝 (사진은 첫 한 장만 저장 · 카테고리는 저장 안 함) |
| 찜 토글 | 필수 | | |
| 판매 상태 바꾸기 (판매중 → 예약중 → 판매완료, 내 상품만) | 필수 | | |
| | 추가 | | |

추가 기능 예: 문의 댓글 · 판매자 페이지 · 10개씩 · 정렬 · 카테고리 · 팀이 생각한 것

## 주소

| 메서드 | 주소 | 하는 일 | 담당 |
| --- | --- | --- | --- |
| GET | /api/products | 상품 목록 (로그인 없이 누구나) | 심병규 |
| GET | /api/products/{product_id} | 상품 하나 가져오기 (상세 화면) | 이상록 |
| POST | /api/tempMemory | 상품 올리기 임시저장하기 (로그인 필요) | 한희 |
| GET | /api/tempMemory | 임시저장 불러오기 (로그인 필요) | 한희 |
| DELETE | /api/tempMemory | 임시저장 지우기 (로그인 필요) | 한희 |
| POST | /api/products | 상품 올리기 (로그인 필요) | 한희 |

## 주소 약속

### 상품 목록
- 주소: GET /api/products (로그인 필요 없음)
- 응답 200: 상품 목록 — [{"id": 2, "title": "갤럭시 s23", "price": 1230000, "image_url": "/uploads/galaxy.jpg", "location": "홍제역", "status": "판매중", "created_at": "2026-10-10T00:00:00"}, ...]
- 화면: 상품 칸을 누르면 /product/{상품번호}로 이동 (상세 담당 요청)
- 정한 사람: 심병규
- 상태: 만듦(main) → 연결됨

### 상품 하나 가져오기
- 주소: GET /api/products/{product_id} (로그인 필요)
- 요청: 없음 (주소의 product_id가 상품 번호)
- 응답 200: 상품 하나 — {"id": 1, "title": "자전거 팝니다", "price": 50000, "description": "2년 탔어요. 상태 좋아요.", "image_url": "https://...", "location": "역삼동", "status": "판매중", "seller_id": 1, "seller_username": "minsu", "created_at": "2026-11-27T10:00:00"}
- 실패: 401 로그인 안 함 · 404 없는 상품
- 정한 사람: 이상록(프론트 · 서버 둘 다 직접 만듦)
- 상태: 만듦(main) → 연결됨

### 임시저장하기
- 주소: POST /api/tempMemory (로그인 필요)
- 요청: 사진(최대 10장) · title(상품명) · category — 사진 파일이 들어가서 글자 묶음(JSON)이 아니라 파일을 함께 보내는 양식(form-data)으로 보냄
- 응답 201: 저장된 임시저장 — {"title": "자전거", "category": "기타", "images": ["/uploads/temp/1.jpg"]}
- 실패: 401 로그인 안 함 · 409 이미 임시저장이 있음 (사용자마다 하나) · 400 사진이 10장 넘음
- 정한 사람: 한희(프론트 · 서버 둘 다 직접 만듦)
- 상태: 만듦(main) → 연결됨

### 임시저장 불러오기
- 주소: GET /api/tempMemory (로그인 필요 · 내 것만)
- 응답 200: 임시저장 — {"title": "자전거", "category": "기타", "images": ["/uploads/temp/1.jpg"]}
- 실패: 401 로그인 안 함 · 404 임시저장이 없음 (화면은 이때 팝업을 띄우지 않음)
- 정한 사람: 한희(프론트 · 서버 둘 다 직접 만듦)
- 상태: 만듦(main) → 연결됨

### 임시저장 지우기
- 주소: DELETE /api/tempMemory (로그인 필요 · 내 것만)
- 응답 204: 내용 없음 (화면이 불러오기 팝업에서 "네"를 누를 때 부름)
- 실패: 401 로그인 안 함 · 404 임시저장이 없음
- 정한 사람: 한희(프론트 · 서버 둘 다 직접 만듦)
- 상태: 만듦(main) → 연결됨

### 상품 올리기
- 주소: POST /api/products (로그인 필요)
- 요청: 파일을 함께 보내는 양식(form-data) — images(사진, 1~10장, 저장은 첫 번째 한 장만) · title · price · description · location (category는 products에 칸이 없어 저장하지 않음)
- 자동으로 채움: status("판매중") · seller_id(로그인한 사람) · created_at(올린 순간)
- 응답 201: 올라간 상품 하나 (상품 상세와 같은 모양) — {"id": 4, "title": "자전거", "price": 50000, "description": "...", "image_url": "/uploads/products/1f3c...jpg", "location": "홍제역", "status": "판매중", "seller_id": 1, "seller_username": "asdf", "created_at": "..."}
- 실패: 401 로그인 안 함 · 400 사진이 없거나 10장 넘음 · 422 빠진 값
- 화면 부탁(병규 · 상록): 올린 사진의 image_url은 `/uploads/products/`로 시작하고 서버(8000번)에 있어요. `Product.jsx` · `ProductDetail.jsx`에서 이 주소는 앞에 `SERVER_URL`(api.js)을 붙여서 보여 주세요. 시드 사진(`/uploads/choco.jpg` 등)은 그대로예요.
- 정한 사람: 한희(서버 · 등록 화면). 화면 부탁은 병규 · 상록과 정해야 함
- 상태: 만듦(main) → 연결됨 (화면 부탁은 병규 · 상록 확인 필요)
