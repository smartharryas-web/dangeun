import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth.jsx'
import { api, imageSrc } from '../api.js'

// 상품 고치기 화면 (/product/:id/edit)
// 원래 내용을 받아 칸에 채워 두고, 저장하면 상세로 돌아간다
// 사진은 새로 고를 때만 바뀐다 (안 고르면 원래 사진 그대로)
function EditProduct() {
  const { id } = useParams()
  const { user, authApi } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [image, setImage] = useState(null)

  // 원래 상품 내용 불러와서 칸에 채우기
  useEffect(() => {
    async function load() {
      try {
        const data = await api(`/api/products/${id}`)
        setProduct(data)
        setTitle(data.title)
        setPrice(data.price)
        setDescription(data.description)
        setLocation(data.location)
      } catch (e) {
        setErrorMessage(e.status === 404 ? '없는 상품입니다.' : e.message)
      }
    }
    load()
  }, [id])

  async function handleSubmit() {
    if (!title || !price || !description || !location) {
      alert('빠진 칸이 있습니다. 상품명 · 가격 · 설명 · 거래 희망 장소를 모두 입력해 주세요.')
      return
    }

    const form = new FormData()
    form.append('title', title)
    form.append('price', price)
    form.append('description', description)
    form.append('location', location)
    if (image) form.append('images', image)

    try {
      await authApi(`/api/products/${id}`, { method: 'PATCH', body: form })
      navigate(`/product/${id}`)
    } catch (e) {
      alert(e.message)
    }
  }

  if (errorMessage) return <p>{errorMessage}</p>
  if (!product || !user) return <p>불러오는 중...</p>
  if (user.id !== product.seller_id) return <p>내 상품만 고칠 수 있습니다.</p>

  return (
    <div>
      <h2 className="h4 mb-3">상품 고치기</h2>
      <img
        src={image ? URL.createObjectURL(image) : imageSrc(product.image_url)}
        alt={product.title}
        width="160"
        height="160"
        style={{ objectFit: 'cover' }}
      />
      <input
        className="form-control my-3"
        type="file"
        accept="image/*"
        onChange={e => setImage(e.target.files[0] || null)}
      />
      <label className="form-label" htmlFor="title">상품명</label>
      <input className="form-control mb-3" id="title" value={title} onChange={e => setTitle(e.target.value)} />
      <label className="form-label" htmlFor="price">가격</label>
      <input className="form-control mb-3" id="price" type="number" value={price} onChange={e => setPrice(e.target.value)} />
      <label className="form-label" htmlFor="description">설명</label>
      <textarea className="form-control mb-3" id="description" rows="5" value={description} onChange={e => setDescription(e.target.value)} />
      <label className="form-label" htmlFor="location">거래 희망 장소</label>
      <input className="form-control mb-3" id="location" value={location} onChange={e => setLocation(e.target.value)} />
      <button className="btn btn-outline-secondary" onClick={() => navigate(`/product/${id}`)}>취소</button>
      <button className="btn btn-primary ms-2" onClick={handleSubmit}>저장</button>
    </div>
  )
}

export default EditProduct
