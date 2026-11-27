import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth.jsx'

function ProductDetail() {
  const { id } = useParams()
  const { user, authApi } = useAuth()
  const [product, setProduct] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        setProduct(await authApi(`/api/products/${id}`, {}))
      } catch (e) {
        if (e.status === 404) setErrorMessage('없는 게시물입니다.')
        else if (e.status === 422) setErrorMessage('잘못된 경로입니다.')
      }
    }
    load()
  }, [id])

  if (errorMessage) return <p>{errorMessage}</p>

  if (!product) return <p>불러오는 중...</p>

  const isMine = user && user.id === product.seller_id

  return (
    <div className="d-flex gap-4">
      <img
        className="flex-shrink-0"
        src={product.image_url}
        alt={product.title}
        width="512"
        height="512"
        style={{ objectFit: 'cover' }}
      />
      <div>
        <h2>{product.title}</h2>
        <p>{product.price}원</p>
        <p>{product.description}</p>
        <p>{product.status}</p>
        <p>{product.location}</p>
        <p>{isMine ? '내가 쓴 글' : `판매자: ${product.seller_username}`}</p>
        {isMine && (
          <div>
            <Link to={`/product/${id}/edit`} className="btn btn-outline-secondary me-2">
              수정
            </Link>
            <button className="btn btn-outline-danger" onClick={() => setShowConfirm(true)}>
              삭제
            </button>
          </div>
        )}
        {showConfirm && (
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-body">
                  <p>정말 삭제할까요?</p>
                  <button className="btn btn-outline-danger me-2">확인</button>
                  <button className="btn btn-outline-secondary" onClick={() => setShowConfirm(false)}>
                    취소
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetail
