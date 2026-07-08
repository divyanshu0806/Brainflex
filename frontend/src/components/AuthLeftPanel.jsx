import { ClipboardList, Zap, Trophy, ShieldCheck } from 'lucide-react'

const FEATURES = [
  { icon: ClipboardList, label: '500+ Practice Tests Available' },
  { icon: Zap, label: 'Instant Result & Analytics' },
  { icon: Trophy, label: 'Secure Verified Certificates' },
  { icon: ShieldCheck, label: 'Secure & Protected Exams' },
]

export default function AuthLeftPanel() {
  return (
    <div className="max-w-md">
      <h1 className="font-display text-5xl font-black leading-tight mb-5">
        Test Your{' '}
        <span className="blue-gradient-text italic">Knowledge.</span>
        <br />
        Prove Your Worth.
      </h1>
      <p className="text-text-2 text-sm leading-relaxed mb-12">
        Join thousands of students taking certified exams online. Track
        progress, earn badges, and build your future.
      </p>

      <div className="flex flex-col gap-4">
        {FEATURES.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
              <Icon size={16} strokeWidth={2} className="text-text-2" />
            </div>
            <span className="text-sm text-text-2">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}