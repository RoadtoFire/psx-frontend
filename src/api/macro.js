import api from './axios'

export const getMacroData = async () => {
  const res = await api.get('/api/v1/macro/')
  return res.data
}

export const setForwardPE = async (forward_pe) => {
  const res = await api.post('/api/v1/admin/macro/set-pe/', { forward_pe })
  return res.data
}
