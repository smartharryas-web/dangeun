import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../hooks/useAuth.jsx'
import { timeAgo } from '../format.js'

// 알림함 (/notifications, 로그인 필요): 받아 온 뒤 전부 읽음으로 바꾼다
function Notifications() {
  const { authApi } = useAuth()
  const [items, setItems] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        setItems(await authApi('/api/notifications', {}))
        await authApi('/api/notifications/read-all', { method: 'POST' })
      } catch (e) {
        alert(e.message)
      }
    }
    load()
  }, [])

  if (items === null) return <p>불러오는 중...</p>

  return (
    <div style={{ maxWidth: 640 }}>
      <h2 className="h4 mb-3">알림</h2>
      {items.length === 0 ? (
        <p>아직 알림이 없습니다.</p>
      ) : (
        <div className="list-group">
          {items.map((n) => (
            <Link
              key={n.id}
              to={n.link}
              className="list-group-item list-group-item-action"
              style={n.is_read ? {} : { background: 'var(--color-surface)' }}
            >
              <div>{n.message}</div>
              <div className="small" style={{ color: 'var(--color-text-sub)' }}>{timeAgo(n.created_at)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications
