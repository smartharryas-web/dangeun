import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth.jsx'
import { SERVER_URL } from '../api.js'

const CATEGORIES = [
  '여성의류', '남성의류', '신발', '가방/지갑', '시계', '쥬얼리', '패션 액세서리',
  '디지털', '가전제품', '트레이딩 카드', '스포츠/레저', '차량/오토바이', '스타굿즈',
  '키덜트', '예술/희귀/수집품', '음반/악기', '도서/티켓/문구', '뷰티/미용',
  '가구/인테리어', '생활/주방용품', '공구/산업용품', '식품', '유아동/출산',
  '반려동물용품', '기타', '재능',
]

function NewProduct() {
  const [images, setImages] = useState([])
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const { authApi } = useAuth()
  const navigate = useNavigate()

  // 들어오면 임시저장이 있는지 보고, 있으면 불러올지 물어본다
  useEffect(() => {
    let ignore = false

    async function loadTemp() {
      let temp
      try {
        temp = await authApi('/api/tempMemory', {})
      } catch (e) {
        return // 404면 임시저장이 없는 것
      }
      if (ignore) return
      if (!confirm('임시저장된 품목이 있습니다. 불러올까요?')) return

      try {
        // 서버에 저장된 사진을 받아 와서 파일로 만든다 (아래에서 서버 사진이 지워지기 때문)
        const files = []
        for (const url of temp.images) {
          const res = await fetch(`${SERVER_URL}${url}`)
          const blob = await res.blob()
          files.push(new File([blob], url.split('/').pop(), { type: blob.type }))
        }

        setTitle(temp.title || '')
        setCategory(temp.category || '')
        setPrice(temp.price || '')
        setDescription(temp.description || '')
        setLocation(temp.location || '')
        setImages(files)

        await authApi('/api/tempMemory', { method: 'DELETE' })
      } catch (e) {
        alert(e.message)
      }
    }
    loadTemp()

    return () => { ignore = true }
  }, [])

  async function handleTempSave() {
    const form = new FormData()
    if (title) form.append('title', title)
    if (category) form.append('category', category)
    if (price) form.append('price', price)
    if (description) form.append('description', description)
    if (location) form.append('location', location)
    images.forEach(image => form.append('images', image))

    try {
      await authApi('/api/tempMemory', { method: 'POST', body: form })
      alert('임시저장되었습니다.')
    } catch (e) {
      alert(e.message)
    }
  }

  async function handleSubmit() {
    if (images.length === 0 || !title || !price || !description || !location) {
      alert('빠진 칸이 있습니다. 사진 · 상품명 · 가격 · 설명 · 거래 희망 장소를 모두 입력해 주세요.')
      return
    }

    const form = new FormData()
    form.append('title', title)
    form.append('price', price)
    form.append('description', description)
    form.append('location', location)
    images.forEach(image => form.append('images', image))

    try {
      await authApi('/api/products', { method: 'POST', body: form })
      navigate('/')
    } catch (e) {
      alert(e.message)
    }
  }

  function handleImages(e) {
    const files = [...e.target.files]
    e.target.value = ''

    if (images.length + files.length > 10) {
      setError('사진은 10장을 넘게 넣을 수 없습니다.')
      return
    }

    setError('')
    setImages([...images, ...files])
  }

  return (
    <div>
      <h2 className="h4 mb-3">새 상품 올리기</h2>
      <input className="form-control mb-3" type="file" accept="image/*" multiple onChange={handleImages} />
      {error && <p className="text-danger">{error}</p>}
      <div className="d-flex flex-wrap gap-2">
        {images.map((image, i) => (
          <img key={i} src={URL.createObjectURL(image)} style={{ width: '10%' }} />
        ))}
      </div>
      <label className="form-label mt-3" htmlFor="title">상품명</label>
      <input className="form-control mb-3" id="title" value={title} onChange={e => setTitle(e.target.value)} />
      <label className="form-label" htmlFor="category">카테고리</label>
      <select className="form-select mb-3" id="category" value={category} onChange={e => setCategory(e.target.value)}>
        <option value="">카테고리 선택</option>
        {CATEGORIES.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <label className="form-label" htmlFor="price">가격</label>
      <input className="form-control mb-3" id="price" type="number" value={price} onChange={e => setPrice(e.target.value)} />
      <label className="form-label" htmlFor="description">설명</label>
      <textarea className="form-control mb-3" id="description" rows="5" value={description} onChange={e => setDescription(e.target.value)} />
      <label className="form-label" htmlFor="location">거래 희망 장소</label>
      <input className="form-control mb-3" id="location" value={location} onChange={e => setLocation(e.target.value)} />
      <button className="btn btn-outline-secondary" onClick={handleTempSave}>임시저장</button>
      <button className="btn btn-primary ms-2" onClick={handleSubmit}>등록하기</button>
    </div>
  )
}

export default NewProduct
