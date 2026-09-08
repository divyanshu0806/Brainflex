import { useEffect, useRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function Field({ children }) {
  return <div className="flex flex-col gap-1.5">{children}</div>
}

export function Label({ children }) {
  return (
    <label className="text-[0.7rem] font-semibold uppercase tracking-wide text-text-3">
      {children}
    </label>
  )
}

export function Input({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400/50 focus:bg-white/[0.06] transition placeholder:text-text-3 ${className}`}
    />
  )
}

export function EyeToggle({ on, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-2 text-sm cursor-pointer"
    >
      {on ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  )
}

// ⚠️ ONLY THIS COMPONENT WAS UPDATED
export function GoogleButton({ label, onSuccess, onError }) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    // 1. Inject Google's official GSI script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    script.onload = () => {
      if (window.google) {
        // 2. Initialize Google Auth with your Client ID
        window.google.accounts.id.initialize({
          client_id: '127532052081-qsjo7up4sn4i5qpte7o9o7680m84r2uq.apps.googleusercontent.com',
          callback: async (response) => {
            try {
              // 3. Send idToken to backend
              const res = await fetch(`${API_URL}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: response.credential }),
              })

              const data = await res.json()
              if (!res.ok) throw new Error(data.error || 'Google sign-in failed')

              if (onSuccess) onSuccess(data.token, data.user)
            } catch (err) {
              if (onError) onError(err.message)
            }
          },
        })
      }
    }

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [API_URL, onSuccess, onError])

  const handleManualClick = () => {
    if (window.google) {
      window.google.accounts.id.prompt() // Opens Google Prompt / OneTap popup
    }
  }

  return (
    <button
      type="button"
      onClick={handleManualClick}
      className="flex items-center justify-center gap-2 border border-white/10 bg-white/[0.03] rounded-xl py-3 text-sm font-medium hover:bg-white/[0.06] hover:border-white/20 transition cursor-pointer"
    >
      <svg width="16" height="16" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.7 29.3 4.5 24 4.5 13.3 4.5 4.5 13.3 4.5 24S13.3 43.5 24 43.5c10.9 0 19.5-8.6 19.5-19.5 0-1.2-.1-2.3-.4-3.5z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.7 29.3 4.5 24 4.5c-7.7 0-14.3 4.4-17.7 10.2z" />
        <path fill="#4CAF50" d="M24 43.5c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.2C29.4 34.9 26.8 36 24 36c-5.2 0-9.6-2.8-11.3-7H6.1c3.3 6.8 10.4 11.5 17.9 11.5z" />
        <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.4 4.2-4.4 5.5l6.2 5.2C40.6 35.5 43.5 30.2 43.5 24c0-1.2-.1-2.3-.4-3.5z" />
      </svg>
      {label}
    </button>
  )
}