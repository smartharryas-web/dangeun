import { Link } from 'react-router'

// 상품 하나: Home에서 상품을 통째로(product) 받아 그린다
// 칸 전체를 누르면 상세(/product/상품번호)로 이동
function Product({ product }) {
  return (
    <Link to={`/product/${product.id}`}>
      <div>{product.title}</div>
      <div>{product.price}원</div>
      <div>{product.status}</div>
    </Link>
  )
}

export default Product
