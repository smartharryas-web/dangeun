import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth.jsx'

function Navbar() {
  const { token, user, logout } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  // 검색: 첫 화면 주소에 검색어를 붙여 보낸다 (/?q=검색어) → Home이 주소를 보고 검색
  function handleSearch(e) {
    e.preventDefault()
    const word = search.trim()
    navigate(word ? `/?q=${encodeURIComponent(word)}` : '/')
  }

  return (
    <nav className="navbar border-bottom">
      <div className="container gap-2">
        <Link className="navbar-brand" to="/">carrot</Link>
        <form className="flex-grow-1" style={{ maxWidth: 360 }} onSubmit={handleSearch}>
          <input
            className="form-control form-control-sm"
            type="search"
            placeholder="상품명 · 브랜드 · 태그 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        {token ? (
          <div className="d-flex align-items-center gap-2">
            {/* 내 아이디를 누르면 내 상점 */}
            {user && <Link className="text-reset text-decoration-none" to={`/shop/${user.id}`}>{user.username}</Link>}
            <Link className="btn btn-sm border-0" to="/me/likes" aria-label="찜한 상품">
              <i className="bi bi-heart" />
            </Link>
            {/* 상품 올리기 화면(/new)으로 가는 입구 — 로그인했을 때만 */}
            <Link className="btn btn-sm btn-outline-secondary" to="/new">판매하기</Link>
            <button className="btn btn-sm btn-outline-secondary" onClick={logout}>로그아웃</button>
          </div>
        ) : (
          <Link className="btn btn-sm btn-outline-secondary" to="/login">로그인</Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar
