import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { useAuth } from '../hooks/useAuth.jsx'

function ProductDetail() {
  const { id } = useParams()
  const { user, authApi } = useAuth()
  const [product, setProduct] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

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
        <p>{user && user.id === product.seller_id ? '내가 쓴 글' : `판매자: ${product.seller_username}`}</p>
      </div>
    </div>
  )
}

export default ProductDetail
