import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth.jsx'

// 숫자 딱지 (0이면 안 그림)
function Badge({ count }) {
  if (!count) return null
  return (
    <span
      className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
      style={{ background: 'var(--color-point)', color: 'var(--color-on-point)', fontSize: '0.6rem' }}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

function Navbar() {
  const { token, user, logout, authApi } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [badges, setBadges] = useState({ notifications: 0, chats: 0 })

  // 안 읽은 알림 · 채팅 수: 로그인했으면 화면이 바뀔 때마다 + 10초마다 물어본다
  useEffect(() => {
    if (!token) return
    let stop = false
    async function load() {
      try {
        const data = await authApi('/api/users/me/badges', {})
        if (!stop) setBadges(data)
      } catch {
        // 딱지는 못 받아도 넘어간다
      }
    }
    load()
    const timer = setInterval(load, 10000)
    return () => { stop = true; clearInterval(timer) }
  }, [token, location.pathname])

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
            <Link className="btn btn-sm border-0 position-relative" to="/chats" aria-label="채팅">
              <i className="bi bi-chat-dots" />
              <Badge count={badges.chats} />
            </Link>
            <Link className="btn btn-sm border-0 position-relative" to="/notifications" aria-label="알림">
              <i className="bi bi-bell" />
              <Badge count={badges.notifications} />
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
