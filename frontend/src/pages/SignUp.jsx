import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout.jsx'
import AuthLeftPanel from '../components/AuthLeftPanel.jsx'
import { Field, Label, Input, EyeToggle, GoogleButton } from '../components/FormFields.jsx'
import { apiSignup } from '../api/auth.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function SignUp() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  })
  const [showPw1, setShowPw1] = useState(false)
  const [showPw2, setShowPw2] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!form.agreedToTerms) {
      setError('You must agree to the Terms & Privacy Policy.')
      return
    }

    setLoading(true)
    try {
      const data = await apiSignup({
        name: form.name,
        phone: form.phone,
        email: form.email,
        password: form.password,
      })
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
        <h1 className="font-display text-3xl font-black mb-1.5">Hi Student</h1>
        <p className="text-text-2 text-sm">Welcome to ExamPortal — let's get you set up.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="text-sm text-pink-400 bg-pink-500/10 border border-pink-500/20 rounded-xl px-4 py-2.5">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label>Full name</Label>
            <Input
              type="text"
              placeholder="John Doe"
              required
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
          </Field>
          <Field>
            <Label>Phone</Label>
            <Input
              type="tel"
              placeholder="9876543210"
              required
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
          </Field>
        </div>

        <Field>
          <Label>Email address</Label>
          <Input
            type="email"
            placeholder="you@example.com"
            required
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPw1 ? 'text' : 'password'}
                placeholder="••••••••"
                required
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                className="pr-9"
              />
              <EyeToggle on={showPw1} onClick={() => setShowPw1((v) => !v)} />
            </div>
          </Field>
          <Field>
            <Label>Confirm</Label>
            <div className="relative">
              <Input
                type={showPw2 ? 'text' : 'password'}
                placeholder="••••••••"
                required
                value={form.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                className="pr-9"
              />
              <EyeToggle on={showPw2} onClick={() => setShowPw2((v) => !v)} />
            </div>
          </Field>
        </div>

        <label className="flex items-start gap-2 text-xs text-text-2 cursor-pointer -mt-1">
          <input
            type="checkbox"
            required
            checked={form.agreedToTerms}
            onChange={(e) => updateField('agreedToTerms', e.target.checked)}
            className="mt-0.5 accent-blue-500"
          />
          <span>
            I agree to <a href="#" className="text-cyan-300 hover:underline">Terms</a> &amp;{' '}
            <a href="#" className="text-cyan-300 hover:underline">Privacy</a>
          </span>
        </label>

        <button
          type="submit"
          className="blue-gradient-bg text-white font-bold rounded-xl py-3 text-sm shadow-[0_0_24px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_30px_rgba(59,130,246,0.45)] hover:-translate-y-0.5 transition mt-1 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <div className="flex items-center gap-3 text-xs text-text-3 my-0.5">
          <div className="flex-1 h-px bg-white/10" />
          or continue with
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <GoogleButton label="Continue with Google" />

        <div className="text-center text-xs text-text-2 mt-1">
          Already have an account?{' '}
          <Link to="/signin" className="text-cyan-300 hover:underline font-medium">Sign in</Link>
        </div>
      </form>
    </AuthLayout>
  )
}