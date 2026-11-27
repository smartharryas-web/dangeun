## 데이터 모델링
목표: 필수 기능 다섯에 필요한 표와 칸을 팀이 정해 SPEC.md `데이터 모델`에 적는다
지금: 1단계 끝 — 팀원이 pull · upgrade · seed 하면 필수 기능 나누기(2단계)

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
13. 코드 — harry 브랜치에 커밋 · push 후 main에 합침 (표 · 리비전 · SPEC 데이터 모델)
14. 약속 — 바꿈: status 값 이름을 판매중 · 예약중 · 판매완료로 (시드 데이터가 판매완료여서) → SPEC.md 기능 표 수정
15. 약속 — 시드 상품의 image_url은 임시 값(/uploads/○○.jpg), 사진 파일은 상품 올리기 때 정함 (학생이 임시 값을 고름)
16. 코드 — backend/seed.py 새 파일(사용자 asdf · qwer · zxcv, 상품 3개), 실행함
17. 확인 — DBeaver에서 users 3명 · products 3개가 보임
18. 코드 — seed.py · SPEC.md(판매완료) harry에 커밋 · push 후 main에 합침
