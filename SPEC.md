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
| products | id · title · price · description · image_url(대표 사진) · location · status · seller_id · created_at · category · condition · brand · tags · negotiable · can_meet · can_ship · shipping_included · has_warranty · view_count · buyer_id · bumped_at | seller_id · buyer_id → users |
| product_images | id · product_id · url · position | product_id → products (상품이 지워지면 같이 지워짐) |
| offers | id · product_id · buyer_id · price · status(대기/수락/거절) · created_at | product_id → products · buyer_id → users |
| chat_rooms | id · product_id · buyer_id · seller_id · created_at (상품 하나에 구매자당 방 하나) | product_id → products · buyer_id · seller_id → users |
| messages | id · room_id · sender_id · content · is_read · created_at | room_id → chat_rooms · sender_id → users |
| notifications | id · user_id · message · link · is_read · created_at | user_id → users (받는 사람) |
| reviews | id · product_id · reviewer_id · seller_id · rating(1~5) · content · created_at (상품 하나에 하나) | product_id → products · reviewer_id · seller_id → users |
| follows | id · follower_id · seller_id | 둘 다 → users |
| reports | id · product_id · reporter_id · reason · created_at | product_id → products · reporter_id → users |
| likes | id · user_id · product_id | user_id → users · product_id → products |
| comments | id · product_id · user_id · content · created_at · updated_at | product_id → products · user_id → users (updated_at은 수정하기 전엔 비어 있음) |
| temp_products | id · user_id · title · category · price · description · location · image_url | user_id → users (사용자마다 하나 — unique) |

## 기능

| 기능 | 구분 | 담당 | 상태 |
| --- | --- | --- | --- |
| 상품 목록 (사진 · 제목 · 가격 · 판매 상태) | 필수 | 심병규 | 끝 (사진은 임시) |
| 상품 상세 | 필수 | 이상록 | 끝 (사진은 임시) |
| 상품 올리기 + 사진 | 필수 | 한희 | 끝 (사진은 첫 한 장만 저장 · 카테고리는 저장 안 함) |
| 찜 토글 | 필수 | 심병규 | 끝 (목록 · 상세 하트, 로그인 안 했으면 로그인 화면으로) |
| 판매 상태 바꾸기 (판매중 → 예약중 → 판매완료, 내 상품만) | 필수 | 심병규 | 끝 (상세에서 내 상품이면 고르는 칸) |
| 문의 댓글 (상품 상세 이미지 아래 · 작성 · 내 댓글 수정 · 삭제) | 추가 | 이상록 | 하는 중 (목록 서버 주소 약속) |
| 상품 수정 · 삭제 (상세의 수정 · 삭제 버튼, 내 상품만) | 추가 | 심병규 | 끝 |
| 목록 다듬기: 동네 · n일 전 · 가격 쉼표 · 받는 중/빈 목록/에러 · 최근 본 상품 · 공유 | 추가 | 심병규 | 끝 |
| 사진 여러 장 (최대 10장 저장 · 넘겨 보기 · 순서 바꾸기 · 끌어다 놓기) | 추가 | 심병규 | 끝 |
| 상품 정보 칸: 카테고리 · 상품 상태 · 브랜드 · 태그 · 가격 제안 받기 · 직거래/택배 · 배송비 포함 · 보증서 있음 · 설명 글자 수 · 거래 안내 | 추가 | 심병규 | 끝 |
| 검색 · 카테고리 메뉴 · 정렬 · 판매완료 빼기 | 추가 | 심병규 | 끝 |
| 조회수 · 카테고리 경로 · 시세 · 비슷한 상품 | 추가 | 심병규 | 끝 |
| 판매자 상점 · 내 찜 목록 | 추가 | 심병규 | 끝 |
| 가격 제안 (판매가 70% 이상, 판매자 수락하면 예약중) | 추가 | 심병규 | 끝 |
| 채팅 (상품마다 1:1, 3초마다 새 메시지 확인) | 추가 | 심병규 | 끝 |
| 알림함 · 메뉴 줄 숫자 딱지 (찜 · 댓글 · 가격 제안 · 후기 · 팔로우 · 새 상품 · 거래 완료) | 추가 | 심병규 | 끝 |
| 거래 후기 · 별점 (판매완료 때 고른 구매자만) | 추가 | 심병규 | 끝 |
| 상점 팔로우 · 신고하기 · 끌어올리기(하루 한 번) | 추가 | 심병규 | 끝 |
| 결제 · 안전결제 · 본인인증 · 실물 검수 · 택배 연동 · 앱 푸시 · AI 가격 추천 | 뺌 | | 외부 계약 · 비용 · 인력이 필요해서 |
| 로고 화면 /intro (사이트를 / 로 새로 열 때 · 누르면 목록 · 시간대별 배경 사진) | 추가 | 심병규 | 끝 |

추가 기능 예: 문의 댓글 · 판매자 페이지 · 10개씩 · 정렬 · 카테고리 · 팀이 생각한 것

## 주소

| 메서드 | 주소 | 하는 일 | 담당 |
| --- | --- | --- | --- |
| GET | /api/products | 상품 목록 (로그인 없이 누구나) | 심병규 |
| GET | /api/products/{product_id} | 상품 하나 가져오기 (상세 화면, 로그인 없이 누구나) | 이상록 |
| GET | /api/products/{product_id}/comments | 상품의 댓글 목록 (로그인 없이 누구나) | 이상록 |
| POST | /api/products/{product_id}/comments | 상품에 댓글 쓰기 (로그인 필요) | 이상록 |
| PATCH | /api/comments/{comment_id} | 댓글 고치기 (로그인 필요 · 내 댓글만) | 이상록 |
| DELETE | /api/comments/{comment_id} | 댓글 지우기 (로그인 필요 · 내 댓글만) | 이상록 |
| POST | /api/tempMemory | 상품 올리기 임시저장하기 (로그인 필요) | 한희 |
| GET | /api/tempMemory | 임시저장 불러오기 (로그인 필요) | 한희 |
| DELETE | /api/tempMemory | 임시저장 지우기 (로그인 필요) | 한희 |
| POST | /api/products | 상품 올리기 (로그인 필요) | 한희 |
| PATCH | /api/products/{product_id} | 상품 고치기 (로그인 필요 · 내 상품만) | 심병규 |
| DELETE | /api/products/{product_id} | 상품 지우기 (로그인 필요 · 내 상품만) | 심병규 |
| POST | /api/products/{product_id}/like | 찜 켜고 끄기 (로그인 필요) | 심병규 |
| PATCH | /api/products/{product_id}/status | 판매 상태 바꾸기 (로그인 필요 · 내 상품만) | 심병규 |
| GET | /api/products/{product_id}/similar | 비슷한 상품 (같은 카테고리, 안 팔린 것 6개) | 심병규 |
| GET | /api/products/{product_id}/market | 시세 (같은 카테고리 판매완료 평균 · 최저 · 최고) | 심병규 |
| GET | /api/users/{user_id} | 판매자 상점 정보 | 심병규 |
| GET | /api/users/me/likes | 내가 찜한 상품 (로그인 필요) | 심병규 |
| GET | /api/users/me/badges | 안 읽은 알림 · 채팅 수 (로그인 필요) | 심병규 |
| POST | /api/users/{user_id}/follow | 상점 팔로우 켜고 끄기 (로그인 필요) | 심병규 |
| GET | /api/users/{user_id}/reviews | 판매자가 받은 후기 | 심병규 |
| POST | /api/products/{product_id}/reviews | 거래 후기 쓰기 (구매자만) | 심병규 |
| POST | /api/products/{product_id}/offers | 가격 제안 (로그인 필요) | 심병규 |
| GET | /api/products/{product_id}/offers | 제안 목록 (판매자는 전부, 나머지는 내 것만) | 심병규 |
| PATCH | /api/offers/{offer_id} | 제안 수락 · 거절 (판매자만) | 심병규 |
| POST | /api/products/{product_id}/chat | 채팅방 열기 (없으면 만듦) | 심병규 |
| GET | /api/products/{product_id}/buyers | 판매완료 때 고를 구매자 후보 (판매자만) | 심병규 |
| GET | /api/chats | 내 채팅방 목록 | 심병규 |
| GET | /api/chats/{room_id} | 채팅방 하나 | 심병규 |
| GET | /api/chats/{room_id}/messages?after_id= | 새 메시지 받기 (받으면 읽음 처리) | 심병규 |
| POST | /api/chats/{room_id}/messages | 메시지 보내기 | 심병규 |
| GET | /api/notifications | 내 알림 50개 | 심병규 |
| POST | /api/notifications/read-all | 알림 전부 읽음 | 심병규 |
| POST | /api/products/{product_id}/bump | 끌어올리기 (내 상품, 24시간에 한 번) | 심병규 |
| POST | /api/products/{product_id}/reports | 신고 (정해진 이유, 한 번만) | 심병규 |

## 주소 약속

### 상품 목록
- 주소: GET /api/products (로그인 필요 없음)
- 응답 200: 상품 목록 — [{"id": 2, "title": "갤럭시 s23", "price": 1230000, "image_url": "/uploads/galaxy.jpg", "location": "홍제역", "status": "판매중", "created_at": "2026-10-10T00:00:00"}, ...]
- 화면: 상품 칸을 누르면 /product/{상품번호}로 이동 (상세 담당 요청)
- 바꿈(심병규): 주소 뒤에 조건을 붙일 수 있음 — ?q=검색어(제목 · 설명 · 브랜드 · 태그) · category= · sort=latest|price_asc|price_desc|likes · exclude_sold=true · seller_id=, 응답에 category도
- 바꿈(심병규): 상품마다 like_count(찜 수) · liked(지금 보는 사람이 찜했는지, 로그인 안 했으면 false)도 줌. 로그인했으면 토큰을 보내야 liked가 맞게 옴 (토큰이 틀리면 401)
- 정한 사람: 심병규
- 상태: 만듦(main) → 연결됨

### 상품 하나 가져오기
- 주소: GET /api/products/{product_id} (로그인 필요 없음 — 바꿈: 심병규, 로그인 없이 상세 구경)
- 요청: 없음 (주소의 product_id가 상품 번호)
- 응답 200: 상품 하나 — {"id": 1, "title": "자전거 팝니다", "price": 50000, "description": "2년 탔어요. 상태 좋아요.", "image_url": "https://...", "location": "역삼동", "status": "판매중", "seller_id": 1, "seller_username": "minsu", "created_at": "2026-11-27T10:00:00"}
- 바꿈(심병규): 상품 목록처럼 like_count · liked도 줌
- 실패: 404 없는 상품
- 정한 사람: 이상록(프론트 · 서버 둘 다 직접 만듦)
- 상태: 만듦(main) → 연결됨

### 상품의 댓글 목록
- 주소: GET /api/products/{product_id}/comments (로그인 필요 없음 — 바꿈: 심병규, 로그인 없이 상세 구경. 쓰기 칸은 로그인한 사람만 보임)
- 응답 200: 댓글 목록, 오래된 것부터(시간순) — [{"id": 1, "content": "아직 팔렸나요?", "created_at": "2026-11-27T14:30:00", "updated_at": null, "user_id": 2, "username": "qwer"}, ...] (댓글이 없으면 빈 목록 [])
- 실패: 404 없는 상품
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
- 이미 임시저장이 있으면: 예전 것(사진 파일 포함)을 지우고 새 내용으로 덮어씀 (사용자마다 하나 — 바꿈: 심병규, 원래 409로 막혀서 불러오기를 취소하면 다시 저장할 수 없었음)
- 실패: 401 로그인 안 함 · 400 사진이 10장 넘음
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
- 바꿈(심병규): 가격은 0 ~ 21조 원 (DB 칸은 BIGINT — 원래 INTEGER라 약 21억이 넘으면 서버가 터졌음), 넘으면 400 "가격은 21조 원까지 입력할 수 있어요."
- 바꿈(심병규): 사진은 1~10장 전부 저장(첫 장이 대표), 칸 추가 — category · condition · brand · tags · negotiable · can_meet · can_ship · shipping_included · has_warranty (title 40자 · description 2000자까지). 상세 응답에 images(사진 주소 목록) · 위 칸 · view_count. 상세를 남이 볼 때마다 조회수 +1
- 자동으로 채움: status("판매중") · seller_id(로그인한 사람) · created_at(올린 순간)
- 응답 201: 올라간 상품 하나 (상품 상세와 같은 모양) — {"id": 4, "title": "자전거", "price": 50000, "description": "...", "image_url": "/uploads/products/1f3c...jpg", "location": "홍제역", "status": "판매중", "seller_id": 1, "seller_username": "asdf", "created_at": "..."}
- 실패: 401 로그인 안 함 · 400 사진이 없거나 10장 넘음 · 422 빠진 값
- 화면 부탁(병규 · 상록): 올린 사진의 image_url은 `/uploads/products/`로 시작하고 서버(8000번)에 있어요. `Product.jsx` · `ProductDetail.jsx`에서 이 주소는 앞에 `SERVER_URL`(api.js)을 붙여서 보여 주세요. 시드 사진(`/uploads/choco.jpg` 등)은 그대로예요.
- 정한 사람: 한희(서버 · 등록 화면). 화면 부탁은 병규 · 상록과 정해야 함
- 상태: 만듦(main) → 연결됨 (화면 부탁은 병규 · 상록 확인 필요)

### 상품 고치기
- 주소: PATCH /api/products/{product_id} (로그인 필요 · 내 상품만)
- 요청: 파일을 함께 보내는 양식(form-data) — title · price · description · location (상품 올리기와 같은 칸, 모두 필수) · images (선택: 넣으면 첫 장으로 사진을 바꾸고, 안 넣으면 원래 사진 그대로)
- 응답 200: 고친 상품 하나 (상품 상세와 같은 모양)
- 실패: 401 로그인 안 함 · 403 남의 상품 · 404 없는 상품 · 400 사진이 10장 넘음 · 422 빠진 값
- 화면: 상세의 "수정" → /product/{상품번호}/edit (원래 내용이 채워진 칸) → 저장하면 상세로
- 판매 상태는 여기서 안 바꿈 (판매 상태 바꾸기 기능에서 따로)
- 정한 사람: 심병규 (상세 담당 이상록 확인 필요)
- 상태: 약속 → 만듦(심병규 브랜치) → 연결됨

### 상품 지우기
- 주소: DELETE /api/products/{product_id} (로그인 필요 · 내 상품만)
- 응답 204: 내용 없음 — 그 상품의 댓글 · 찜도 같이 지움 (댓글 · 찜이 상품 번호를 붙잡고 있어서 먼저 지워야 함), 올린 사진 파일(/uploads/products/)도 지움
- 실패: 401 로그인 안 함 · 403 남의 상품 · 404 없는 상품
- 화면: 상세의 삭제 확인창에서 "확인" → 지우고 목록(/)으로
- 정한 사람: 심병규 (상세 담당 이상록 확인 필요)
- 상태: 약속 → 만듦(심병규 브랜치) → 연결됨

### 찜 켜고 끄기
- 주소: POST /api/products/{product_id}/like (로그인 필요)
- 요청: 없음 — 같은 주소 하나로 켜고 끔 (이미 찜했으면 빼고, 아니면 넣음)
- 응답 200: {"liked": true, "like_count": 3}
- 실패: 401 로그인 안 함 · 404 없는 상품
- 화면: 목록 · 상세의 하트 버튼 (LikeButton). 로그인 안 했으면 로그인 화면으로
- 정한 사람: 심병규
- 상태: 만듦(심병규 브랜치) → 연결됨

### 판매 상태 바꾸기
- 주소: PATCH /api/products/{product_id}/status (로그인 필요 · 내 상품만)
- 요청: {"status": "예약중"} — 판매중 · 예약중 · 판매완료 중 하나
- 바꿈(심병규): 판매완료일 때 buyer_id(이 상품으로 채팅한 사람)를 같이 보낼 수 있음 → 그 사람이 후기를 쓸 수 있고 거래 완료 알림이 감. 채팅 안 한 사람이면 400
- 응답 200: 바뀐 상품 하나 (상품 상세와 같은 모양)
- 실패: 401 로그인 안 함 · 403 남의 상품 · 404 없는 상품 · 422 셋 중 하나가 아님
- 화면: 상세에서 내 상품이면 판매 상태 고르는 칸, 고르면 바로 저장
- 정한 사람: 심병규
- 상태: 만듦(심병규 브랜치) → 연결됨
