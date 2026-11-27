import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth.jsx'
import { imageSrc } from '../api.js'
import { formatPrice } from '../format.js'

// 채팅방 (/chats/:roomId, 로그인 필요)
// 실시간 연결 대신 3초마다 "마지막으로 받은 번호 뒤에 새 메시지 있어?" 하고 물어본다
function ChatRoom() {
  const { roomId } = useParams()
  const { user, authApi } = useAuth()
  const [room, setRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const lastIdRef = useRef(0) // 마지막으로 받은 메시지 번호 (화면을 다시 그리지 않아도 되는 값이라 useRef)
  const bottomRef = useRef(null)

  // 방 정보 (상품 · 상대방)
  useEffect(() => {
    authApi(`/api/chats/${roomId}`, {})
      .then(setRoom)
      .catch((e) => setErrorMessage(e.status === 403 ? '내 채팅방이 아닙니다.' : e.message))
  }, [roomId])

  // 새 메시지 받기: 처음 한 번 + 3초마다
  useEffect(() => {
    lastIdRef.current = 0
    setMessages([])
    let stop = false

    async function poll() {
      try {
        const fresh = await authApi(`/api/chats/${roomId}/messages?after_id=${lastIdRef.current}`, {})
        if (stop || fresh.length === 0) return
        lastIdRef.current = fresh[fresh.length - 1].id
        setMessages((prev) => [...prev, ...fresh])
      } catch {
        // 잠깐 못 받아도 다음 차례에 다시 물어본다
      }
    }
    poll()
    const timer = setInterval(poll, 3000)
    return () => { stop = true; clearInterval(timer) }
  }, [roomId])

  // 새 메시지가 오면 맨 아래로 내린다
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length])

  async function send(e) {
    e.preventDefault()
    if (text.trim() === '') return
    try {
      const message = await authApi(`/api/chats/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      })
      // 내가 보낸 건 바로 붙이고, 마지막 번호도 올려서 다음 물어보기 때 또 받지 않게
      lastIdRef.current = Math.max(lastIdRef.current, message.id)
      setMessages((prev) => [...prev, message])
      setText('')
    } catch (err) {
      alert(err.message)
    }
  }

  if (errorMessage) return <p>{errorMessage}</p>
  if (!room || !user) return <p>불러오는 중...</p>

  return (
    <div style={{ maxWidth: 640 }}>
      {/* 위쪽: 어떤 상품 · 누구와 */}
      <Link to={`/product/${room.product_id}`} className="product d-flex gap-3 align-items-center p-2 mb-3 rounded" style={{ background: 'var(--color-surface)' }}>
        <img src={imageSrc(room.product_image_url)} alt="" width="56" height="56" style={{ objectFit: 'cover' }} />
        <div>
          <div className="fw-semibold">{room.product_title}</div>
          <div className="small">{formatPrice(room.product_price)} · {room.product_status}</div>
        </div>
      </Link>
      <div className="small mb-2" style={{ color: 'var(--color-text-sub)' }}>{room.other_username}님과의 채팅</div>

      <div className="border rounded p-3 mb-3" style={{ height: 420, overflowY: 'auto' }}>
        {messages.length === 0 && <p className="small" style={{ color: 'var(--color-text-sub)' }}>첫 메시지를 보내 보세요.</p>}
        {messages.map((m) => {
          const mine = m.sender_id === user.id
          return (
            <div key={m.id} className={`d-flex mb-2 ${mine ? 'justify-content-end' : ''}`}>
              <div
                className="px-3 py-2 rounded"
                style={{
                  maxWidth: '75%',
                  whiteSpace: 'pre-wrap',
                  background: mine ? 'var(--color-point)' : 'var(--color-surface)',
                  color: mine ? 'var(--color-on-point)' : 'inherit',
                }}
              >
                {m.content}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form className="d-flex gap-2" onSubmit={send}>
        <input className="form-control" value={text} maxLength={1000} onChange={(e) => setText(e.target.value)} placeholder="메시지 보내기" />
        <button className="btn btn-primary flex-shrink-0">보내기</button>
      </form>
      <div className="small mt-2" style={{ color: 'var(--color-text-sub)' }}>
        카카오톡 · 문자 등 외부 채널로 옮겨 가자는 요청은 사기일 수 있어요. 거래는 Encore 안에서 해 주세요.
      </div>
    </div>
  )
}

export default ChatRoom
