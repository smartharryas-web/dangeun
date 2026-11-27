import { useState, useEffect } from 'react'
import { api } from '../api.js'
import Product from '../components/Product.jsx'

function Home() {
  // 서버에서 받은 상품 목록 (처음엔 빈 목록)
  const [products, setProducts] = useState([])

  // 화면이 처음 뜰 때 한 번 상품 목록을 받아 온다
  useEffect(() => {
    api('/api/products').then(setProducts)
  }, [])

  return (
    <div>
      {products.map((product) => (
        <Product key={product.id} product={product} />
      ))}
    </div>
  )
}

export default Home
