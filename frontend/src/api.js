// 서버에 요청 하나
export const SERVER_URL = 'http://localhost:8000'

// 사진 주소: 올린 사진(/uploads/products/)은 서버(8000)에 있어서 앞에 SERVER_URL을 붙인다
// 시드 사진(/uploads/choco.jpg)은 화면 쪽 public에 있어서 그대로
export function imageSrc(path) {
  if (path.startsWith('/uploads/products/')) return `${SERVER_URL}${path}`
  return path
}

export async function api(path, options) {
  const res = await fetch(`${SERVER_URL}${path}`, options)
  if (!res.ok) {
    // 서버가 글자 묶음(JSON)이 아닌 걸 줄 때도 있다 (500 에러 등)
    const data = await res.json().catch(() => ({ detail: '서버 에러가 났습니다.' }))
    // 422(입력값 틀림)는 detail이 목록으로 온다 → 첫 번째 메시지만
    const message = Array.isArray(data.detail) ? data.detail[0].msg : data.detail
    const error = new Error(message)
    error.status = res.status
    throw error
  }
  if (res.status === 204) return null
  return await res.json()
}
