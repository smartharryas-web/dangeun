역할: ProductDetail.jsx (상품 상세) 담당

## 데이터 모델링
목표: 필수 기능 다섯에 필요한 표 · 칸 · 관계를 정해 SPEC 데이터 모델에 적는다
지금: 팀이 products · likes 표를 main에 올림 → 이 단계는 팀 쪽에서 진행됨, 내 담당 기능으로 넘어감

1. 나누기 — 상품 정보 후보: 제목 · 가격 · 설명 · 사진 · 판매 상태 · 올린(수정) 날짜 · 좋아요 수 · 채팅 수 · 지역 · 조회 수 · 댓글 수
2. 순서 — 좋아요 수를 칸으로 저장할지(A 칸 / B 별도 표에서 세기)는 나중에, 먼저 표 채우기 (학생: 지금은 표를 채워야 해서)
3. 나누기 — products 칸 이름 제안(title · price · description · image_url · status · region · view_count · created_at · updated_at · seller_id)은 일단 넘어감, 표 목록부터
4. 나누기 — 표 후보: products, likes(찜 저장용) — 학생이 말함

## 내 글 수정 · 삭제
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
