import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../hooks/useAuth.jsx'
import { imageSrc } from '../api.js'
import { timeAgo } from '../format.js'

// 내 채팅방 목록 (/chats, 로그인 필요): 최근 메시지가 온 방부터
function Chats() {
  const { authApi } = useAuth()
  const [rooms, setRooms] = useState(null)

  useEffect(() => {
    authApi('/api/chats', {}).then(setRooms).catch((e) => alert(e.message))
  }, [])

  if (rooms === null) return <p>불러오는 중...</p>

  return (
    <div style={{ maxWidth: 640 }}>
      <h2 className="h4 mb-3">채팅</h2>
      {rooms.length === 0 ? (
        <p>아직 채팅이 없습니다. 상품 상세에서 "채팅하기"를 눌러 보세요.</p>
      ) : (
        <div className="list-group">
          {rooms.map((r) => (
            <Link key={r.id} to={`/chats/${r.id}`} className="list-group-item list-group-item-action d-flex gap-3 align-items-center">
              <img src={imageSrc(r.product_image_url)} alt="" width="48" height="48" style={{ objectFit: 'cover' }} />
              <div className="flex-grow-1 overflow-hidden">
                <div>
                  <strong>{r.other_username}</strong>
                  <span className="small ms-2" style={{ color: 'var(--color-text-sub)' }}>
                    {r.i_am_seller ? '구매 문의' : '판매자'} · {r.product_title}
                  </span>
                </div>
                <div className="small text-truncate">{r.last_message || '아직 메시지가 없어요'}</div>
              </div>
              <div className="text-end small flex-shrink-0">
                {r.last_at && <div style={{ color: 'var(--color-text-sub)' }}>{timeAgo(r.last_at)}</div>}
                {r.unread > 0 && (
                  <span className="badge rounded-pill" style={{ background: 'var(--color-point)', color: 'var(--color-on-point)' }}>
                    {r.unread}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Chats
