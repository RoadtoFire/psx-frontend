import api from './axios'

// ── Public ────────────────────────────────────────────────────────────────────

export const getBlogPosts = () =>
  api.get('/api/v1/blog/').then(r => Array.isArray(r.data) ? r.data : (r.data.results || []))

export const getBlogPost = (slug) =>
  api.get(`/api/v1/blog/${slug}/`).then(r => r.data)

// ── Staff only ────────────────────────────────────────────────────────────────

export const adminGetPosts = () =>
  api.get('/api/v1/admin/blog/').then(r => Array.isArray(r.data) ? r.data : (r.data.results || []))

export const adminCreatePost = (data) =>
  api.post('/api/v1/admin/blog/', data).then(r => r.data)

export const adminUpdatePost = (slug, data) =>
  api.patch(`/api/v1/admin/blog/${slug}/`, data).then(r => r.data)

export const adminDeletePost = (slug) =>
  api.delete(`/api/v1/admin/blog/${slug}/`)

export const adminPublishPost = (slug, sendEmail = true) =>
  api.post(`/api/v1/admin/blog/${slug}/publish/`, { send_email: sendEmail }).then(r => r.data)
