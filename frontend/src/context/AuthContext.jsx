import { createContext, useContext, useState, useEffect } from 'react'
import { getToken, removeToken, saveToken, apiMe } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)       // { id, name, email }
  const [loading, setLoading] = useState(true) // true while checking token on load

  // On app load — check if there's a saved token and validate it
  useEffect(() => {
    async function checkToken() {
      const token = getToken()
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const data = await apiMe(token)
        setUser(data.user)
      } catch {
        removeToken() // token expired or invalid — clear it
      } finally {
        setLoading(false)
      }
    }
    checkToken()
  }, [])

  function login(token, userData) {
    saveToken(token)
    setUser(userData)
  }

  function logout() {
    removeToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — use this anywhere in the app
export function useAuth() {
  return useContext(AuthContext)
}