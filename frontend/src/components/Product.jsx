import { Link } from 'react-router'
import { imageSrc } from '../api.js'
import { formatPrice, timeAgo } from '../format.js'
import LikeButton from './LikeButton.jsx'

// 판매 상태 → 딱지 색 이름표 (색은 design.css에)
const statusClass = {
  '판매중': 'status-selling',
  '예약중': 'status-reserved',
  '판매완료': 'status-sold',
}

// 상품 하나: Home에서 상품을 통째로(product) 받아 그린다
// 사진 · 글자를 누르면 상세(/product/상품번호)로 이동, 오른쪽 찜 버튼은 따로 (링크 안에 버튼을 넣지 않으려고 밖으로 뺌)
// 배치: 사진 왼쪽, 글자 오른쪽 (d-flex = 가로로 나란히)
function Product({ product, onLikeToggle }) {
  return (
    <div className="d-flex align-items-start mb-3">
      <Link to={`/product/${product.id}`} className="product d-flex gap-3 flex-grow-1">
        <img src={imageSrc(product.image_url)} alt={product.title} width="100" height="100" style={{ objectFit: 'cover' }} />
        <div>
          <div className="product-title">{product.title}</div>
          <div className="small" style={{ color: 'var(--color-text-sub)' }}>
            {/* 끌어올렸으면 끌어올린 시간으로 */}
            {product.location} · {product.bumped_at ? `끌올 ${timeAgo(product.bumped_at)}` : timeAgo(product.created_at)}
          </div>
          <div className="product-price">{formatPrice(product.price)}</div>
          <div>
            <span className={`product-status ${statusClass[product.status]}`}>{product.status}</span>
          </div>
        </div>
      </Link>
      <LikeButton
        productId={product.id}
        liked={product.liked}
        count={product.like_count}
        onToggle={onLikeToggle}
      />
    </div>
  )
}

export default Product
