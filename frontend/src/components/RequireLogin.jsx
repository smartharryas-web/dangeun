import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../hooks/useAuth.jsx'

function RequireLogin() {
  const { token, ready } = useAuth()

  if (!ready) return null
  // replace: 방문 기록을 덮어써서 뒤로가기를 눌러도 다시 여기로 튕기지 않게
  if (!token) return <Navigate to="/login" replace />
  return <Outlet />
}

export default RequireLogin
