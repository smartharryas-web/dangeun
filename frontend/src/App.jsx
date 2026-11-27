import { Routes, Route } from 'react-router'
import Navbar from './components/Navbar.jsx'
import Home from './routes/Home.jsx'
import Login from './routes/Login.jsx'
import Signup from './routes/Signup.jsx'
import RequireLogin from './components/RequireLogin.jsx'

function App() {
  return (
    <>
      <Navbar />
      <main className="container py-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<RequireLogin />}>
            <Route path="/" element={<Home />} />
          </Route>
        </Routes>
      </main>
    </>
  )
}

export default App
