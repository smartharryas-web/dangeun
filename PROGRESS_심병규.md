## 상품 목록
목표: 첫 화면에 상품들이 사진 · 제목 · 가격 · 판매 상태로 보인다 (SPEC 기능 표)
지금: GitHub에 올릴지 정할 차례 (남은 목표: 사진)

1. 위치 — 첫 화면(Home)
2. 위치 — 홈 화면을 따로 두지 않고 `/`에 들어가자마자 상품 목록
3. 나누기 — 상품 하나를 컴포넌트로
4. 이름 — Product (소문자 product는 React가 HTML 태그로 봐서 대문자로)
5. 코드 — components/Product.jsx 새 파일, "상품 하나" 글자만 → Home에서 출력
6. 확인 — (확인 말 없음)
7. 출처 — 상품 정보는 Home이 들고 있다가 Product에 props로 넘겨줌 (장단점 비교 후 고름)
8. 약속 — props는 상품 통째로 하나: `<Product product={상품} />`
9. 코드 — Home에 가짜 상품 하나(fakeProduct, DB 칸 이름 그대로) → Product가 제목 · 가격 · 판매 상태를 글자로 그림
10. 확인 — (확인 말 없음)
11. 순서 — 가짜 상품을 늘리지 않고 바로 진짜 데이터로
12. 출처 — /docs에서 상품 주소 찾기 → auth 묶음만 있고 상품 주소는 없음을 확인
  13. 약속 — GET /api/products (insta 글 목록과 같은 방식)
  14. 약속 — 응답은 상품 목록, 상품마다 id · title · price · image_url · location · status · created_at
  15. 약속 — 로그인 없이 누구나 받을 수 있음
  16. 나누기 — auth.py에 붙이지 않고 새 라우터 파일
  17. 이름 — ProdList (ProductAuth → ProdAdd → ProdList로 바꿈, 상품 주소를 모으는 파일이라는 설명 듣고)
  18. 코드 — routers/ProdList.py 새 파일(GET /api/products), schemas.py에 ProductOut, main.py에 라우터 연결
  19. 확인 — GET /api/products가 200, 시드 상품 3개를 돌려줌 (Claude가 직접 요청해서 확인)
  20. 에러 — /docs에 products가 안 보임: 서버가 팀 저장소 폴더(dangeun)에서 켜져 있었고 코드는 바깥 carrot 폴더에 씀
  21. 코드 — 작업 폴더를 dangeun으로 옮김: main pull → 심병규 브랜치 → 상품 목록 코드 · 기록 복사 (DB는 두 폴더가 같은 carrot DB라 리비전 · 시드는 이미 적용돼 있음)
  22. 확인 — dangeun 서버 /docs에 GET /api/products가 뜨고 상품 3개를 돌려줌 (Claude가 직접 요청해서 확인)
23. 순서 — 커밋은 화면까지 잇고 나서
24. 출처 — Home에서 useState + useEffect로 api('/api/products') 불러오기, map으로 Product 여러 개 (insta 글 목록과 같은 방식)
25. 코드 — Home.jsx: 가짜 상품 지우고 진짜 상품 목록을 받아 Product로 그림
26. 확인 — 첫 화면에 진짜 상품 3개가 보임
27. 코드 — 커밋 "상품 목록 - db, 서버, 화면 연결" (심병규 브랜치)
