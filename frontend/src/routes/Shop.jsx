import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { api } from '../api.js'
import { useAuth } from '../hooks/useAuth.jsx'
import { timeAgo } from '../format.js'
import Product from '../components/Product.jsx'

// 판매자 상점 (/shop/:userId): 이름 · 판매 중 · 거래 완료 · 팔로워 · 별점 + 팔로우 버튼 + 상품 / 후기 탭
function Shop() {
  const { userId } = useParams()
  const { user, token, ready, authApi } = useAuth()
  const navigate = useNavigate()
  const [shop, setShop] = useState(null)
  const [products, setProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [tab, setTab] = useState('products')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!ready) return
    // 로그인했으면 토큰을 붙여서 (팔로우 · 찜 여부까지)
    const get = (path) => (token ? authApi(path, {}) : api(path))
    async function load() {
      try {
        setShop(await get(`/api/users/${userId}`))
        setProducts(await get(`/api/products?seller_id=${userId}`))
        setReviews(await api(`/api/users/${userId}/reviews`))
      } catch (e) {
        setErrorMessage(e.status === 404 ? '없는 상점입니다.' : e.message)
      }
    }
    load()
  }, [userId, ready, token])

  function handleLikeToggle(productId, data) {
    setProducts(products.map((p) => (p.id === productId ? { ...p, ...data } : p)))
  }

  async function toggleFollow() {
    if (!token) {
      navigate('/login')
      return
    }
    try {
      const data = await authApi(`/api/users/${userId}/follow`, { method: 'POST' })
      setShop({ ...shop, following: data.following, follower_count: data.follower_count })
    } catch (e) {
      alert(e.message)
    }
  }

  if (errorMessage) return <p>{errorMessage}</p>
  if (!shop) return <p className="state">상점을 불러오는 중입니다.</p>

  const isMe = user && user.id === shop.id

  return (
    <div>
      <div className="panel p-3 mb-3 d-flex align-items-center gap-3">
        <div className="me-auto">
          <h1 className="page-title mb-1 mt-0">{shop.username}님의 상점</h1>
          <div className="small" style={{ color: 'var(--color-text-sub)' }}>
            판매 중 {shop.selling_count} · 거래 완료 {shop.sold_count} · 팔로워 {shop.follower_count}
            {shop.rating_avg !== null && <> · <i className="bi bi-star-fill" style={{ color: 'var(--color-point)' }} /> {shop.rating_avg} ({shop.review_count})</>}
          </div>
        </div>
        {!isMe && (
          <button className={`btn btn-sm ${shop.following ? 'btn-outline-secondary' : 'btn-primary'}`} onClick={toggleFollow}>
            {shop.following ? '팔로잉' : '팔로우'}
          </button>
        )}
      </div>

      {/* 상품 / 후기 탭 */}
      <ul className="nav nav-underline mb-3">
        <li className="nav-item">
          <button className={`nav-link ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>상품 {products.length}</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === 'reviews' ? 'active' : ''}`} onClick={() => setTab('reviews')}>거래 후기 {reviews.length}</button>
        </li>
      </ul>

      {tab === 'products' ? (
        products.length === 0 ? (
          <p>올린 상품이 없습니다.</p>
        ) : (
          products.map((product) => (
            <Product key={product.id} product={product} onLikeToggle={(data) => handleLikeToggle(product.id, data)} />
          ))
        )
      ) : reviews.length === 0 ? (
        <p>아직 받은 후기가 없습니다.</p>
      ) : (
        reviews.map((r) => (
          <div key={r.id} className="border-bottom py-2">
            <div className="small">
              <span style={{ color: 'var(--color-point)' }}>
                {[1, 2, 3, 4, 5].map((n) => <i key={n} className={n <= r.rating ? 'bi bi-star-fill' : 'bi bi-star'} />)}
              </span>
              <strong className="ms-2">{r.reviewer_username}</strong>
              <span className="ms-2" style={{ color: 'var(--color-text-sub)' }}>{timeAgo(r.created_at)}</span>
            </div>
            <div>{r.content}</div>
            <Link to={`/product/${r.product_id}`} className="small" style={{ color: 'var(--color-text-sub)' }}>{r.product_title}</Link>
          </div>
        ))
      )}
    </div>
  )
}

export default Shop
