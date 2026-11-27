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
          style={{ objectFit: 'cover', width: '100%', height: 'auto', aspectRatio: '1 / 1' }}
        />
        {images.length > 1 && (
          <>
            <button
              className="btn btn-light btn-sm position-absolute top-50 start-0 translate-middle-y ms-2"
              onClick={() => setIndex(index === 0 ? last : index - 1)}
              aria-label="이전 사진"
            >
              <i className="bi bi-chevron-left" />
            </button>
            <button
              className="btn btn-light btn-sm position-absolute top-50 end-0 translate-middle-y me-2"
              onClick={() => setIndex(index === last ? 0 : index + 1)}
              aria-label="다음 사진"
            >
              <i className="bi bi-chevron-right" />
            </button>
            <span className="badge text-bg-dark position-absolute bottom-0 end-0 m-2">{index + 1} / {images.length}</span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="d-flex gap-2 mt-2 overflow-auto">
          {images.map((url, i) => (
            <img
              key={url}
              src={imageSrc(url)}
              alt=""
              width="56"
              height="56"
              onClick={() => setIndex(i)}
              style={{ objectFit: 'cover', cursor: 'pointer', opacity: i === index ? 1 : 0.5 }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageGallery
