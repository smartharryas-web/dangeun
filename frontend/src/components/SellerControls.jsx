import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'

const STATUSES = ['판매중', '예약중', '판매완료']

// 판매자 전용: 판매 상태 바꾸기 + 판매완료 때 구매자 고르기 + 끌어올리기
// 바뀐 상품은 onChange(상품)로 부모에게 넘긴다
function SellerControls({ product, onChange }) {
  const { authApi } = useAuth()
  const [buyers, setBuyers] = useState(null) // 판매완료를 골랐을 때만 채움 → 구매자 고르는 창
  const [buyerId, setBuyerId] = useState('')

  async function saveStatus(status, chosenBuyerId) {
    try {
      onChange(await authApi(`/api/products/${product.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, buyer_id: chosenBuyerId ? Number(chosenBuyerId) : null }),
      }))
    } catch (err) {
      alert(err.message)
    }
  }

  // 판매완료면 먼저 "누구에게 팔았나요?"를 묻는다 (이 상품으로 채팅한 사람 중에서 — 그 사람이 후기를 쓸 수 있음)
  async function handleSelect(status) {
    if (status !== '판매완료') {
      saveStatus(status)
      return
    }
    try {
      const list = await authApi(`/api/products/${product.id}/buyers`, {})
      if (list.length === 0) {
        saveStatus('판매완료')
        return
      }
      setBuyerId(String(list[0].id))
      setBuyers(list)
    } catch (err) {
      alert(err.message)
    }
  }

  async function bump() {
    try {
      onChange(await authApi(`/api/products/${product.id}/bump`, { method: 'POST' }))
      alert('끌어올렸어요. 이제 목록 맨 위에 보여요.')
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
      <select className="form-select w-auto" value={product.status} onChange={(e) => handleSelect(e.target.value)}>
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      {product.status !== '판매완료' && (
        <button className="btn btn-outline-secondary" onClick={bump}>
          <i className="bi bi-arrow-up-circle" /> 끌어올리기
        </button>
      )}

      {buyers && (
        <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-body">
                <p className="fw-semibold mb-1">누구에게 팔았나요?</p>
                <p className="small" style={{ color: 'var(--color-text-sub)' }}>고른 사람이 거래 후기를 남길 수 있어요.</p>
                <select className="form-select mb-3" value={buyerId} onChange={(e) => setBuyerId(e.target.value)}>
                  {buyers.map((b) => <option key={b.id} value={b.id}>{b.username}</option>)}
                  <option value="">고르지 않기 (다른 곳에서 팔림)</option>
                </select>
                <button className="btn btn-primary me-2" onClick={() => { saveStatus('판매완료', buyerId); setBuyers(null) }}>판매완료</button>
                <button className="btn btn-outline-secondary" onClick={() => setBuyers(null)}>취소</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerControls
