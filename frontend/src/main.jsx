import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './design.css'
import { AuthProvider } from './hooks/useAuth.jsx'
import App from './App.jsx'

// 이 파일은 사이트를 새로 열 때(주소 입력 · 새로고침) 딱 한 번 실행됨
// 그때 주소가 / 이면 로고 화면(/intro)부터 보여 줌 → 사이트 안에서 / 로 이동할 땐 안 나옴
if (window.location.pathname === '/') {
  window.history.replaceState(null, '', '/intro')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
