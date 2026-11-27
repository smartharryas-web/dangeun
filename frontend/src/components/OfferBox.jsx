import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth.jsx'
import { formatPrice, timeAgo } from '../format.js'

const MIN_RATE = 0.7 // 서버와 같은 규칙: 판매가의 70% 이상

// 가격 제안 칸
// - 판매자: 들어온 제안 목록 + 수락 · 거절 (수락하면 상품이 예약중이 됨 → onProductChange로 상세를 다시 받게)
// - 다른 사람: 제안하는 칸 + 내 제안 상태
function OfferBox({ product, isMine, onProductChange }) {
  const { token, authApi } = useAuth()
  const navigate = useNavigate()
  const [offers, setOffers] = useState([])
  const [price, setPrice] = useState('')

  useEffect(() => {
    if (!token) return
    authApi(`/api/products/${product.id}/offers`, {}).then(setOffers).catch(() => setOffers([]))
  }, [product.id, token])

  async function sendOffer(e) {
    e.preventDefault()
    if (!token) {
      navigate('/login')
      return
    }
    try {
      const offer = await authApi(`/api/products/${product.id}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: Number(price) }),
      })
      // 기다리는 제안은 하나라서 같은 번호면 바꿔 끼우고, 아니면 맨 앞에
      setOffers([offer, ...offers.filter((o) => o.id !== offer.id)])
      setPrice('')
      alert('가격을 제안했어요. 판매자가 답하면 알림이 와요.')
    } catch (err) {
      alert(err.message)
    }
  }

  async function answer(offerId, status) {
    try {
      const updated = await authApi(`/api/offers/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setOffers(offers.map((o) => (o.id === offerId ? updated : o)))
      if (status === '수락') onProductChange()
    } catch (err) {
      alert(err.message)
    }
  }

  // 판매자: 들어온 제안
  if (isMine) {
    if (offers.length === 0) return null
    return (
      <div className="p-3 mb-3 rounded" style={{ background: 'var(--color-surface)' }}>
        <div className="fw-semibold mb-2">받은 가격 제안</div>
        {offers.map((o) => (
          <div key={o.id} className="d-flex align-items-center gap-2 mb-1 small">
            <span className="me-auto">
              {o.buyer_username} · <strong>{formatPrice(o.price)}</strong> · {timeAgo(o.created_at)}
            </span>
            {o.status === '대기' ? (
              <>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => answer(o.id, '수락')}>수락</button>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => answer(o.id, '거절')}>거절</button>
              </>
            ) : (
              <span>{o.status}</span>
            )}
          </div>
        ))}
      </div>
    )
  }

  // 다른 사람: 가격 제안을 받는 판매중 상품일 때만
  if (!product.negotiable || product.status !== '판매중') return null

  return (
    <div className="p-3 mb-3 rounded" style={{ background: 'var(--color-surface)' }}>
      <form className="d-flex gap-2 align-items-center" onSubmit={sendOffer}>
        <input
          className="form-control form-control-sm"
          type="number"
          min={Math.ceil(product.price * MIN_RATE)}
          max={product.price - 1}
          placeholder={`${formatPrice(Math.ceil(product.price * MIN_RATE))} 이상`}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <button className="btn btn-sm btn-outline-secondary flex-shrink-0">가격 제안하기</button>
      </form>
      <div className="small mt-1" style={{ color: 'var(--color-text-sub)' }}>판매 가격의 70% 이상으로 제안할 수 있어요.</div>
      {offers.map((o) => (
        <div key={o.id} className="small mt-1">내 제안 {formatPrice(o.price)} · {o.status}</div>
      ))}
    </div>
  )
}

export default OfferBox
