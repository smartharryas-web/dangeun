## 데이터 모델링
목표: 필수 기능 다섯에 필요한 표 · 칸 · 관계를 정해 SPEC 데이터 모델에 적는다
지금: 필요한 표 목록 정하기 (products · likes 외에 더 있는지)

1. 나누기 — 상품 정보 후보: 제목 · 가격 · 설명 · 사진 · 판매 상태 · 올린(수정) 날짜 · 좋아요 수 · 채팅 수 · 지역 · 조회 수 · 댓글 수
2. 순서 — 좋아요 수를 칸으로 저장할지(A 칸 / B 별도 표에서 세기)는 나중에, 먼저 표 채우기 (학생: 지금은 표를 채워야 해서)
3. 나누기 — products 칸 이름 제안(title · price · description · image_url · status · region · view_count · created_at · updated_at · seller_id)은 일단 넘어감, 표 목록부터
4. 나누기 — 표 후보: products, likes(찜 저장용) — 학생이 말함
