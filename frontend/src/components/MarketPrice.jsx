import { useState, useEffect } from 'react'
import { api } from '../api.js'
import { formatPrice } from '../format.js'

// 시세: 같은 카테고리에서 판매완료된 가격 (서버가 평균 · 최저 · 최고를 계산해 줌)
function MarketPrice({ productId }) {
  const [market, setMarket] = useState(null)

  useEffect(() => {
    api(`/api/products/${productId}/market`).then(setMarket).catch(() => setMarket(null))
  }, [productId])

  if (!market || !market.category) return null

  return (
    <div className="p-3 mb-4 rounded" style={{ background: 'var(--color-surface)' }}>
      <div className="fw-semibold mb-1">{market.category} 시세</div>
      {market.count === 0 ? (
        <div className="small" style={{ color: 'var(--color-text-sub)' }}>아직 이 카테고리에서 거래된 기록이 없어요.</div>
      ) : (
        <div className="small">
          최근 거래 {market.count}건 · 평균 <strong>{formatPrice(market.average)}</strong>
          <span style={{ color: 'var(--color-text-sub)' }}> (최저 {formatPrice(market.lowest)} ~ 최고 {formatPrice(market.highest)})</span>
        </div>
      )}
    </div>
  )
}

export default MarketPrice
