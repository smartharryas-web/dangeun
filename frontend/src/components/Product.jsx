// 상품 하나: Home에서 상품을 통째로(product) 받아 그린다
function Product({ product }) {
  return (
    <div>
      <div>{product.title}</div>
      <div>{product.price}원</div>
      <div>{product.status}</div>
    </div>
  )
}

export default Product
