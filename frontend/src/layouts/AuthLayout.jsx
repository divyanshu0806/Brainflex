import { Link, useLocation } from 'react-router-dom'

/**
 * Shared shell for SignIn / SignUp.
 * Split layout: left side carries brand/feature content, right side is the
 * form. Top bar (logo + auth toggle) sits above both.
 */
export default function AuthLayout({ children, leftContent }) {
  const location = useLocation()
  const isSignUp = location.pathname === '/signup'

  return (
    <div className="relative min-h-screen bg-void text-text font-sans overflow-hidden flex">
      {/* Aurora background blobs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute w-[900px] h-[600px] rounded-full blur-[110px] opacity-50 -top-52 -left-52 bg-[radial-gradient(ellipse,rgba(139,92,246,0.4),transparent_70%)] animate-[drift1_18s_ease-in-out_infinite]" />
        <div className="absolute w-[700px] h-[700px] rounded-full blur-[110px] opacity-50 top-[15%] -right-52 bg-[radial-gradient(ellipse,rgba(34,211,238,0.3),transparent_70%)] animate-[drift2_22s_ease-in-out_infinite]" />
        <div className="absolute w-[800px] h-[500px] rounded-full blur-[110px] opacity-40 -bottom-24 left-[28%] bg-[radial-gradient(ellipse,rgba(251,191,36,0.18),transparent_70%)] animate-[drift3_20s_ease-in-out_infinite]" />
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[110px] opacity-40 bottom-[18%] right-[8%] bg-[radial-gradient(ellipse,rgba(244,114,182,0.22),transparent_70%)] animate-[drift1_15s_ease-in-out_infinite_reverse]" />
      </div>

      {/* Vertical divider between panels */}
      <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 w-px bg-white/10 z-10" />

      {/* LEFT PANEL — brand content */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col px-14 py-10">
        <Logo />
        <div className="flex-1 flex flex-col justify-center -mt-14">{leftContent}</div>
      </div>

      {/* RIGHT PANEL — form */}
      <div className="w-full lg:w-1/2 relative z-10 flex flex-col px-6 sm:px-12 lg:px-16 py-10">
        <div className="flex items-center justify-between mb-10 lg:hidden">
          <Logo />
        </div>
        <div className="flex justify-end mb-10">
          <AuthToggle isSignUp={isSignUp} />
        </div>
        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
          {children}
        </div>
      </div>

      <style>{`
        @keyframes drift1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(60px,-40px) scale(1.1)} 66%{transform:translate(-40px,60px) scale(.95)} }
        @keyframes drift2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-80px,50px) scale(1.05)} 66%{transform:translate(50px,-60px) scale(1.1)} }
        @keyframes drift3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-60px,-30px) scale(1.08)} }
      `}</style>
    </div>
  )
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      {/* Empty logo slot — drop a mark/image in here later */}
      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10" />
      <span className="font-display font-black text-lg tracking-tight">
        <span className="blue-gradient-text">Brain</span>Flex
      </span>
    </div>
  )
}

function AuthToggle({ isSignUp }) {
  return (
    <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1">
      <Link
        to="/signup"
        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
          isSignUp ? 'bg-white/10 text-text' : 'text-text-2 hover:text-text'
        }`}
      >
        Sign Up
      </Link>
      <Link
        to="/signin"
        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
          !isSignUp ? 'bg-white/10 text-text' : 'text-text-2 hover:text-text'
        }`}
      >
        Sign In
      </Link>
    </div>
  )
}