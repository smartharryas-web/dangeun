import { useState } from 'react'

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
    </div>
  )
}

export default NewProduct
