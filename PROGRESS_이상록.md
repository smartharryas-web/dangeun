역할: ProductDetail.jsx (상품 상세) 담당

## 데이터 모델링
목표: 필수 기능 다섯에 필요한 표 · 칸 · 관계를 정해 SPEC 데이터 모델에 적는다
지금: 팀이 products · likes 표를 main에 올림 → 이 단계는 팀 쪽에서 진행됨, 내 담당 기능으로 넘어감

1. 나누기 — 상품 정보 후보: 제목 · 가격 · 설명 · 사진 · 판매 상태 · 올린(수정) 날짜 · 좋아요 수 · 채팅 수 · 지역 · 조회 수 · 댓글 수
2. 순서 — 좋아요 수를 칸으로 저장할지(A 칸 / B 별도 표에서 세기)는 나중에, 먼저 표 채우기 (학생: 지금은 표를 채워야 해서)
3. 나누기 — products 칸 이름 제안(title · price · description · image_url · status · region · view_count · created_at · updated_at · seller_id)은 일단 넘어감, 표 목록부터
4. 나누기 — 표 후보: products, likes(찜 저장용) — 학생이 말함

## 댓글 (추가 기능: 문의 댓글)
목표: 상품 상세의 이미지 아래에 댓글이 보인다
지금: 댓글 수정 · 삭제 화면 확인 후 main에 합치기

1. 위치 — 상품 상세 화면, 이미지 아래
2. 나누기 — 새 표 comments가 필요, 칸 후보: id · product_id · user_id · content · time (학생)
3. 확인 — Claude가 origin에 댓글 작업이 없음을 확인, 최신 main(temp_products 리비전)을 받아 alembic upgrade head 실행
4. 이름 — 표 comments, 칸 id · product_id · user_id · content · created_at (time은 products와 같은 created_at으로)
5. 코드 — SPEC 데이터 모델에 comments 줄, models.py에 Comment, 리비전 7e85a25580b6(팀원 595e9294c54a 뒤에 이어짐), alembic upgrade head 적용 (Claude가 DB에서 표 확인)
6. 순서 — DB 층은 올리지 않고 내 컴에서 먼저 시험 (학생: 일단 DB 만들고 내 컴에서 먼저 시험)
7. 위치 — 이미지 바로 아래에 "댓글" 글자, 그 아래 빈 텍스트 박스 + 오른쪽에 제출 버튼, 댓글은 시간순으로 위에서 아래
8. 순서 — 박스 안 흐린 글씨 "댓글을 남기려면 로그인이 필요합니다.", 로그인 안 됐으면 클릭 시 로그인 창으로, 됐으면 입력 후 제출하면 작성
9. 코드 — 이미지와 댓글 영역을 왼쪽 div로 묶고, "댓글" 글자 · input(placeholder) · 제출 버튼 뼈대(동작 없음)
10. 위치 — 상세는 지금처럼 로그인한 사람만 보게 두고(RequireLogin 그대로, 서버 로그인 필수도 그대로) 로그인 안내 문구는 뺌 (학생: 혹시 서버 에러가 날 수 있어서)
11. 코드 — input의 placeholder 삭제
12. 순서 — 가짜 댓글 없이 바로 진짜 댓글 목록으로(B) → 서버 주소부터 필요 (Claude가 서버에 댓글 주소가 없음을 미리 말함)
13. 약속 — 댓글 목록 주소는 GET /api/products/{product_id}/comments (A: 상품 주소 아래에 붙이기, B: /api/comments?product_id= 중 A)
14. 약속 — 응답은 시간순(오래된 것부터) 목록 [{id · content · created_at · user_id · username}], 없으면 [], 401 · 404, SPEC에 적음
15. 코드 — schemas.py에 CommentOut, routers/products.py에 GET /{product_id}/comments(상품 없으면 404, 댓글마다 users에서 username 조회), SPEC 기능 · 주소 · 주소 약속 · 서버 import 확인(Claude)
16. 위치 — 댓글 목록은 빈 텍스트박스 · 제출 버튼 아래, 시간순, 내 댓글이면 수정 · 삭제 (학생이 말함)
17. 코드 — comments state + 목록을 서버에서 받는 useEffect, 댓글마다 "작성자 내용" 한 줄, 내 댓글(user.id === comment.user_id)이면 수정 · 삭제 버튼(동작 없음)
18. 순서 — 확인용 댓글이 없어서 수정 · 삭제보다 작성(제출)을 먼저 (Claude 추천 선택지 중 학생이 고름)
19. 약속 — POST /api/products/{product_id}/comments, 요청 {content}, 응답 201 댓글 하나(목록의 한 개와 같은 모양), 401 · 404 · 422(빈 내용), SPEC에 적음
20. 코드 — schemas.py에 CommentCreate(min_length=1), routers/products.py에 POST 댓글 쓰기(상품 없으면 404, 로그인한 사람으로 저장), 서버 import 확인(Claude)
21. 확인 — 학생이 /docs에서 댓글 쓰기가 잘 된다고 말함
22. 코드 — commentText state, input을 value · onChange로 묶고, 제출 버튼 onClick으로 POST(JSON) 후 받은 댓글을 목록 끝에 붙이고 박스 비움, 빈 내용이면 요청하지 않음
23. 순서 — 댓글 수정보다 삭제를 먼저
24. 나누기 — 댓글 삭제는 상품 삭제처럼 "정말 삭제할까요?" 확인창을 먼저 띄움(B, 바로 삭제 A 중)
25. 코드 — deleteCommentId state(지울 댓글 번호, 없으면 null), 댓글 삭제 버튼이 번호를 담아 확인창을 켬, 확인(동작 없음) · 취소(null로 끔)
26. 약속 — DELETE /api/comments/{comment_id}, 내 댓글만, 응답 204, 실패 401 · 403(남의 댓글) · 404, SPEC에 적음
27. 코드 — routers/comments.py 새 파일(DELETE, 없으면 404, 남의 댓글이면 403) + main.py에 include_router, 서버 import 확인(Claude)
28. 코드 — 확인창 "확인"에 deleteComment 연결: DELETE 요청 후 목록에서 그 댓글을 빼고(filter) 확인창을 끔 (확인 말 없음: /docs 확인 여부)
29. 위치 — 댓글 수정: 수정을 누르면 그 댓글 내용이 텍스트 박스로 옮겨 오고, 제출하면 댓글 오른쪽에 "수정됨" 표시 (학생이 말함). 삭제 화면 확인 말 없음
30. 출처 — "수정됨"은 comments에 updated_at 칸(수정 전엔 비어 있음)을 더해서 기억 (A: updated_at / B: is_edited 중 A)
31. 코드 — SPEC 데이터 모델 comments 줄에 updated_at, models.py Comment에 updated_at(None 가능), 리비전 80422b51d251(7e85a25580b6 뒤), alembic upgrade head 적용 (Claude가 DB에서 칸 확인)
32. 다듬기 — 수정 안 한 댓글에도 오른쪽에 시간 표시 (학생이 말함, 형식은 정할 차례). DB 층을 올릴지 질문은 아직 답 없음
33. 다듬기 — 시간 형식은 짧게 "11/27 14:30" (A: 짧게 / B: 연도까지 중 A)
34. 코드 — formatTime 함수(Date로 월/일 시:분), 댓글 한 줄 오른쪽에 created_at을 그 모양으로 표시(수정됨 표시는 수정 기능 때)
35. 순서 — DB 층(comments 표 · updated_at)을 지금 올리기로 (학생: 지금 올려), 커밋 이름: 상품 상세에 댓글 기능 추가 (목록 · 쓰기 · 삭제, comments 표)
36. 충돌 — main.py(팀원 tempMemory · /uploads + 내 comments), 둘 다 살림
37. 확인 — 합친 뒤 서버 import · 주소 10개(댓글 3종 포함) · vite build 통과(Claude가 확인)
38. 순서 — 수정까지 다 만든 뒤 main에 합치기 (학생: 수정 다 만들고 합치자)
39. 약속 — PATCH /api/comments/{comment_id}, 요청 {content}, 응답 200 고친 댓글, 401 · 403 · 404 · 422, 댓글 응답 전체에 updated_at(수정 전 null) 추가, SPEC에 적음
40. 코드 — schemas.py에 CommentUpdate · CommentOut.updated_at, comments.py에 PATCH(updated_at에 지금 시간), products.py 목록 · 쓰기 응답에 updated_at, 서버 import 확인(Claude)
41. 확인 — 학생이 /docs에서 PATCH 응답(고침, updated_at 채워짐)을 확인했다고 붙여 줌
42. 코드 — editCommentId state(고치는 중인 댓글 번호, 없으면 null), 수정 버튼이 번호를 담고 내용을 위쪽 텍스트 박스에 채움, 제출은 editCommentId가 있으면 PATCH 후 그 댓글만 바꿈, 댓글 오른쪽은 updated_at이 있으면 "수정됨" 없으면 시간
43. 나누기 — 수정 중 빠져나올 방법으로 수정 중일 때만 제출 옆에 "취소" 버튼
44. 코드 — editCommentId가 있을 때만 취소 버튼, 누르면 editCommentId를 null로 · 박스를 비움

## 내 글 수정 · 삭제 (삭제는 서버 주소 단계에서 멈춤)
목표: 상품 상세 화면에서 내 글이면 수정 · 삭제가 나온다
지금: 확인을 누르면 서버에 삭제를 요청할 주소 정하기

1. 위치 — 상품 상세 화면(ProductDetail.jsx)의 내 글일 때 (학생: 자기 글에는 수정 · 삭제가 나오게)
2. 순서 — 수정: 누르면 /product/숫자/edit으로 이동, 기존 정보가 상품 올리기 폼에 채워져 보이고 거기에 수정 · 취소 버튼 (상품 올리기 폼은 팀원이 아직 미구현)
3. 순서 — 삭제: 누르면 정말 삭제할지 묻고(확인 · 취소), 확인이면 삭제 후 Home으로, 취소면 원래 상세로
4. 순서 — 버튼부터 화면에 보이게(A), 삭제 끝까지(B)는 뒤로
5. 코드 — ProductDetail.jsx에 isMine 변수, 내 글일 때만 수정(btn-outline-secondary) · 삭제(btn-outline-danger) 버튼(동작 없음)
6. 순서 — 수정부터, 학생이 직접 코드 작성(Claude는 힌트만)
7. 약속 — 수정 버튼은 button 대신 Link로 /product/{id}/edit 이동
8. 에러 — 학생 코드에서 Link를 import하지 않았고 to가 /api/products/{id}로 잘못 적혀 있었음 → import 추가, to를 /product/{id}/edit으로 고침
9. 확인 — 수정 버튼이 안 보인 건 내 글이 아니어서였음(학생이 확인), 이동 확인 말 없음
10. 순서 — 이어서 삭제 기능 (확인창 → 서버 삭제 → Home)
11. 나누기 — 삭제 확인창은 브라우저 기본창(A)이 아니라 Bootstrap 모달(B)을 화면 안에 직접 만들기, 디자인 요소는 최대한 뺌
12. 코드 — showConfirm state 추가, 삭제 버튼 onClick으로 켜기, modal d-block 안에 "정말 삭제할까요?" + 확인(동작 없음) · 취소(끄기)

## 상품 상세
목표: 상품 목록에서 상품을 눌러 들어가면 상세 화면(ProductDetail.jsx)이 보인다
지금: 끝 — 남은 다듬기: 서버 꺼짐 같은 다른 에러 표시, 사진 보내 주기(상품 올리기 때), 수정 · 삭제 버튼(아이디어), 커밋 · 올리기

1. 위치 — 담당은 ProductDetail.jsx, 목록에서 상품을 클릭해 들어가는 화면
2. 순서 — 상세 화면에 보일 것: title · image · price · content · place · status · user_id, 좋아요는 나중에
3. 약속 — 화면 주소 /product/:id (id는 상품 번호), 로그인 필요(Home과 같은 묶음)
4. 코드 — routes/ProductDetail.jsx 새 파일("상품 상세" 글자만) + App.jsx에 Route와 import 추가
5. 순서 — 가짜 데이터 없이 바로 진짜 데이터로
6. 에러 — 학생이 frontend/routes/에 ProductDetail.jsx를 또 만듦(src 밖, return 뒤가 빔) → frontend/src/routes/ 것 하나만 쓰기로 함(frontend/routes/ 것은 학생이 직접 지우기)
7. 출처 — 학생이 "DB에 바로 연결하면 되나?" 물음 → 화면은 서버를 거쳐야 한다고 설명 / /docs에서 찾아 학생이 auth밖에 없음을 확인 (Claude가 origin/main · origin/harry에서도 상품 주소 없음 확인)
8. 순서 — 서버 주소는 만들지 않고 가짜 데이터로 먼저, 나중에 팀원이 ProductList 만들 때 진짜 데이터 연결 (학생: 다른 팀원이 ProductList 만들 때 연결하면 될 것 같아서)
9. 약속 — 가짜 상품 칸 이름은 SPEC products와 같게: id · title · price · description · image_url · location · status · seller_id · created_at (학생이 SPEC과 비교해 정정: content→description, place→location, user_id→seller_id, image→image_url)
10. 코드 — ProductDetail.jsx에 가짜 product 객체 하나 + title만 화면에 출력
11. 순서 — 이미지부터 화면에 그리기
12. 에러 — 학생이 쓴 img src={image_url}은 변수가 없어 에러 → product.image_url로 고침
13. 다듬기 — 이미지는 각진 네모, 512x512
14. 코드 — img에 width·height 512, style objectFit cover, alt 추가
15. 다듬기 — 배치: 사진은 왼쪽, 제목 · 가격(제목 아래)은 사진 오른쪽
16. 코드 — Bootstrap d-flex gap-4로 사진 | (제목 h2, 가격 p) 두 칸으로 나눔
17. 다듬기 — 가격 아래에 설명, 판매 상태, 지역 순으로 (오른쪽 칸 안)
18. 코드 — 오른쪽 div에 description · status · location을 p로 추가
19. 다듬기 — 판매자 아이디도 보여 줌, 내 글이면 수정 · 삭제 버튼을 두기로 (SPEC 필수에는 없는 추가 기능)
20. 코드 — "판매자: seller_id"를 p로 추가
21. 다듬기 — 수정 · 삭제는 아이디어로만 두고 나중에 채우기. 판매자 아이디는 모두에게 보이되, 내 아이디면 아이디 대신 "내가 쓴 글" 표시
22. 출처 — 로그인한 사람을 어디서 볼지는 학생이 모름
23. 출처 — useAuth()의 user에서 꺼내 쓰기 (학생이 맡김은 아님: 선택지 A(useAuth) · B(직접 /api/auth/me 요청) 중 A를 고름)
24. 코드 — useAuth import, user.id === product.seller_id면 "내가 쓴 글", 아니면 "판매자: seller_id"
25. 다듬기 — 판매자는 숫자(seller_id)가 아니라 아이디(username)가 보이게
26. 약속 — 상품 응답에 seller_username 칸을 추가(A: 칸 하나 더, B: seller 객체 중 A를 고름). 서버 담당과 맞춰야 함
27. 코드 — 가짜 데이터에 seller_username: 'minsu' 추가, 화면은 "판매자: seller_username"(내 글 비교는 seller_id 그대로)
28. 약속 — seller_username은 A로 그대로(B로 바꿀지 물었으나 A 유지)
29. 순서 — 진짜 데이터 연결 시작. origin/main에도 상품 주소 없음(Claude 확인) → 역할 밖 일이라 SPEC 초안 작성
30. 약속 — SPEC에 GET /api/products/{product_id} 초안(로그인 필요 · 응답 칸은 가짜 데이터와 같음 · 401/404)
31. 위치 — 서버 주소는 팀원에게 맡기지 않고 학생이 직접 만들기로 (겹칠 수 있음을 Claude가 말함)
  32. 코드 — backend/schemas.py에 ProductOut 추가(SPEC 응답 칸과 같게, created_at은 datetime)
33. 출처 — 판매자 아이디는 서버에서 users 표를 한 번 더 조회(A, models.py를 안 건드려 팀원과 겹침이 적어서) (학생: A가 팀원이랑 맞출 게 더 적어서)
34. 코드 — routers/products.py 새 파일(GET /api/products/{product_id}, 로그인 필요, 없으면 404) + main.py에 include_router
35. 확인 — 학생이 DB에 상품 3개(초코칩 · 갤럭시 · 양말)가 있다고 말함, 화면은 아직 가짜 자전거 (확인 말 없음: /docs 확인 여부)
36. 코드 — ProductDetail.jsx의 가짜 데이터를 지우고 useParams로 id → useEffect + authApi로 /api/products/{id} 요청 → useState에 담기, 받기 전에는 "불러오는 중..."
37. 확인 — 학생이 1 · 2 · 3번 상품이 잘 나온다고 말함
38. 다듬기 — 없는 상품 번호로 가면 404 에러 문구로 "잘못된 경로"라고 알려 주기
39. 코드 — try/catch로 404면 notFound를 true로 → "404 에러: 잘못된 경로입니다." 출력
40. 다듬기 — 숫자가 아닌 경로는 "잘못된 경로입니다.", 숫자인데 없는 상품은 "없는 게시물입니다."(삭제된 게시물은 서버가 구분 못 해서 "없는"으로)
41. 코드 — notFound를 errorMessage로 바꿈: 404면 "없는 게시물입니다.", 422(숫자 아님)면 "잘못된 경로입니다."
42. 코드 — 상품 상세 화면 + 서버 주소를 sangrok에 커밋·push (커밋 이름: 상품 상세 화면과 상품 하나 가져오기 서버 주소 추가)
43. 충돌 — main.py(팀원 ProdList + 내 products), 둘 다 살림
44. 충돌 — schemas.py ProductOut 이름이 겹침(팀원: 목록용 / 나: 상세용) → 팀원 ProductOut은 그대로 두고 내 것을 ProductDetailOut으로 바꿈 (학생: 팀원거에 맞추자), products.py도 따라 바꿈
45. 확인 — 합친 뒤 서버 import · 주소 2개(/api/products, /api/products/{product_id}) · vite build 통과(Claude가 확인)
46. 코드 — 합치기 커밋을 sangrok에 push
47. 이름 — 팀원 목록은 백엔드 ProdList.py, 프론트는 Home.jsx + Product.jsx임을 확인 / 이름 차이는 그냥 두기로
