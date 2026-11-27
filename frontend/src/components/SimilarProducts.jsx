import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { api, imageSrc } from '../api.js'
import { formatPrice } from '../format.js'

// 비슷한 상품: 같은 카테고리에서 아직 안 팔린 것 (서버가 최신 6개를 골라 줌)
function SimilarProducts({ productId }) {
  const [products, setProducts] = useState([])

  useEffect(() => {
    api(`/api/products/${productId}/similar`).then(setProducts).catch(() => setProducts([]))
  }, [productId])

  if (products.length === 0) return null

  return (
    <div className="mb-4">
      <div className="fw-semibold mb-2">비슷한 상품</div>
      <div className="d-flex gap-3 overflow-auto pb-2">
        {products.map((p) => (
          <Link key={p.id} to={`/product/${p.id}`} className="product flex-shrink-0" style={{ width: 120 }}>
            <img src={imageSrc(p.image_url)} alt={p.title} width="120" height="120" style={{ objectFit: 'cover' }} />
            <div className="small text-truncate mt-1">{p.title}</div>
            <div className="small product-price text-truncate">{formatPrice(p.price)}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default SimilarProducts
