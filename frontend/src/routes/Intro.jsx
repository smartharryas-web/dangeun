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
      <div className="intro-logo">
        {/* ENCORE 로고 (design/logo/시안-1.html): 글자를 폰트 대신 도형(path)으로 직접 그림 */}
        {/* viewBox = 그림판 크기, 글자마다 translate(x)로 옆으로 밀어 배치 */}
        {/* 색은 currentColor → .intro의 글자색을 그대로 따라감 */}
        {/* stroke = 도형 테두리에 선을 덧그려 획을 굵게 (굵기는 strokeWidth) */}
        {/* 글자마다 g로 감싸고 --o(얼마나 멀리서 출발) · --fd(언제 나타나기 시작)를 따로 줌 → 움직임은 design.css */}
        <svg viewBox="-3 -4 549 108" role="img" aria-label="ENCORE" fill="currentColor" stroke="currentColor" strokeWidth="4">
          {/* E */}
          <g className="intro-letter" style={{ '--o': '-180px', '--fd': '0.45s' }}>
            <path d="M0 0H57V13H15V43H53V56H15V87H59V100H0Z" />
          </g>
          {/* N */}
          <g className="intro-letter" style={{ '--o': '-108px', '--fd': '0.3s' }}>
            <path transform="translate(83)" d="M0 0H19L60 74.55V0H74V100H55L14 25.45V100H0Z" />
          </g>
          {/* C */}
          <g className="intro-letter" style={{ '--o': '-36px', '--fd': '0.15s' }}>
            <path transform="translate(180)" d="M84 18.18A47 51.6 0 1 0 84 81.82H64.27A30.5 38.6 0 1 1 64.27 18.18Z" />
          </g>
          {/* O: 바깥 원 - 안쪽 원 (evenodd = 겹친 안쪽은 비워 둠) */}
          <g className="intro-letter" style={{ '--o': '36px', '--fd': '0.15s' }}>
            <path transform="translate(279)" fillRule="evenodd" d="M49 -1.6A49 51.6 0 1 1 49 101.6A49 51.6 0 1 1 49 -1.6ZM49 11.4A32.5 38.6 0 1 0 49 88.6A32.5 38.6 0 1 0 49 11.4Z" />
          </g>
          {/* R */}
          <g className="intro-letter" style={{ '--o': '108px', '--fd': '0.3s' }}>
            <path transform="translate(400)" fillRule="evenodd" d="M0 0H34A28 28 0 0 1 47.62 52.45L66 100H48.5L31.5 56H15V100H0ZM15 13H34A12 15 0 0 1 34 43H15Z" />
          </g>
          {/* 마지막 E: 첫 E와 같은 모양 */}
          <g className="intro-letter" style={{ '--o': '180px', '--fd': '0.45s' }}>
            <path transform="translate(484)" d="M0 0H57V13H15V43H53V56H15V87H59V100H0Z" />
          </g>
        </svg>
      </div>
    </Link>
  )
}

export default Intro
