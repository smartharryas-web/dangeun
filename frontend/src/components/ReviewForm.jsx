import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'

// 거래 후기 쓰기 (판매완료 상품의 구매자에게만 보임): 별 1~5개 + 한 줄
function ReviewForm({ productId, onDone }) {
  const { authApi } = useAuth()
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')

  async function submit(e) {
    e.preventDefault()
    try {
      await authApi(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, content }),
      })
      alert('후기를 남겼어요.')
      onDone()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <form className="p-3 mb-3 rounded" style={{ background: 'var(--color-surface)' }} onSubmit={submit}>
      <div className="fw-semibold mb-2">거래는 어떠셨나요?</div>
      <div className="mb-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className="btn btn-sm border-0 p-0 me-1 fs-5"
            style={{ color: 'var(--color-point)' }}
            onClick={() => setRating(n)}
            aria-label={`별 ${n}개`}
          >
            <i className={n <= rating ? 'bi bi-star-fill' : 'bi bi-star'} />
          </button>
        ))}
      </div>
      <textarea
        className="form-control mb-2"
        rows="2"
        maxLength={500}
        placeholder="포장이 깔끔해요, 시간 약속을 잘 지켜요 같은 후기를 남겨 주세요"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <button className="btn btn-sm btn-primary">후기 남기기</button>
    </form>
  )
}

export default ReviewForm
