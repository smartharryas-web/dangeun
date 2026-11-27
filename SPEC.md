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

## 기능

| 기능 | 구분 | 담당 | 상태 |
| --- | --- | --- | --- |
| 상품 목록 (사진 · 제목 · 가격 · 판매 상태) | 필수 | 심병규 | 끝 (사진은 임시) |
| 상품 상세 | 필수 | 이상록 | 끝 (사진은 임시) |
| 상품 올리기 + 사진 | 필수 | | |
| 찜 토글 | 필수 | | |
| 판매 상태 바꾸기 (판매중 → 예약중 → 판매완료, 내 상품만) | 필수 | | |
| | 추가 | | |

추가 기능 예: 문의 댓글 · 판매자 페이지 · 10개씩 · 정렬 · 카테고리 · 팀이 생각한 것

## 주소

| 메서드 | 주소 | 하는 일 | 담당 |
| --- | --- | --- | --- |
| GET | /api/products | 상품 목록 (로그인 없이 누구나) | 심병규 |
| GET | /api/products/{product_id} | 상품 하나 가져오기 (상세 화면) | 이상록 |

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
