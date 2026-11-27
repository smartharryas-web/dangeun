import { Link } from 'react-router'

// 상품 하나: Home에서 상품을 통째로(product) 받아 그린다
// 칸 전체를 누르면 상세(/product/상품번호)로 이동
// 배치: 사진 왼쪽, 글자 오른쪽 (d-flex = 가로로 나란히)
function Product({ product }) {
  return (
    <Link to={`/product/${product.id}`} className="d-flex gap-3 mb-3">
      <img src={product.image_url} alt={product.title} width="100" height="100" />
      <div>
        <div>{product.title}</div>
        <div>{product.price}원</div>
        <div>{product.status}</div>
      </div>
    </Link>
  )
}

export default Product
