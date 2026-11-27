import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth.jsx'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await login(username, password)
      navigate('/')
    } catch (e) {
      setError(e.message)
      setPassword('')
    }
  }

  // 칸마다 이름표(label)를 밖에 둔다: 칸 안 안내 글자(placeholder)는 입력을 시작하면 사라져서
  // label의 htmlFor와 input의 id가 같으면 이름표를 눌러도 그 칸이 선택됨
  // autoComplete = 브라우저 · 비밀번호 관리 앱이 어떤 칸인지 알고 채워 주게
  return (
    <div className="auth">
      <h1 className="page-title">로그인</h1>
      <form className="d-grid gap-3" onSubmit={handleSubmit}>
        <div>
          <label className="form-label" htmlFor="login-username">아이디</label>
          <input id="login-username" className="form-control" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" required />
        </div>
        <div>
          <label className="form-label" htmlFor="login-password">비밀번호</label>
          <input id="login-password" className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
        </div>
        <button className="btn btn-primary mt-1">로그인</button>
      </form>
      {error && <p className="text-danger mt-3" role="alert">{error}</p>}
      <p className="mt-4 small">계정이 없나요? <Link to="/signup">가입하기</Link></p>
    </div>
  )
}

export default Login
