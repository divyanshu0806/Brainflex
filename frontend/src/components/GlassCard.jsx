export function GlassCard({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white/[0.035] border border-white/10 rounded-[22px] backdrop-blur-xl transition-colors hover:border-white/20 ${className}`}
    >
      {children}
    </div>
  )
}

export function SectionLabel({ children, action }) {
  return (
    <div className="flex items-center justify-between text-[0.7rem] font-bold uppercase tracking-wide text-text-3 mb-3.5">
      <span>{children}</span>
      {action}
    </div>
  )
}

const TONE_BAR = {
  green: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
  blue: 'bg-gradient-to-r from-blue-600 to-blue-400',
  pink: 'bg-gradient-to-r from-pink-500 to-pink-400',
  violet: 'bg-gradient-to-r from-violet-500 to-violet-400',
}

const TONE_TEXT = {
  green: 'text-emerald-400',
  blue: 'text-blue-400',
  pink: 'text-pink-400',
  violet: 'text-violet-400',
}

export function ProgressBar({ label, value, tone = 'violet', labelTone }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between text-[0.8rem] font-medium mb-1.5">
        <span className={labelTone ? TONE_TEXT[labelTone] : 'text-text-2'}>{label}</span>
        <span className="text-text">{value}%</span>
      </div>
      <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${TONE_BAR[tone]} transition-[width] duration-700`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}