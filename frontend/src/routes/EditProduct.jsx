import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth.jsx'
import { api, urlsToFiles } from '../api.js'
import ProductForm, { productToForm, checkForm, toFormData } from '../components/ProductForm.jsx'

// 상품 고치기 화면 (/product/:id/edit)
// 원래 내용 · 사진을 받아 칸에 채워 두고(입력 칸은 올리기 화면과 같은 ProductForm), 저장하면 상세로 돌아간다
function EditProduct() {
  const { id } = useParams()
  const { user, authApi } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [values, setValues] = useState(null)
  const [images, setImages] = useState([])

  // 원래 상품 내용 불러와서 칸에 채우기 (사진은 파일로 바꿔 둬야 순서 바꾸기 · 빼기가 올리기 화면과 똑같이 됨)
  useEffect(() => {
    async function load() {
      try {
        const data = await api(`/api/products/${id}`)
        setProduct(data)
        setValues(productToForm(data))
        setImages(await urlsToFiles(data.images))
      } catch (e) {
        setErrorMessage(e.status === 404 ? '없는 상품입니다.' : e.message)
      }
    }
    load()
  }, [id])

  function handleChange(name, value) {
    setValues({ ...values, [name]: value })
  }

  async function handleSubmit() {
    const problem = checkForm(values, images)
    if (problem) {
      alert(problem)
      return
    }

    try {
      await authApi(`/api/products/${id}`, { method: 'PATCH', body: toFormData(values, images) })
      navigate(`/product/${id}`)
    } catch (e) {
      alert(e.message)
    }
  }

  if (errorMessage) return <p>{errorMessage}</p>
  if (!product || !user || !values) return <p>불러오는 중...</p>
  if (user.id !== product.seller_id) return <p>내 상품만 고칠 수 있습니다.</p>

  return (
    <div style={{ maxWidth: 720 }}>
      <h2 className="h4 mb-3">상품 고치기</h2>
      <ProductForm values={values} onChange={handleChange} images={images} setImages={setImages} />
      <button className="btn btn-outline-secondary" onClick={() => navigate(`/product/${id}`)}>취소</button>
      <button className="btn btn-primary ms-2" onClick={handleSubmit}>저장</button>
    </div>
  )
}

export default EditProduct
