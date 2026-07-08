const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export async function apiSignup({ name, phone, email, password }) {
  const res = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone, email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Signup failed')
  return data // { token, user, message }
}

export async function apiSignin({ email, password }) {
  const res = await fetch(`${BASE_URL}/api/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Signin failed')
  return data // { token, user, message }
}

export async function apiMe(token) {
  const res = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to fetch user')
  return data // { user }
}

// Token helpers
export function saveToken(token) {
  localStorage.setItem('brainflex_token', token)
}

export function getToken() {
  return localStorage.getItem('brainflex_token')
}

export function removeToken() {
  localStorage.removeItem('brainflex_token')
}