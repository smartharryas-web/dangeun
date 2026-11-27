## 데이터 모델링
목표: 필수 기능 다섯에 필요한 표와 칸을 팀이 정해 SPEC.md `데이터 모델`에 적는다
지금: 표 만든 것을 main에 올릴지 정할 차례 (그다음 seed.py)

1. 약속 — 상품에 들어갈 정보: 제목 · 사진 · 가격 · 설명 · 거래 희망 장소
2. 약속 — 판매 상태 칸을 상품에 추가
3. 약속 — 상품에 작성자 추가 (내 상품만 상태를 바꾸려면 필요)
4. 약속 — 상품의 작성자는 users 표와 이어짐
5. 약속 — 찜은 새 표 likes에 저장
6. 약속 — likes 한 줄에는 users와 상품이 같이 들어감
7. 이름 — products(id · title · price · description · image_url · location · status · seller_id · created_at) · likes(id · user_id · product_id), 바꿀 것 없음 → SPEC.md 데이터 모델 표에 적음
8. 약속 — status 값은 한글 그대로(판매중 · 예약중 · 거래완료) (학생이 장단점을 묻고 한글로 정함)
9. 코드 — backend/models.py에 Product · Like 클래스 추가
10. 확인 — DBeaver로 DB를 직접 열어 확인하기로 함
11. 코드 — 리비전 1b6bd279c6b5 (products · likes 만들기) 생성 후 alembic upgrade head 적용
12. 확인 — DBeaver에서 products · likes 표가 생성된 것이 보임
