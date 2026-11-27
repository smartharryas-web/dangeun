import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { api } from '../api.js'

function Signup() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await api('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      navigate('/login')
    } catch (e) {
      setError(e.message)
    }
  }

  // 이름표(label)는 칸 밖에, 규칙(몇 글자)은 칸 아래 작은 글자로 (Login과 같은 방식)
  // aria-describedby = 이 칸의 설명이 어느 글자인지 이어 줌
  return (
    <div className="auth">
      <h1 className="page-title">가입</h1>
      <form className="d-grid gap-3" onSubmit={handleSubmit}>
        <div>
          <label className="form-label" htmlFor="signup-username">아이디</label>
          <input id="signup-username" className="form-control" value={username} onChange={e => setUsername(e.target.value)} minLength={3} maxLength={20} autoComplete="username" aria-describedby="signup-username-rule" required />
          <div id="signup-username-rule" className="form-text">3~20글자</div>
        </div>
        <div>
          <label className="form-label" htmlFor="signup-password">비밀번호</label>
          <input id="signup-password" className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={4} autoComplete="new-password" aria-describedby="signup-password-rule" required />
          <div id="signup-password-rule" className="form-text">4글자 이상</div>
        </div>
        <button className="btn btn-primary mt-1">가입</button>
      </form>
      {error && <p className="text-danger mt-3" role="alert">{error}</p>}
      <p className="mt-4 small">계정이 있나요? <Link to="/login">로그인</Link></p>
    </div>
  )
}

export default Signup
