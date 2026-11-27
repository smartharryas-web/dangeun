import { useState, useEffect } from 'react'
import { useLocation, useSearchParams } from 'react-router'
import { api } from '../api.js'
import { useAuth } from '../hooks/useAuth.jsx'
import { CATEGORIES, SORTS } from '../constants.js'
import Product from '../components/Product.jsx'
import RecentProducts from '../components/RecentProducts.jsx'
import Intro from './Intro.jsx'

function Home() {
  const { token, ready, authApi } = useAuth()
  // 로고 화면에서 눌러 들어왔는지 (Intro의 Link가 state로 넘긴 쪽지)
  const location = useLocation()
  // 검색어 · 카테고리 · 정렬 · 판매완료 빼기는 주소(?q=...)에 둔다 → 메뉴 줄 검색창에서 보내기 쉽고, 새로고침해도 그대로
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const category = params.get('category') || ''
  const sort = params.get('sort') || 'latest'
  const excludeSold = params.get('exclude_sold') === 'true'

  // 서버에서 받은 상품 목록 (null = 아직 받는 중)
  const [products, setProducts] = useState(null)
  const [error, setError] = useState('')

  // 로그인 확인이 끝나면(ready) · 조건이 바뀌면 상품 목록을 다시 받는다
  // 로그인했으면 토큰을 같이 보내서 "내가 찜했는지"까지 받는다
  useEffect(() => {
    if (!ready) return
    async function load() {
      const query = new URLSearchParams({ sort })
      if (q) query.set('q', q)
      if (category) query.set('category', category)
      if (excludeSold) query.set('exclude_sold', 'true')
      const path = `/api/products?${query}`
      try {
        setProducts(token ? await authApi(path, {}) : await api(path))
        setError('')
      } catch (e) {
        setError(e.message)
      }
    }
    load()
  }, [ready, token, q, category, sort, excludeSold])

  // 주소의 조건 하나 바꾸기 (빈 값이면 뺀다)
  function setParam(name, value) {
    const next = new URLSearchParams(params)
    if (value) next.set(name, value)
    else next.delete(name)
    setParams(next)
  }

  // 찜 버튼 결과를 목록의 그 상품에만 반영
  function handleLikeToggle(productId, data) {
    setProducts(products.map((p) => (p.id === productId ? { ...p, ...data } : p)))
  }

  return (
    <div>
      {/* 로고 화면에서 왔으면 목록 위에 로고 화면을 막으로 덮었다가 가운데서 갈라지게 */}
      {location.state?.fromIntro && <Intro opening />}
      {!q && !category && <RecentProducts />}

      {/* 카테고리 메뉴 (가로로 넘겨 보기) */}
      <div className="d-flex gap-2 overflow-auto pb-2 mb-3">
        <button
          className={`btn btn-sm flex-shrink-0 ${category ? 'btn-outline-secondary' : 'btn-dark'}`}
          onClick={() => setParam('category', '')}
        >
          전체
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`btn btn-sm flex-shrink-0 ${category === c ? 'btn-dark' : 'btn-outline-secondary'}`}
            onClick={() => setParam('category', c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 지금 검색어 · 판매완료 빼기 · 정렬 */}
      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
        <div className="me-auto">
          {q && (
            <span>
              "{q}" 검색 결과
              <button className="btn btn-sm btn-link" onClick={() => setParam('q', '')}>검색 지우기</button>
            </span>
          )}
        </div>
        <div className="form-check mb-0">
          <input
            id="exclude_sold"
            type="checkbox"
            className="form-check-input"
            checked={excludeSold}
            onChange={(e) => setParam('exclude_sold', e.target.checked ? 'true' : '')}
          />
          <label className="form-check-label small" htmlFor="exclude_sold">판매완료 빼기</label>
        </div>
        <select className="form-select form-select-sm w-auto" value={sort} onChange={(e) => setParam('sort', e.target.value)}>
          {SORTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      {/* 받는 중 · 에러 · 빈 목록 · 목록 넷 중 하나 */}
      {error ? (
        <p className="text-danger">상품을 불러오지 못했습니다. ({error})</p>
      ) : products === null ? (
        <p>불러오는 중...</p>
      ) : products.length === 0 ? (
        <p>{q || category ? '조건에 맞는 상품이 없습니다.' : '아직 올라온 상품이 없습니다.'}</p>
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
