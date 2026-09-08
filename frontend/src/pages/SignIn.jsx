import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout.jsx'
import AuthLeftPanel from '../components/AuthLeftPanel.jsx'
import { Field, Label, Input, EyeToggle, GoogleButton } from '../components/FormFields.jsx'
import { apiSignin } from '../api/auth.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function SignIn() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 🆕 Google success handler
  const handleGoogleSuccess = (token, user) => {
    login(token, user)
    navigate('/dashboard')
  }

  // 🆕 Google error handler
  const handleGoogleError = (errMessage) => {
    setError(errMessage)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    setLoading(true)
    try {
      const data = await apiSignin({ email, password })
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout leftContent={<AuthLeftPanel />}>
      <div className="mb-7">
        <h1 className="font-display text-3xl font-black mb-1.5">Welcome back</h1>
        <p className="text-text-2 text-sm">Sign in to keep your streak going.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="text-sm text-pink-400 bg-pink-500/10 border border-pink-500/20 rounded-xl px-4 py-2.5">
            {error}
          </div>
        )}

        <Field>
          <Label>Email address</Label>
          <Input
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field>
          <Label>Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-9"
            />
            <EyeToggle on={showPassword} onClick={() => setShowPassword((v) => !v)} />
          </div>
        </Field>

        <div className="text-right text-xs text-violet-300 hover:text-violet-200 cursor-pointer transition -mt-1">
          Forgot password?
        </div>

        <button
          type="submit"
          className="blue-gradient-bg text-white font-bold rounded-xl py-3 text-sm shadow-[0_0_24px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_30px_rgba(59,130,246,0.45)] hover:-translate-y-0.5 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <div className="flex items-center gap-3 text-xs text-text-3 my-0.5">
          <div className="flex-1 h-px bg-white/10" />
          or continue with
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* ⚠️ UPDATED: Added onSuccess and onError props */}
        <GoogleButton
          label="Continue with Google"
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />

        <div className="text-center text-xs text-text-2 mt-1">
          New here?{' '}
          <Link to="/signup" className="text-cyan-300 hover:underline font-medium">Create an account</Link>
        </div>
      </form>
    </AuthLayout>
  )
}