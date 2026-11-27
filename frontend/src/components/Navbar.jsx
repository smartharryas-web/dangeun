import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth.jsx'

// 숫자 딱지 (0이면 안 그림). 모양은 design.css의 .count-badge
function Badge({ count }) {
  if (!count) return null
  return <span className="count-badge">{count > 99 ? '99+' : count}</span>
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

  // 배치(넓은 화면 한 줄 · 폰 두 줄)는 design.css의 .site-nav
  return (
    <header className="site-header">
      <nav className={`container site-nav ${token ? '' : 'is-guest'}`} aria-label="주 메뉴">
        {/* 로고: 로고 화면(routes/Intro.jsx)과 같은 도형을 작게. 움직임 · 틈 메우개는 뺀, 다 맞물린 뒤의 모양 */}
        {/* 도형을 여기에도 한 벌 더 적어 둔 것이라, Intro.jsx의 로고를 바꾸면 여기도 같이 바꿔야 함 */}
        {/* 그림(svg)은 읽어 줄 글자가 없어서 링크에 aria-label로 이름을 붙임 */}
        <Link className="wordmark" to="/" aria-label="ENCORE 첫 화면">
          <svg viewBox="-2 -2 518 104" fill="currentColor" aria-hidden="true">
            {/* E */}
            <path d="M0 0H52V11H13V44.5H47V55.5H13V89H54V100H0Z" />
            {/* N */}
            <path transform="translate(84)" d="M0 0H17L53.5 73.5V0H66V100H49L12.5 26.5V100H0Z" />
            {/* C: 본체 + O 안쪽으로 다시 나오는 아래 끝 */}
            <path d="M272.68 38A48 51.5 0 1 0 252.39 93.02A52.5 56 0 0 1 244.35 84.09A34 40.5 0 1 1 258.47 38Z" />
            <path d="M266.73 77.26A48 51.5 0 0 0 272.68 62H258.47L258.34 62.51A29.5 36 0 0 0 266.73 77.26Z" />
            {/* O */}
            <path d="M245.27 22.74A48 51.5 0 1 0 259.61 6.98A52.5 56 0 0 1 267.65 15.91A34 40.5 0 1 1 253.66 37.49A29.5 36 0 0 0 245.27 22.74Z" />
            {/* R */}
            <path transform="translate(362)" fillRule="evenodd" d="M0 0H34A28 28 0 0 1 44.98 53.76L66 100H51L31 56H13V100H0ZM13 11H34A14 17 0 0 1 34 45H13Z" />
            {/* 마지막 E */}
            <path transform="translate(460)" d="M0 0H52V11H13V44.5H47V55.5H13V89H54V100H0Z" />
          </svg>
        </Link>
        <form className="site-search" role="search" onSubmit={handleSearch}>
          {/* 눈에는 안 보이지만 화면을 읽어 주는 프로그램은 읽는 이름표 */}
          <label className="visually-hidden" htmlFor="site-search">상품 검색</label>
          <i className="bi bi-search" aria-hidden="true" />
          <input
            id="site-search"
            type="search"
            placeholder="상품명 · 브랜드 · 태그 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        {token ? (
          <>
            <div className="site-tools">
              {/* 내 아이디를 누르면 내 상점 (폰에선 글자 대신 사람 아이콘) */}
              {user && (
                <Link className="tool" to={`/shop/${user.id}`} aria-label={`내 상점 (${user.username})`}>
                  <i className="bi bi-person tool-icon-narrow" aria-hidden="true" />
                  <span className="tool-text">{user.username}</span>
                </Link>
              )}
              <Link className="tool" to="/me/likes" aria-label="찜한 상품">
                <i className="bi bi-heart" aria-hidden="true" />
              </Link>
              <Link className="tool" to="/chats" aria-label="채팅">
                <i className="bi bi-chat-dots" aria-hidden="true" />
                <Badge count={badges.chats} />
              </Link>
              <Link className="tool" to="/notifications" aria-label="알림">
                <i className="bi bi-bell" aria-hidden="true" />
                <Badge count={badges.notifications} />
              </Link>
              <button className="tool" onClick={logout} aria-label="로그아웃">
                <i className="bi bi-box-arrow-right tool-icon-narrow" aria-hidden="true" />
                <span className="tool-text">로그아웃</span>
              </button>
            </div>
            {/* 상품 올리기 화면(/new)으로 가는 입구: 로그인했을 때만 */}
            <Link className="btn btn-sm btn-outline-secondary site-sell" to="/new">판매하기</Link>
          </>
        ) : (
          <Link className="btn btn-sm btn-outline-secondary site-sell" to="/login">로그인</Link>
        )}
      </nav>
    </header>
  )
}

export default Navbar
