import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth.jsx'

const REASONS = ['가품 의심', '사기 의심', '외부 채널 유도', '거래 금지 품목', '기타']

// 신고하기 (남의 상품에만): 누르면 이유를 고르는 창
function ReportButton({ productId }) {
  const { token, authApi } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState(REASONS[0])

  function start() {
    if (!token) {
      navigate('/login')
      return
    }
    setOpen(true)
  }

  async function submit() {
    try {
      await authApi(`/api/products/${productId}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      alert('신고가 접수됐어요.')
    } catch (err) {
      alert(err.message)
    }
    setOpen(false)
  }

  return (
    <>
      <button className="btn btn-sm btn-link p-0 small" style={{ color: 'var(--color-text-sub)' }} onClick={start}>
        <i className="bi bi-flag" /> 신고하기
      </button>
      {open && (
        <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-body">
                <p className="fw-semibold">어떤 문제가 있나요?</p>
                {REASONS.map((r) => (
                  <div key={r} className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      id={`reason-${r}`}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                    />
                    <label className="form-check-label" htmlFor={`reason-${r}`}>{r}</label>
                  </div>
                ))}
                <div className="mt-3">
                  <button className="btn btn-outline-danger me-2" onClick={submit}>신고</button>
                  <button className="btn btn-outline-secondary" onClick={() => setOpen(false)}>취소</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ReportButton
