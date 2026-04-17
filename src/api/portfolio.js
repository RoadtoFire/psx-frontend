import api from './axios'

export const getPortfolio = async () => {
  const res = await api.get('/api/v1/portfolio/')
  return res.data
}

export const getPortfolioValue = async () => {
  const res = await api.get('/api/v1/portfolio/value/')
  return res.data
}

export const getDividendIncome = async () => {
  const res = await api.get('/api/v1/portfolio/dividends/')
  return res.data
}

export const addTransaction = async (data) => {
  const res = await api.post('/api/v1/portfolio/transactions/', data)
  return res.data
}

export const deleteTransaction = async (id) => {
  const res = await api.delete(`/api/v1/portfolio/transactions/${id}/`)
  return res.data
}

export const markPurified = async (amount, purified_up_to) => {
  const res = await api.post('/api/v1/portfolio/purification/mark/', { amount, purified_up_to })
  return res.data
}

export const getPurificationHistory = async () => {
  const res = await api.get('/api/v1/portfolio/purification/history/')
  return res.data
}