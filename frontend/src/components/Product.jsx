import { Link } from 'react-router'
import { imageSrc } from '../api.js'

// 판매 상태 → 딱지 색 이름표 (색은 design.css에)
const statusClass = {
  '판매중': 'status-selling',
  '예약중': 'status-reserved',
  '판매완료': 'status-sold',
}

// 상품 하나: Home에서 상품을 통째로(product) 받아 그린다
// 칸 전체를 누르면 상세(/product/상품번호)로 이동
// 배치: 사진 왼쪽, 글자 오른쪽 (d-flex = 가로로 나란히)
function Product({ product }) {
  return (
    <Link to={`/product/${product.id}`} className="product d-flex gap-3 mb-3">
      <img src={imageSrc(product.image_url)} alt={product.title} width="100" height="100" />
      <div>
        <div className="product-title">{product.title}</div>
        <div className="product-price">{product.price}원</div>
        <div>
          <span className={`product-status ${statusClass[product.status]}`}>{product.status}</span>
        </div>
      </div>
    </Link>
  )
}

export default Product
