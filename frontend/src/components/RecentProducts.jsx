import { useState } from 'react'
import { Link } from 'react-router'
import { imageSrc } from '../api.js'
import { formatPrice } from '../format.js'
import { getRecent } from '../recent.js'

// 최근 본 상품 줄 (첫 화면 위쪽, 가로로 나란히). 본 게 없으면 아무것도 안 그린다
function RecentProducts() {
  const [items] = useState(getRecent)

  if (items.length === 0) return null

  return (
    <div className="mb-4">
      <div className="small mb-2" style={{ color: 'var(--color-text-sub)' }}>최근 본 상품</div>
      <div className="d-flex gap-3 overflow-auto pb-2">
        {items.map((p) => (
          <Link key={p.id} to={`/product/${p.id}`} className="product flex-shrink-0" style={{ width: 88 }}>
            <img src={imageSrc(p.image_url)} alt={p.title} width="88" height="88" style={{ objectFit: 'cover' }} />
            <div className="small text-truncate mt-1">{p.title}</div>
            <div className="small product-price text-truncate">{formatPrice(p.price)}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default RecentProducts
