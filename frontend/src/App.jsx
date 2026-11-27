import { Routes, Route } from 'react-router'
import Navbar from './components/Navbar.jsx'
import Home from './routes/Home.jsx'
import ProductDetail from './routes/ProductDetail.jsx'
import Login from './routes/Login.jsx'
import Signup from './routes/Signup.jsx'
import NewProduct from './routes/NewProduct.jsx'
import Intro from './routes/Intro.jsx'
import EditProduct from './routes/EditProduct.jsx'
import RequireLogin from './components/RequireLogin.jsx'

function App() {
  return (
    <>
      <Navbar />
      <main className="container py-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* 구경은 로그인 없이: 로고 · 목록 · 상세 */}
          <Route path="/intro" element={<Intro />} />
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          {/* 로그인해야 하는 화면 */}
          <Route element={<RequireLogin />}>
            <Route path="/new" element={<NewProduct />} />
            <Route path="/product/:id/edit" element={<EditProduct />} />
          </Route>
        </Routes>
      </main>
    </>
  )
}

export default App
