import { Link } from 'react-router'
import { imageSrc } from '../api.js'
import { formatPrice, timeAgo } from '../format.js'
import LikeButton from './LikeButton.jsx'

// 판매 상태 → 딱지 색 이름표 (색은 design.css에). 상세 화면도 같이 쓰려고 export
export const statusClass = {
  '판매중': 'status-selling',
  '예약중': 'status-reserved',
  '판매완료': 'status-sold',
}

// 상품 하나: Home에서 상품을 통째로(product) 받아 그린다
// 사진 · 글자를 누르면 상세(/product/상품번호)로 이동, 오른쪽 찜 버튼은 따로 (링크 안에 버튼을 넣지 않으려고 밖으로 뺌)
// 배치(사진 왼쪽 · 글자 오른쪽 · 넓은 화면에선 가격을 오른쪽 끝으로)는 design.css의 .product-row
function Product({ product, onLikeToggle }) {
  return (
    <div className="product-row">
      <Link to={`/product/${product.id}`} className="product product-link">
        {/* alt를 비운 이유: 바로 옆에 제목 글자가 있어서, 같은 말을 두 번 읽어 주지 않게 */}
        <img className="product-photo" src={imageSrc(product.image_url)} alt="" width="112" height="112" />
        <div className="product-body">
          <div className="product-title">{product.title}</div>
          <div className="product-meta">
            {/* 끌어올렸으면 끌어올린 시간으로 */}
            {product.location} · {product.bumped_at ? `끌올 ${timeAgo(product.bumped_at)}` : timeAgo(product.created_at)}
          </div>
          <div className="product-price">{formatPrice(product.price)}</div>
          <div className="product-state">
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
