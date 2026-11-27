import { useState } from 'react'
import { imageSrc } from '../api.js'

// 상세 사진 넘겨 보기: 큰 사진 하나 + 양옆 화살표 + 아래 작은 사진들(누르면 그 사진으로)
function ImageGallery({ images, alt }) {
  const [index, setIndex] = useState(0)
  const last = images.length - 1

  return (
    <div style={{ width: 512, maxWidth: '100%' }}>
      <div className="position-relative">
        <img
          src={imageSrc(images[index])}
          alt={`${alt} ${index + 1}`}
          width="512"
          height="512"
          style={{ objectFit: 'cover', width: '100%', height: 'auto', aspectRatio: '1 / 1', background: 'var(--color-surface)' }}
        />
        {images.length > 1 && (
          <>
            <button
              className="btn btn-light gallery-arrow position-absolute top-50 start-0 translate-middle-y ms-2"
              onClick={() => setIndex(index === 0 ? last : index - 1)}
              aria-label="이전 사진"
            >
              <i className="bi bi-chevron-left" aria-hidden="true" />
            </button>
            <button
              className="btn btn-light gallery-arrow position-absolute top-50 end-0 translate-middle-y me-2"
              onClick={() => setIndex(index === last ? 0 : index + 1)}
              aria-label="다음 사진"
            >
              <i className="bi bi-chevron-right" aria-hidden="true" />
            </button>
            <span className="badge text-bg-dark position-absolute bottom-0 end-0 m-2">{index + 1} / {images.length}</span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="d-flex gap-2 mt-2 overflow-auto">
          {/* 작은 사진은 button으로 감싼다: img에 onClick만 달면 마우스로만 눌리고 키보드(Tab · Enter)로는 못 누름 */}
          {images.map((url, i) => (
            <button
              key={url}
              className={`gallery-thumb ${i === index ? 'is-current' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`사진 ${i + 1} 보기`}
              aria-current={i === index}
            >
              <img src={imageSrc(url)} alt="" width="56" height="56" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageGallery
