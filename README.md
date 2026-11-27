# carrot

중고거래 서비스를 만드는 팀 저장소입니다. 가입 · 로그인 · 로그인 유지만 들어 있습니다(insta 09 · 10과 같은 코드). 화면은 기본 레이아웃만 있고, 디자인은 팀이 정합니다.

```
carrot/
├── SPEC.md     # 기능 · 담당 · 주소
├── backend/    # FastAPI — main.py · models.py(users · refresh_tokens) · routers/auth.py · deps.py
└── frontend/   # React(Vite) — App.jsx · api.js · hooks/useAuth.jsx(authApi) · routes/(Login · Signup · Home)
```

## 시작하기

### 1. 팀 저장소 만들기(팀장)

1. 이 저장소 오른쪽 위의 **Use this template** → **Create a new repository**를 누릅니다.
2. 저장소 이름은 `carrot`, 공개 범위는 **Private**으로 만듭니다.
3. **Settings → Collaborators**에서 팀원을 초대합니다. 팀원은 메일로 온 초대를 수락합니다.

### 2. 내려받기 · 설치(모두)

```bash
git clone https://github.com/팀장아이디/carrot.git
cd carrot
code .
```

VS Code 터미널에서:

```bash
git switch -c 내이름
cd backend
uv sync
cd ../frontend
npm install
```

### 3. `.env` 만들기

`backend`에서:

```bash
cp .env.example .env
uv run python -c "import secrets; print(secrets.token_hex(32))"
```

VS Code에서 `backend/.env`를 열어 두 줄을 채우고 저장합니다.

```
DB_URL=postgresql+psycopg://sd4:sd4@localhost:5432/carrot
SECRET_KEY=위에서_나온_64글자
```

### 4. DB 만들기

```bash
psql -d postgres     # macOS
psql -U postgres     # Windows
```

```sql
CREATE DATABASE carrot OWNER sd4;
\q
```

DB는 각자 컴퓨터에 하나씩입니다. 팀원이 만든 상품은 내 DB에 없습니다.

### 5. 테이블 · 실행

`backend`에서:

```bash
uv run alembic upgrade head
uv run fastapi dev
```

http://localhost:8000/docs 에 주소 목록이 보이면 됩니다. 새 터미널의 `frontend`에서:

```bash
npm run dev
```

http://localhost:5173 에서 가입 → 로그인이 되면 준비 끝입니다.

## 할 것

`SPEC.md`의 `진행` 표 순서대로 갑니다.

1. **데이터 모델링 — 같이.** 팀이 한 컴퓨터에 모여 필수 기능에 필요한 표 · 칸 · 관계를 정하고 `SPEC.md` `데이터 모델`에 적습니다. 모델 · 리비전 · `seed.py`까지 만들어 main에 올리면, 모두 pull → `uv run alembic upgrade head` → `uv run python seed.py`
2. **필수 기능 — 나눠서.** `기능` 표의 `담당`을 나누고 각자 자기 브랜치에서 만듭니다. 하나 끝날 때마다 main에 합치고 팀원에게 알립니다. 팀원은 pull로 받습니다
3. **확장 — 같이 정하고 나눠서.** 필수가 다 되면 팀이 추가 기능을 고릅니다(문의 댓글 · 판매자 페이지 · 10개씩 · 정렬 · 카테고리 · 팀이 생각한 것). 새 표가 필요하면 1처럼 같이 정합니다

DB는 각자 컴퓨터에 있습니다. 팀원이 만든 상품을 내 화면에서도 보려면 `seed.py`로 같은 데이터를 넣습니다.

## 디자인

기본 레이아웃만 들어 있습니다: 위 메뉴 줄(`Navbar.jsx`) · 본문 `container`(`App.jsx`) · Bootstrap 5.3(`src/main.jsx`에서 불러옴). 레이아웃 · 색 · 글꼴은 팀이 정합니다. 바꿔도 되고 지워도 됩니다.

## Claude Code

이 저장소에서 `claude`를 켜면 출력 스타일 `step-by-step`이 켜져 있습니다(`.claude/settings.json`). 무엇을 어디에 어떤 순서로 만들지는 내가 정하고, 코드는 Claude가 씁니다.

- 진행 기록은 저장소 루트의 `PROGRESS_이름.md`에 쌓입니다
- 팀이 같이 보는 기능 · 담당 · 주소는 `SPEC.md`
- 이 프로젝트에서는 pull · commit · push · merge도 Claude에게 맡겨도 됩니다
- 모델은 Sonnet으로 정해 두었습니다(`.claude/settings.json`의 `model`)
- 각자 작업은 내 브랜치에서 합니다. main에 있으면 Claude가 브랜치를 만들고 시작합니다
- 지금 켜진 스타일은 `/output-style`로 볼 수 있습니다
