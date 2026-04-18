import api from './axios'

export const login = async (email, password) => {
  const res = await api.post('/api/v1/auth/login/', { email, password })
  localStorage.setItem('access_token', res.data.access)
  localStorage.setItem('refresh_token', res.data.refresh)
  return res.data
}

export const register = async (data) => {
  const res = await api.post('/api/v1/auth/register/', data)
  // Save tokens immediately after registration
  if (res.data.access) {
    localStorage.setItem('access_token', res.data.access)
    localStorage.setItem('refresh_token', res.data.refresh)
  }
  return res.data
}

export const getProfile = async () => {
  const res = await api.get('/api/v1/auth/profile/')
  return res.data
}

export const logout = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}