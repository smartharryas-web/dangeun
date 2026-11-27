import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { api } from '../api.js'
import { useAuth } from '../hooks/useAuth.jsx'
import Product from '../components/Product.jsx'

// 판매자 상점 (/shop/:userId): 이름 · 판매 중 · 거래 완료 수 + 이 사람이 올린 상품
function Shop() {
  const { userId } = useParams()
  const { token, ready, authApi } = useAuth()
  const [shop, setShop] = useState(null)
  const [products, setProducts] = useState([])
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!ready) return
    async function load() {
      try {
        setShop(await api(`/api/users/${userId}`))
        const path = `/api/products?seller_id=${userId}`
        setProducts(token ? await authApi(path, {}) : await api(path))
      } catch (e) {
        setErrorMessage(e.status === 404 ? '없는 상점입니다.' : e.message)
      }
    }
    load()
  }, [userId, ready, token])

  function handleLikeToggle(productId, data) {
    setProducts(products.map((p) => (p.id === productId ? { ...p, ...data } : p)))
  }

  if (errorMessage) return <p>{errorMessage}</p>
  if (!shop) return <p>불러오는 중...</p>

  return (
    <div>
      <div className="p-3 mb-4 rounded" style={{ background: 'var(--color-surface)' }}>
        <h2 className="h4 mb-1">{shop.username}님의 상점</h2>
        <div className="small" style={{ color: 'var(--color-text-sub)' }}>
          판매 중 {shop.selling_count} · 거래 완료 {shop.sold_count}
        </div>
      </div>
      {products.length === 0 ? (
        <p>올린 상품이 없습니다.</p>
      ) : (
        products.map((product) => (
          <Product key={product.id} product={product} onLikeToggle={(data) => handleLikeToggle(product.id, data)} />
        ))
      )}
    </div>
  )
}

export default Shop
