import { useState } from 'react'
import { CATEGORIES, CONDITIONS } from '../constants.js'

const MAX_IMAGES = 10
const MAX_DESCRIPTION = 2000

// 빈 양식 (올리기 화면이 처음 쓰는 값)
export const EMPTY_FORM = {
  title: '', category: '', condition: '', brand: '', tags: '',
  price: '', negotiable: false,
  can_meet: true, can_ship: false, shipping_included: false,
  has_warranty: false,
  description: '', location: '',
}

// 상품 → 양식 값 (고치기 화면이 원래 내용을 채울 때)
export function productToForm(p) {
  return {
    title: p.title, category: p.category || '', condition: p.condition || '', brand: p.brand || '',
    tags: p.tags.join(' '), price: p.price, negotiable: p.negotiable,
    can_meet: p.can_meet, can_ship: p.can_ship, shipping_included: p.shipping_included,
    has_warranty: p.has_warranty, description: p.description, location: p.location,
  }
}

// 빠진 칸 검사: 빠진 게 있으면 안내 글, 없으면 ''
export function checkForm(values, images) {
  if (images.length === 0) return '사진을 1장 이상 넣어 주세요.'
  if (!values.title || !values.category || !values.condition || values.price === '' || !values.description || !values.location) {
    return '빠진 칸이 있습니다. 사진 · 상품명 · 카테고리 · 상품 상태 · 가격 · 설명 · 거래 희망 장소를 모두 입력해 주세요.'
  }
  if (!values.can_meet && !values.can_ship) return '직거래 · 택배 중 하나는 골라 주세요.'
  return ''
}

// 양식 값 + 사진 → 서버에 보낼 form-data (빈 글자 칸은 안 보냄)
export function toFormData(values, images) {
  const form = new FormData()
  for (const [key, value] of Object.entries(values)) {
    if (value === '' || value === null) continue
    form.append(key, value)
  }
  images.forEach((image) => form.append('images', image))
  return form
}

// 상품 올리기 · 고치기가 같이 쓰는 입력 칸 묶음
// 값은 부모가 들고 있고(values · images), 바뀌면 onChange(칸 이름, 값) · setImages로 알려 준다
function ProductForm({ values, onChange, images, setImages }) {
  const [imageError, setImageError] = useState('')
  const [dragging, setDragging] = useState(false)

  // 사진 넣기 (파일 고르기 · 끌어다 놓기 둘 다 여기로)
  function addImages(fileList) {
    const files = [...fileList].filter((f) => f.type.startsWith('image/'))
    if (images.length + files.length > MAX_IMAGES) {
      setImageError(`사진은 ${MAX_IMAGES}장을 넘게 넣을 수 없습니다.`)
      return
    }
    setImageError('')
    setImages([...images, ...files])
  }

  // 사진 순서 바꾸기: i번째를 한 칸 앞(-1)이나 뒤(+1)로
  function moveImage(i, step) {
    const j = i + step
    if (j < 0 || j >= images.length) return
    const next = [...images]
    ;[next[i], next[j]] = [next[j], next[i]]
    setImages(next)
  }

  function removeImage(i) {
    setImages(images.filter((_, k) => k !== i))
  }

  // 체크칸 · 글자칸 공통
  const field = (name) => ({
    id: name,
    value: values[name],
    onChange: (e) => onChange(name, e.target.value),
  })
  const check = (name) => ({
    id: name,
    type: 'checkbox',
    className: 'form-check-input',
    checked: values[name],
    onChange: (e) => onChange(name, e.target.checked),
  })

  return (
    <div>
      {/* 사진: 끌어다 놓거나 눌러서 고르기, 첫 장이 대표 사진 */}
      <label className="form-label">사진 ({images.length}/{MAX_IMAGES})</label>
      <div
        className="border rounded p-3 mb-2 text-center"
        style={{ borderStyle: 'dashed', background: dragging ? 'var(--color-surface)' : 'transparent' }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addImages(e.dataTransfer.files) }}
      >
        <div className="small mb-2" style={{ color: 'var(--color-text-sub)' }}>사진을 여기로 끌어다 놓거나</div>
        <input
          className="form-control"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => { addImages(e.target.files); e.target.value = '' }}
        />
      </div>
      {imageError && <p className="text-danger small">{imageError}</p>}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {images.map((image, i) => (
          <div key={i} className="text-center" style={{ width: 96 }}>
            <img src={URL.createObjectURL(image)} alt="" width="96" height="96" style={{ objectFit: 'cover' }} />
            <div className="d-flex justify-content-between small">
              <button type="button" className="btn btn-sm p-0" onClick={() => moveImage(i, -1)} aria-label="앞으로">◀</button>
              <span>{i === 0 ? '대표' : i + 1}</span>
              <button type="button" className="btn btn-sm p-0" onClick={() => moveImage(i, 1)} aria-label="뒤로">▶</button>
              <button type="button" className="btn btn-sm p-0" onClick={() => removeImage(i)} aria-label="빼기">✕</button>
            </div>
          </div>
        ))}
      </div>

      <label className="form-label" htmlFor="title">상품명</label>
      <input className="form-control mb-3" maxLength={40} {...field('title')} />

      <div className="row g-2 mb-3">
        <div className="col-sm">
          <label className="form-label" htmlFor="category">카테고리</label>
          <select className="form-select" {...field('category')}>
            <option value="">카테고리 선택</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="col-sm">
          <label className="form-label" htmlFor="condition">상품 상태</label>
          <select className="form-select" {...field('condition')}>
            <option value="">상태 선택</option>
            {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="col-sm">
          <label className="form-label" htmlFor="brand">브랜드 (선택)</label>
          <input className="form-control" {...field('brand')} />
        </div>
      </div>

      <label className="form-label" htmlFor="tags">태그 (선택 · 띄어쓰기로 구분, 5개까지, 하나에 9글자까지)</label>
      <input className="form-control mb-3" placeholder="#롤렉스 #풀세트" {...field('tags')} />

      <label className="form-label" htmlFor="price">가격</label>
      <input className="form-control mb-2" type="number" min="0" {...field('price')} />
      <div className="form-check mb-3">
        <input {...check('negotiable')} />
        <label className="form-check-label" htmlFor="negotiable">가격 제안 받기</label>
      </div>

      <div className="mb-3">
        <div className="form-label">거래 방식</div>
        <div className="form-check form-check-inline">
          <input {...check('can_meet')} />
          <label className="form-check-label" htmlFor="can_meet">직거래</label>
        </div>
        <div className="form-check form-check-inline">
          <input {...check('can_ship')} />
          <label className="form-check-label" htmlFor="can_ship">택배</label>
        </div>
        {values.can_ship && (
          <div className="form-check form-check-inline">
            <input {...check('shipping_included')} />
            <label className="form-check-label" htmlFor="shipping_included">배송비 포함</label>
          </div>
        )}
      </div>

      <div className="form-check mb-3">
        <input {...check('has_warranty')} />
        <label className="form-check-label" htmlFor="has_warranty">보증서 · 구매 영수증 있음</label>
        <div className="small" style={{ color: 'var(--color-text-sub)' }}>
          상품 페이지에 "판매자 제공 보증서 있음"으로 표시돼요. Encore가 직접 검수한 건 아니에요.
        </div>
      </div>

      <label className="form-label d-flex justify-content-between" htmlFor="description">
        <span>설명</span>
        <span className="small" style={{ color: 'var(--color-text-sub)' }}>{values.description.length}/{MAX_DESCRIPTION}</span>
      </label>
      <textarea className="form-control mb-3" rows="6" maxLength={MAX_DESCRIPTION} {...field('description')} />

      <label className="form-label" htmlFor="location">거래 희망 장소</label>
      <input className="form-control mb-3" {...field('location')} />

      {/* 거래 안내 */}
      <div className="small p-3 mb-3 rounded" style={{ background: 'var(--color-surface)' }}>
        <div>· 카카오톡 · 문자 등 외부 채널로 거래를 유도하는 글은 삭제될 수 있어요.</div>
        <details>
          <summary>· 거래 금지 품목 보기</summary>
          위조품 · 가품, 의약품 · 의료기기, 주류 · 담배, 개인정보 · 계정, 성인용품, 무기류, 살아 있는 동물, 법으로 거래가 막힌 물건
        </details>
      </div>
    </div>
  )
}

export default ProductForm
