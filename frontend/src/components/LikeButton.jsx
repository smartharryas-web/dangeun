import { useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth.jsx'

// 찜 버튼 (목록 · 상세가 같이 씀)
// 누르면 서버에 토글 요청 → 결과({ liked, like_count })를 부모에게 onToggle로 알려 준다
// 상품 상태는 부모가 들고 있고, 이 버튼은 보여 주기 + 요청만 한다
function LikeButton({ productId, liked, count, onToggle }) {
  const { token, authApi } = useAuth()
  const navigate = useNavigate()

  async function toggle() {
    // 로그인 안 했으면 로그인 화면으로
    if (!token) {
      navigate('/login')
      return
    }
    try {
      onToggle(await authApi(`/api/products/${productId}/like`, { method: 'POST' }))
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <button
      className="btn btn-sm border-0"
      style={{ color: 'var(--color-point)' }}
      onClick={toggle}
      aria-label={liked ? '찜 빼기' : '찜하기'}
    >
      <i className={liked ? 'bi bi-heart-fill' : 'bi bi-heart'} /> {count}
    </button>
  )
}

export default LikeButton
