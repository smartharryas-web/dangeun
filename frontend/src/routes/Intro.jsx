import { Link } from 'react-router'

// 지금 시간(접속한 사람 컴퓨터 시계)에 맞는 배경 사진 고르기
// 08~16시 낮 · 16~20시 저녁 · 20~08시 밤
function pickPhoto() {
  const hour = new Date().getHours() // 지금 몇 시인지 (0 ~ 23)
  if (hour >= 8 && hour < 16) return '/intro-day.webp'
  if (hour >= 16 && hour < 20) return '/intro-evening.webp'
  return '/intro-night.png'
}

// 사이트를 켤 때 처음 나오는 로고 화면 (/intro)
// 화면 아무 데나 누르면 상품 목록(/)으로 넘어감 (Product 칸처럼 Link로 감쌈)
// 꽉 찬 화면 모양은 design.css의 .intro
function Intro() {
  return (
    <Link to="/" className="intro">
      {/* 배경: 백화점 항공샷, 시간대마다 다른 사진 (public/, 개인 프로젝트용) */}
      <img src={pickPhoto()} alt="" className="intro-bg" />
      <div className="intro-logo">Encore</div>
    </Link>
  )
}

export default Intro
