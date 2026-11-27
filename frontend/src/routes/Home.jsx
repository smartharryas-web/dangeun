import { useState, useEffect } from 'react'
import { api } from '../api.js'
import { useAuth } from '../hooks/useAuth.jsx'
import Product from '../components/Product.jsx'

function Home() {
  const { token, ready, authApi } = useAuth()
  // 서버에서 받은 상품 목록 (처음엔 빈 목록)
  const [products, setProducts] = useState([])

  // 로그인 확인이 끝나면(ready) 상품 목록을 받아 온다
  // 로그인했으면 토큰을 같이 보내서 "내가 찜했는지"까지 받는다
  useEffect(() => {
    if (!ready) return
    async function load() {
      setProducts(token ? await authApi('/api/products', {}) : await api('/api/products'))
    }
    load()
  }, [ready, token])

  // 찜 버튼 결과를 목록의 그 상품에만 반영
  function handleLikeToggle(productId, data) {
    setProducts(products.map((p) => (p.id === productId ? { ...p, ...data } : p)))
  }

  return (
    <div>
      {products.map((product) => (
        <Product
          key={product.id}
          product={product}
          onLikeToggle={(data) => handleLikeToggle(product.id, data)}
        />
      ))}
    </div>
  )
}

export default Home
