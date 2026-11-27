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
        {/* ENCORE 로고 (design/logo/시안-18.html, CO 맞물림): 글자를 폰트 대신 도형(path)으로 직접 그림 */}
        {/* viewBox = 그림판 크기, 글자마다 translate(x)로 옆으로 밀어 배치 */}
        {/* 색은 currentColor → .intro의 글자색(흰색)을 그대로 따라감 */}
        {/* 획 굵히기(stroke)는 안 씀: 쓰면 C · O가 겹치는 앞뒤 틈이 메워져 고리처럼 안 보임 */}
        {/* ENC는 왼쪽(--o 음수), ORE는 오른쪽(--o 양수)에서 다가옴, --fd = 나타나기 시작하는 때 → 움직임은 design.css */}
        <svg viewBox="-2 -2 518 104" role="img" aria-label="ENCORE" fill="currentColor">
          {/* E */}
          <g className="intro-letter" style={{ '--o': '-56px', '--fd': '0.4s' }}>
            <path d="M0 0H52V11H13V44.5H47V55.5H13V89H54V100H0Z" />
          </g>
          {/* N */}
          <g className="intro-letter" style={{ '--o': '-56px', '--fd': '0.25s' }}>
            <path transform="translate(84)" d="M0 0H17L53.5 73.5V0H66V100H49L12.5 26.5V100H0Z" />
          </g>
          {/* C: 본체 + O 안쪽으로 다시 나오는 아래 끝, 두 조각 */}
          <g className="intro-letter" style={{ '--o': '-56px', '--fd': '0.1s' }}>
            <path d="M272.68 38A48 51.5 0 1 0 252.39 93.02A52.5 56 0 0 1 244.35 84.09A34 40.5 0 1 1 258.47 38Z" />
            <path d="M266.73 77.26A48 51.5 0 0 0 272.68 62H258.47L258.34 62.51A29.5 36 0 0 0 266.73 77.26Z" />
            {/* 틈 메우개: 다가오는 동안엔 온전한 C로 보이게, 맞물리는 순간 사라짐 */}
            <path className="intro-gap" d="M251.88 93.37A48 51.5 0 0 0 267.04 76.71A28.9 35.4 0 0 1 258.63 61.37A34 40.5 0 0 1 243.87 84.45A53.1 56.6 0 0 0 251.88 93.37Z" />
          </g>
          {/* O: C 팔이 앞을 지나는 왼쪽 위만 틈까지 잘라 낸 모양 */}
          <g className="intro-letter" style={{ '--o': '56px', '--fd': '0.1s' }}>
            <path d="M245.27 22.74A48 51.5 0 1 0 259.61 6.98A52.5 56 0 0 1 267.65 15.91A34 40.5 0 1 1 253.66 37.49A29.5 36 0 0 0 245.27 22.74Z" />
            <path className="intro-gap" d="M244.96 23.29A48 51.5 0 0 1 260.12 6.63A53.1 56.6 0 0 1 268.13 15.55A34 40.5 0 0 0 253.37 38.63A28.9 35.4 0 0 0 244.96 23.29Z" />
          </g>
          {/* R */}
          <g className="intro-letter" style={{ '--o': '56px', '--fd': '0.25s' }}>
            <path transform="translate(362)" fillRule="evenodd" d="M0 0H34A28 28 0 0 1 44.98 53.76L66 100H51L31 56H13V100H0ZM13 11H34A14 17 0 0 1 34 45H13Z" />
          </g>
          {/* 마지막 E: 첫 E와 같은 모양 */}
          <g className="intro-letter" style={{ '--o': '56px', '--fd': '0.4s' }}>
            <path transform="translate(460)" d="M0 0H52V11H13V44.5H47V55.5H13V89H54V100H0Z" />
          </g>
        </svg>
      </div>
    </Link>
  )
}

export default Intro
