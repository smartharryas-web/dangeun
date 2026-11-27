import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  // 처음 열 때 쿠키로 access token 받기
  useEffect(() => {
    async function load() {
      try {
        const data = await api('/api/auth/refresh', { method: 'POST', credentials: 'include' })
        setToken(data.access_token)
      } catch (e) {
        setToken(null)
      }
      setReady(true)
    }
    load()
  }, [])

  useEffect(() => {
    async function load() {
      if (!token) return
      try {
        setUser(await api('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }))
      } catch (e) {
        logout()
      }
    }
    load()
  }, [token])

  async function login(username, password) {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: new URLSearchParams({ username, password }),
      credentials: 'include',
    })
    setToken(data.access_token)
  }

  async function logout() {
    await api('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setToken(null)
    setUser(null)
  }

  // 로그인이 필요한 요청 — 401이면 새 토큰을 받아 한 번 더
  async function authApi(path, options) {
    try {
      return await api(path, { ...options, headers: { ...options.headers, Authorization: `Bearer ${token}` } })
    } catch (e) {
      if (e.status !== 401) throw e
      const data = await api('/api/auth/refresh', { method: 'POST', credentials: 'include' })
      setToken(data.access_token)
      return await api(path, { ...options, headers: { ...options.headers, Authorization: `Bearer ${data.access_token}` } })
    }
  }

  return <AuthContext value={{ token, user, ready, login, logout, authApi }}>{children}</AuthContext>
}

export function useAuth() {
  return useContext(AuthContext)
}
