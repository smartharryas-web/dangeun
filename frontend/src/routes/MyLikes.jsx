import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import Product from '../components/Product.jsx'

// 내가 찜한 상품 (/me/likes, 로그인 필요)
function MyLikes() {
  const { authApi } = useAuth()
  const [products, setProducts] = useState(null)

  useEffect(() => {
    authApi('/api/users/me/likes', {}).then(setProducts).catch((e) => alert(e.message))
  }, [])

  // 여기서 찜을 빼면 목록에서도 바로 빠진다
  function handleLikeToggle(productId, data) {
    setProducts(data.liked
      ? products.map((p) => (p.id === productId ? { ...p, ...data } : p))
      : products.filter((p) => p.id !== productId))
  }

  if (products === null) return <p className="state">찜한 상품을 불러오는 중입니다.</p>

  return (
    <div>
      <h1 className="page-title">찜한 상품</h1>
      {products.length === 0 ? (
        <p>아직 찜한 상품이 없습니다.</p>
      ) : (
        products.map((product) => (
          <Product key={product.id} product={product} onLikeToggle={(data) => handleLikeToggle(product.id, data)} />
        ))
      )}
    </div>
  )
}

export default MyLikes
