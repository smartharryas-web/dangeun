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

  return (
    <div className="mx-auto" style={{ maxWidth: 360 }}>
      <h2 className="h4 mb-3">로그인</h2>
      <form className="d-grid gap-2" onSubmit={handleSubmit}>
        <input className="form-control" value={username} onChange={e => setUsername(e.target.value)} placeholder="아이디" required />
        <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="비밀번호" required />
        <button className="btn btn-primary">로그인</button>
      </form>
      {error && <p className="text-danger mt-2">{error}</p>}
      <p className="mt-3">계정이 없나요? <Link to="/signup">가입하기</Link></p>
    </div>
  )
}

export default Login
