import { Link } from 'react-router'

// 상세의 상품 정보 묶음: 상품 상태 · 브랜드 · 거래 방식 · 가격 제안 · 보증서 · 태그
function ProductInfo({ product }) {
  const trade = [
    product.can_meet && '직거래',
    product.can_ship && (product.shipping_included ? '택배 (배송비 포함)' : '택배 (배송비 별도)'),
  ].filter(Boolean).join(' · ')

  const rows = [
    ['상품 상태', product.condition],
    ['브랜드', product.brand],
    ['거래 방식', trade],
  ].filter(([, value]) => value)

  return (
    <div className="mb-3">
      {/* 눈에 띄어야 하는 표시 */}
      <div className="d-flex flex-wrap gap-2 mb-2">
        {product.has_warranty && (
          <span className="tag tag-point">
            <i className="bi bi-patch-check" aria-hidden="true" /> 판매자 제공 보증서 있음
          </span>
        )}
        {product.negotiable && <span className="tag">가격 제안 가능</span>}
      </div>

      {rows.length > 0 && (
        <table className="table table-sm small mb-2" style={{ maxWidth: 420 }}>
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label}>
                <th scope="row" className="fw-normal" style={{ width: 96, color: 'var(--color-text-sub)' }}>{label}</th>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 태그: 누르면 그 태그로 검색 */}
      {product.tags.length > 0 && (
        <div className="d-flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <Link key={tag} to={`/?q=${encodeURIComponent(tag)}`} className="tag-link">#{tag}</Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductInfo
