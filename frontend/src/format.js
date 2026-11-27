// 화면에 보여 줄 모양으로 바꾸는 함수 모음 (목록 · 상세 · 채팅 등이 같이 씀)

// 1230000 → "1,230,000원"
export function formatPrice(price) {
  return `${Number(price).toLocaleString('ko-KR')}원`
}

// 서버 시간 글자 → "방금 전" · "5분 전" · "3시간 전" · "9일 전" · "2달 전" · "1년 전"
export function timeAgo(text) {
  const seconds = Math.floor((Date.now() - new Date(text).getTime()) / 1000)
  if (seconds < 60) return '방금 전'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}일 전`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}달 전`
  return `${Math.floor(months / 12)}년 전`
}
