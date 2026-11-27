import { useState, useEffect } from 'react'
import { api } from '../api.js'
import { useAuth } from '../hooks/useAuth.jsx'
import Product from '../components/Product.jsx'
import RecentProducts from '../components/RecentProducts.jsx'

function Home() {
  const { token, ready, authApi } = useAuth()
  // 서버에서 받은 상품 목록 (null = 아직 받는 중)
  const [products, setProducts] = useState(null)
  const [error, setError] = useState('')

  // 로그인 확인이 끝나면(ready) 상품 목록을 받아 온다
  // 로그인했으면 토큰을 같이 보내서 "내가 찜했는지"까지 받는다
  useEffect(() => {
    if (!ready) return
    async function load() {
      try {
        setProducts(token ? await authApi('/api/products', {}) : await api('/api/products'))
        setError('')
      } catch (e) {
        setError(e.message)
      }
    }
    load()
  }, [ready, token])

  // 찜 버튼 결과를 목록의 그 상품에만 반영
  function handleLikeToggle(productId, data) {
    setProducts(products.map((p) => (p.id === productId ? { ...p, ...data } : p)))
  }

  return (
    <div>
      <RecentProducts />
      {/* 받는 중 · 에러 · 빈 목록 · 목록 넷 중 하나 */}
      {error ? (
        <p className="text-danger">상품을 불러오지 못했습니다. ({error})</p>
      ) : products === null ? (
        <p>불러오는 중...</p>
      ) : products.length === 0 ? (
        <p>아직 올라온 상품이 없습니다.</p>
      ) : (
        products.map((product) => (
          <Product
            key={product.id}
            product={product}
            onLikeToggle={(data) => handleLikeToggle(product.id, data)}
          />
        ))
      )}
    </div>
  )
}

export default Home
