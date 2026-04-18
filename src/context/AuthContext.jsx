import { createContext, useState, useEffect } from 'react'
import { getProfile } from '../api/auth'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
  const token = localStorage.getItem('access_token')
  console.log('token on mount:', token)
  if (token) {
    getProfile()
      .then((u) => { console.log('profile:', u); setUser(u) })
      .catch((e) => { console.log('profile error:', e.response?.status) })
      .finally(() => setLoading(false))
  } else {
    setLoading(false)
  }
}, [])
return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}







{/*
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      getProfile()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        })
        .finally(() => setLoading(false))
    } else {
      setTimeout(() => setLoading(false), 0)
    }
  }, [])

  
*/}