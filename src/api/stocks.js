import api from './axios'

export const getStocks = async (search = '', sector = '') => {
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (sector) params.append('sector', sector)
  params.append('page_size', '300')
  const res = await api.get(`/api/v1/stocks/?${params.toString()}`)
  return res.data.results || res.data
}
export const getStock = async (symbol) => {
  const res = await api.get(`/api/v1/stocks/${symbol}/`)
  return res.data
}

export const getStockPrices = async (symbol, from = '', to = '') => {
  let url = `/api/v1/stocks/${symbol}/prices/`
  const params = []
  if (from) params.push(`from=${from}`)
  if (to) params.push(`to=${to}`)
  if (params.length) url += `?${params.join('&')}`
  const res = await api.get(url)
  return res.data
}