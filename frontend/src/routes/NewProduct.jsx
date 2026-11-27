import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth.jsx'
import { urlsToFiles } from '../api.js'
import ProductForm, { EMPTY_FORM, checkForm, toFormData } from '../components/ProductForm.jsx'

// 상품 올리기 화면 (/new): 입력 칸은 ProductForm(고치기 화면과 같이 씀), 이 화면은 임시저장 · 등록만 맡는다
function NewProduct() {
  const [values, setValues] = useState(EMPTY_FORM)
  const [images, setImages] = useState([])
  const { authApi } = useAuth()
  const navigate = useNavigate()

  function handleChange(name, value) {
    setValues({ ...values, [name]: value })
  }

  // 들어오면 임시저장이 있는지 보고, 있으면 불러올지 물어본다
  useEffect(() => {
    let ignore = false

    async function loadTemp() {
      let temp
      try {
        temp = await authApi('/api/tempMemory', {})
      } catch {
        return // 404면 임시저장이 없는 것
      }
      if (ignore) return
      if (!confirm('임시저장된 품목이 있습니다. 불러올까요?')) return

      try {
        // 서버에 저장된 사진을 받아 와서 파일로 만든다 (아래에서 서버 사진이 지워지기 때문)
        const files = await urlsToFiles(temp.images)
        setValues({
          ...EMPTY_FORM,
          title: temp.title || '',
          category: temp.category || '',
          price: temp.price ?? '',
          description: temp.description || '',
          location: temp.location || '',
        })
        setImages(files)
        await authApi('/api/tempMemory', { method: 'DELETE' })
      } catch (e) {
        alert(e.message)
      }
    }
    loadTemp()

    return () => { ignore = true }
  }, [])

  // 임시저장: 서버 임시저장 칸(상품명 · 카테고리 · 가격 · 설명 · 장소 · 첫 사진)만 보낸다
  async function handleTempSave() {
    const { title, category, price, description, location } = values
    const form = toFormData({ title, category, price, description, location }, images.slice(0, 1))

    try {
      await authApi('/api/tempMemory', { method: 'POST', body: form })
      alert('임시저장되었습니다. (사진은 첫 장만 저장돼요)')
    } catch (e) {
      alert(e.message)
    }
  }

  async function handleSubmit() {
    const problem = checkForm(values, images)
    if (problem) {
      alert(problem)
      return
    }

    try {
      const product = await authApi('/api/products', { method: 'POST', body: toFormData(values, images) })
      navigate(`/product/${product.id}`)
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 className="page-title">새 상품 올리기</h1>
      <ProductForm values={values} onChange={handleChange} images={images} setImages={setImages} />
      <button className="btn btn-outline-secondary" onClick={handleTempSave}>임시저장</button>
      <button className="btn btn-primary ms-2" onClick={handleSubmit}>등록하기</button>
    </div>
  )
}

export default NewProduct
