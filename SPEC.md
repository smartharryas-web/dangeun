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
| comments | id · product_id · user_id · content · created_at · updated_at | product_id → products · user_id → users (updated_at은 수정하기 전엔 비어 있음) |
| temp_products | id · user_id · title · category · price · description · location · image_url | user_id → users (사용자마다 하나 — unique) |

## 기능

| 기능 | 구분 | 담당 | 상태 |
| --- | --- | --- | --- |
| 상품 목록 (사진 · 제목 · 가격 · 판매 상태) | 필수 | 심병규 | 끝 (사진은 임시) |
| 상품 상세 | 필수 | 이상록 | 끝 (사진은 임시) |
| 상품 올리기 + 사진 | 필수 | 한희 | 하는 중 (/new 화면, 임시저장 서버 주소 약속) |
| 찜 토글 | 필수 | | |
| 판매 상태 바꾸기 (판매중 → 예약중 → 판매완료, 내 상품만) | 필수 | | |
| 문의 댓글 (상품 상세 이미지 아래 · 작성 · 내 댓글 수정 · 삭제) | 추가 | 이상록 | 하는 중 (목록 서버 주소 약속) |

추가 기능 예: 문의 댓글 · 판매자 페이지 · 10개씩 · 정렬 · 카테고리 · 팀이 생각한 것

## 주소

| 메서드 | 주소 | 하는 일 | 담당 |
| --- | --- | --- | --- |
| GET | /api/products | 상품 목록 (로그인 없이 누구나) | 심병규 |
| GET | /api/products/{product_id} | 상품 하나 가져오기 (상세 화면) | 이상록 |
| GET | /api/products/{product_id}/comments | 상품의 댓글 목록 (로그인 필요) | 이상록 |
| POST | /api/products/{product_id}/comments | 상품에 댓글 쓰기 (로그인 필요) | 이상록 |
| PATCH | /api/comments/{comment_id} | 댓글 고치기 (로그인 필요 · 내 댓글만) | 이상록 |
| DELETE | /api/comments/{comment_id} | 댓글 지우기 (로그인 필요 · 내 댓글만) | 이상록 |
| POST | /api/tempMemory | 상품 올리기 임시저장하기 (로그인 필요) | 한희 |
| GET | /api/tempMemory | 임시저장 불러오기 (로그인 필요) | 한희 |
| DELETE | /api/tempMemory | 임시저장 지우기 (로그인 필요) | 한희 |

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

### 상품의 댓글 목록
- 주소: GET /api/products/{product_id}/comments (로그인 필요)
- 응답 200: 댓글 목록, 오래된 것부터(시간순) — [{"id": 1, "content": "아직 팔렸나요?", "created_at": "2026-11-27T14:30:00", "updated_at": null, "user_id": 2, "username": "qwer"}, ...] (댓글이 없으면 빈 목록 [])
- 실패: 401 로그인 안 함 · 404 없는 상품
- 정한 사람: 이상록(프론트 · 서버 둘 다 직접 만듦)
- 상태: 약속

### 상품에 댓글 쓰기
- 주소: POST /api/products/{product_id}/comments (로그인 필요)
- 요청: {"content": "아직 팔렸나요?"} (쓴 사람은 로그인 정보로 서버가 앎)
- 응답 201: 방금 쓴 댓글 하나 — {"id": 1, "content": "아직 팔렸나요?", "created_at": "2026-11-27T14:30:00", "updated_at": null, "user_id": 2, "username": "qwer"}
- 실패: 401 로그인 안 함 · 404 없는 상품 · 422 내용이 비어 있음
- 정한 사람: 이상록(프론트 · 서버 둘 다 직접 만듦)
- 상태: 약속

### 댓글 고치기
- 주소: PATCH /api/comments/{comment_id} (로그인 필요 · 내 댓글만)
- 요청: {"content": "고친 내용"}
- 응답 200: 고친 댓글 하나 — {"id": 1, "content": "고친 내용", "created_at": "2026-11-27T14:30:00", "updated_at": "2026-11-27T15:10:00", "user_id": 2, "username": "qwer"} (updated_at은 서버가 지금 시간으로 넣음. 화면은 updated_at이 null이 아니면 "수정됨"을 보여 줌)
- 실패: 401 로그인 안 함 · 403 남의 댓글 · 404 없는 댓글 · 422 내용이 비어 있음
- 정한 사람: 이상록(프론트 · 서버 둘 다 직접 만듦)
- 상태: 약속

### 댓글 지우기
- 주소: DELETE /api/comments/{comment_id} (로그인 필요 · 내 댓글만)
- 응답 204: 내용 없음 (화면이 삭제 확인창에서 "확인"을 누를 때 부름)
- 실패: 401 로그인 안 함 · 403 남의 댓글 · 404 없는 댓글
- 정한 사람: 이상록(프론트 · 서버 둘 다 직접 만듦)
- 상태: 약속

### 임시저장하기
- 주소: POST /api/tempMemory (로그인 필요)
- 요청: 사진(최대 10장) · title(상품명) · category — 사진 파일이 들어가서 글자 묶음(JSON)이 아니라 파일을 함께 보내는 양식(form-data)으로 보냄
- 응답 201: 저장된 임시저장 — {"title": "자전거", "category": "기타", "images": ["/uploads/temp/1.jpg"]}
- 실패: 401 로그인 안 함 · 409 이미 임시저장이 있음 (사용자마다 하나) · 400 사진이 10장 넘음
- 정한 사람: 한희(프론트 · 서버 둘 다 직접 만듦)
- 상태: 약속

### 임시저장 불러오기
- 주소: GET /api/tempMemory (로그인 필요 · 내 것만)
- 응답 200: 임시저장 — {"title": "자전거", "category": "기타", "images": ["/uploads/temp/1.jpg"]}
- 실패: 401 로그인 안 함 · 404 임시저장이 없음 (화면은 이때 팝업을 띄우지 않음)
- 정한 사람: 한희(프론트 · 서버 둘 다 직접 만듦)
- 상태: 약속

### 임시저장 지우기
- 주소: DELETE /api/tempMemory (로그인 필요 · 내 것만)
- 응답 204: 내용 없음 (화면이 불러오기 팝업에서 "네"를 누를 때 부름)
- 실패: 401 로그인 안 함 · 404 임시저장이 없음
- 정한 사람: 한희(프론트 · 서버 둘 다 직접 만듦)
- 상태: 약속
