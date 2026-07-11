import { getToken } from './auth'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function authFetch(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const getDashboardStats = () => authFetch('/api/stats')

export const getQuestions = (params = {}) => {
  const query = new URLSearchParams(params).toString()
  return authFetch(`/api/questions${query ? `?${query}` : ''}`)
}

export const getQuestion = (id) => authFetch(`/api/questions/${id}`)

export const submitAnswer = (id, selected_option_id) =>
  authFetch(`/api/questions/${id}/answer`, {
    method: 'POST',
    body: JSON.stringify({ selected_option_id }),
  })

export const getExplanation = (question_id, option_id) =>
  authFetch('/api/explain', {
    method: 'POST',
    body: JSON.stringify({ question_id, option_id }),
  })