import { Link } from 'react-router'
import { useAuth } from '../hooks/useAuth.jsx'

function Navbar() {
  const { token, user, logout } = useAuth()

  return (
    <nav className="navbar border-bottom">
      <div className="container">
        <Link className="navbar-brand" to="/">carrot</Link>
        {token ? (
          <div className="d-flex align-items-center gap-2">
            {user && <span>{user.username}</span>}
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
