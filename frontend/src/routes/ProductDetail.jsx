import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth.jsx'
import { api, imageSrc } from '../api.js'

// 서버가 준 시간 글자(2026-11-27T14:30:00)를 "11/27 14:30" 모양으로 바꾼다
function formatTime(text) {
  const date = new Date(text)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}/${day} ${hour}:${minute}`
}

function ProductDetail() {
  const { id } = useParams()
  const { user, authApi } = useAuth()
  const [product, setProduct] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [deleteCommentId, setDeleteCommentId] = useState(null)
  const [editCommentId, setEditCommentId] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        // 로그인 없이 받는 주소라 api()로 (Home 상품 목록과 같은 방식)
        setProduct(await api(`/api/products/${id}`))
      } catch (e) {
        if (e.status === 404) setErrorMessage('없는 게시물입니다.')
        else if (e.status === 422) setErrorMessage('잘못된 경로입니다.')
        // 그 밖의 에러(서버 꺼짐 등)는 "불러오는 중..."에 멈추지 않게 메시지를 보여 준다
        else setErrorMessage(e.message)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    async function loadComments() {
      try {
        setComments(await api(`/api/products/${id}/comments`))
      } catch (e) {
        // 없는 상품 등의 에러는 위에서 이미 안내하므로 여기서는 넘어간다
      }
    }
    loadComments()
  }, [id])

  if (errorMessage) return <p>{errorMessage}</p>

  if (!product) return <p>불러오는 중...</p>

  const isMine = user && user.id === product.seller_id

  async function submitComment() {
    if (commentText.trim() === '') return

    // 실패하면 조용히 넘어가지 않고 알려 준다 (NewProduct와 같은 방식)
    try {
      if (editCommentId === null) {
        const comment = await authApi(`/api/products/${id}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: commentText }),
        })
        setComments([...comments, comment])
      } else {
        const edited = await authApi(`/api/comments/${editCommentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: commentText }),
        })
        setComments(comments.map((comment) => (comment.id === editCommentId ? edited : comment)))
        setEditCommentId(null)
      }
      setCommentText('')
    } catch (e) {
      alert(e.message)
    }
  }

  async function deleteComment() {
    try {
      await authApi(`/api/comments/${deleteCommentId}`, { method: 'DELETE' })
      setComments(comments.filter((comment) => comment.id !== deleteCommentId))
    } catch (e) {
      alert(e.message)
    }
    setDeleteCommentId(null)
  }

  return (
    <div className="d-flex gap-4">
      <div className="flex-shrink-0">
        <img
          src={imageSrc(product.image_url)}
          alt={product.title}
          width="512"
          height="512"
          style={{ objectFit: 'cover' }}
        />
        <h5>댓글</h5>
        {/* 댓글 쓰기 칸은 로그인한 사람만 (댓글 목록은 누구나 봄) */}
        {user && (
          <div className="d-flex gap-2">
            <input
              className="form-control"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button className="btn btn-outline-secondary" onClick={submitComment}>
              제출
            </button>
            {editCommentId !== null && (
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setEditCommentId(null)
                  setCommentText('')
                }}
              >
                취소
              </button>
            )}
          </div>
        )}
        {comments.map((comment) => (
          <div key={comment.id}>
            <strong>{comment.username}</strong> {comment.content}
            <span className="ms-2">
              {comment.updated_at ? '수정됨' : formatTime(comment.created_at)}
            </span>
            {user && user.id === comment.user_id && (
              <>
                <button
                  className="btn btn-sm btn-outline-secondary ms-2"
                  onClick={() => {
                    setEditCommentId(comment.id)
                    setCommentText(comment.content)
                  }}
                >
                  수정
                </button>
                <button
                  className="btn btn-sm btn-outline-danger ms-1"
                  onClick={() => setDeleteCommentId(comment.id)}
                >
                  삭제
                </button>
              </>
            )}
          </div>
        ))}
        {deleteCommentId !== null && (
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-body">
                  <p>정말 삭제할까요?</p>
                  <button className="btn btn-outline-danger me-2" onClick={deleteComment}>
                    확인
                  </button>
                  <button className="btn btn-outline-secondary" onClick={() => setDeleteCommentId(null)}>
                    취소
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div>
        <h2>{product.title}</h2>
        <p>{product.price}원</p>
        <p>{product.description}</p>
        <p>{product.status}</p>
        <p>{product.location}</p>
        <p>{isMine ? '내가 쓴 글' : `판매자: ${product.seller_username}`}</p>
        {isMine && (
          <div>
            <Link to={`/product/${id}/edit`} className="btn btn-outline-secondary me-2">
              수정
            </Link>
            <button className="btn btn-outline-danger" onClick={() => setShowConfirm(true)}>
              삭제
            </button>
          </div>
        )}
        {showConfirm && (
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-body">
                  <p>정말 삭제할까요?</p>
                  <button className="btn btn-outline-danger me-2">확인</button>
                  <button className="btn btn-outline-secondary" onClick={() => setShowConfirm(false)}>
                    취소
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetail
