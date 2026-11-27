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
