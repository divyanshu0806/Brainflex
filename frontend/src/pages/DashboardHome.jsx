import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Puzzle, CheckCircle2, NotebookPen, Flame, ArrowRight, ClipboardList } from 'lucide-react'
import { GlassCard, SectionLabel, ProgressBar } from '../components/GlassCard.jsx'
import { getDashboardStats } from '../api/api.js'
import { examUpdates, nextUp, heatmapLevels } from '../data/dashboardData.js'

const HEATMAP_LEVEL = [
  'bg-white/[0.05]',
  'bg-blue-400/20',
  'bg-blue-400/45',
  'bg-blue-400/70',
  'bg-blue-500',
]

const TAG_TONE = {
  green: 'bg-emerald-500/10 text-emerald-400',
  pink:  'bg-pink-500/10 text-pink-400',
  cyan:  'bg-cyan-500/10 text-cyan-400',
  blue:  'bg-blue-500/10 text-blue-400',
}

// Skeleton loader for cards while fetching
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-white/[0.06] rounded-xl ${className}`} />
}

export default function DashboardHome() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const summary      = stats?.summary      || { solved: 0, attempted: 0, total: 0, completionRate: 0 }
  const streak       = stats?.streak       || { current_streak: 0 }
  const accuracy     = stats?.accuracyByDifficulty || []
  const topics       = stats?.topicStrength || []
  const recentTests  = stats?.recentTests   || []

  // Build accuracy breakdown from API (fill missing difficulties with 0)
  const accuracyBreakdown = ['Easy', 'Medium', 'Hard'].map((diff) => {
    const found = accuracy.find((a) => a.difficulty === diff)
    return { label: diff, value: parseInt(found?.accuracy || 0), tone: diff === 'Easy' ? 'green' : diff === 'Medium' ? 'blue' : 'pink' }
  })

  const quickStats = [
    { label: 'Problems Solved',   value: summary.solved,                    badge: 'Total',      icon: Puzzle,      iconBg: 'bg-violet-500/10 text-violet-400' },
    { label: 'Completion Rate',   value: `${summary.completionRate}%`,       badge: 'of bank',    icon: CheckCircle2, iconBg: 'bg-cyan-500/10 text-cyan-400'    },
    { label: 'Mocks Attempted',   value: summary.attempted,                  badge: 'Questions',  icon: NotebookPen, iconBg: 'bg-emerald-500/10 text-emerald-400' },
    { label: 'Day Streak',        value: streak.current_streak,              badge: 'days',       icon: Flame,       iconBg: 'bg-blue-500/10 text-blue-400'     },
  ]

  return (
    <div className="flex flex-col gap-5 max-w-[1400px]">
      {/* BANNER */}
      <GlassCard className="relative overflow-hidden p-9 rounded-[26px]">
        <div className="pointer-events-none absolute -right-20 -top-20 w-[360px] h-[360px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.12),transparent_70%)]" />
        <div className="relative z-10 flex items-center justify-between gap-8 flex-wrap">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-3.5 py-1.5 text-xs font-semibold text-emerald-400 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {streak.current_streak > 0 ? `${streak.current_streak}-day streak active` : 'Start your streak today!'}
            </div>
            <h1 className="font-display text-4xl font-black leading-tight mb-2.5">
              Test Your <span className="blue-gradient-text italic">Knowledge.</span>
              <br />Prove Your Worth.
            </h1>
            <p className="text-sm text-text-2 leading-relaxed mb-6">
              Join thousands of students taking certified exams online. Track
              progress, earn badges, and build your future.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => navigate('/dashboard/problems')}
                className="blue-gradient-bg text-white font-bold rounded-xl px-6 py-3 text-sm shadow-[0_0_24px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_30px_rgba(59,130,246,0.45)] hover:-translate-y-0.5 transition cursor-pointer flex items-center gap-2"
              >
                Start Practicing <ArrowRight size={15} />
              </button>
              <button
                onClick={() => navigate('/dashboard/attempted')}
                className="border border-white/15 rounded-xl px-6 py-3 text-sm font-medium hover:bg-white/[0.06] hover:border-white/25 transition cursor-pointer"
              >
                View My Tests
              </button>
            </div>
          </div>
          <div className="flex gap-7">
            <BannerStat value={summary.solved}    label="Solved"    tone="blue"  />
            <BannerStat value={summary.attempted} label="Attempted" tone="cyan"  />
            <BannerStat value={`${summary.completionRate}%`} label="Complete" tone="green" />
          </div>
        </div>
      </GlassCard>

      {/* QUICK STAT CARDS */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((s) => (
            <GlassCard key={s.label} className="p-5">
              <div className="flex items-start justify-between mb-2.5">
                <div className={`w-[42px] h-[42px] rounded-xl flex items-center justify-center ${s.iconBg}`}>
                  <s.icon size={18} />
                </div>
                <span className="text-[0.7rem] font-bold px-2.5 py-0.5 rounded-full bg-white/[0.05] text-text-2">
                  {s.badge}
                </span>
              </div>
              <div className="font-display text-[2rem] font-black leading-none tracking-tight">{s.value}</div>
              <div className="text-[0.78rem] text-text-2 mt-1">{s.label}</div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* THREE COLUMN ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Accuracy + Topic Strength */}
        <GlassCard className="p-6">
          <SectionLabel>Accuracy Breakdown</SectionLabel>
          {loading ? (
            <div className="flex flex-col gap-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
          ) : accuracyBreakdown.every(a => a.value === 0) ? (
            <p className="text-text-3 text-sm py-4">Answer some questions to see your accuracy!</p>
          ) : (
            accuracyBreakdown.map((a) => (
              <ProgressBar key={a.label} label={a.label} value={a.value} tone={a.tone} labelTone={a.tone} />
            ))
          )}

          <div className="h-px bg-white/[0.07] my-5" />

          <SectionLabel>Topic Strength</SectionLabel>
          {loading ? (
            <div className="flex flex-col gap-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
          ) : topics.length === 0 ? (
            <p className="text-text-3 text-sm py-4">Answer questions across topics to see your strength!</p>
          ) : (
            topics.slice(0, 5).map((t) => (
              <ProgressBar key={t.topic} label={t.topic} value={parseInt(t.strength)} tone="violet" />
            ))
          )}
        </GlassCard>

        {/* Heatmap + Recent Tests */}
        <GlassCard className="p-6">
          <SectionLabel>28-Day Activity</SectionLabel>
          <div className="flex flex-wrap gap-1 mb-3">
            {heatmapLevels.map((level, i) => (
              <div key={i} className={`w-[13px] h-[13px] rounded-sm ${HEATMAP_LEVEL[level]}`} />
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-[0.7rem] text-text-3 mb-6">
            <span>Less</span>
            {HEATMAP_LEVEL.map((cls, i) => <div key={i} className={`w-[11px] h-[11px] rounded-sm ${cls}`} />)}
            <span>More</span>
          </div>

          <SectionLabel
            action={
              <button onClick={() => navigate('/dashboard/attempted')} className="text-cyan-400 font-medium normal-case text-xs cursor-pointer hover:underline">
                All →
              </button>
            }
          >
            Recent Tests
          </SectionLabel>

          {loading ? (
            <div className="flex flex-col gap-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : recentTests.length === 0 ? (
            <p className="text-text-3 text-sm py-4">No tests attempted yet — start practicing!</p>
          ) : (
            <div className="flex flex-col">
              {recentTests.map((t, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-white/[0.05] last:border-none last:pb-0">
                  <div className="w-9 h-9 rounded-[10px] bg-violet-500/10 text-violet-400 flex items-center justify-center flex-shrink-0">
                    <ClipboardList size={15} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[0.85rem] font-semibold truncate">{t.title}</div>
                    <div className="text-[0.73rem] text-text-2 mt-0.5">{t.total_qs} Qs</div>
                  </div>
                  <div className="ml-auto text-right flex-shrink-0">
                    <div className={`font-display text-base font-black ${t.score >= 60 ? 'text-emerald-400' : 'text-pink-400'}`}>{t.score}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Exam Updates + Next Up */}
        <div className="flex flex-col gap-4">
          <GlassCard className="p-6 flex-1">
            <SectionLabel>📰 Exam Updates</SectionLabel>
            <div className="flex flex-col">
              {examUpdates.map((u) => (
                <div key={u.title} className="py-2.5 border-b border-white/[0.05] last:border-none last:pb-0">
                  <span className={`text-[0.62rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full inline-block mb-1 ${TAG_TONE[u.tone]}`}>
                    {u.tag}
                  </span>
                  <div className="font-bold text-[0.8rem]">{u.title}</div>
                  <div className="text-[0.73rem] text-text-2 mt-0.5">{u.desc}</div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <SectionLabel>Next Up</SectionLabel>
            <div className="flex flex-col gap-2.5">
              {nextUp.map((n) => {
                const borderClass = n.tone === 'violet'
                  ? 'border-violet-400/20 hover:border-violet-400/40 bg-gradient-to-br from-violet-500/10 to-violet-500/5'
                  : 'border-cyan-400/20 hover:border-cyan-400/40 bg-gradient-to-br from-cyan-500/10 to-emerald-500/5'
                const toneClass = n.tone === 'violet' ? 'text-violet-400' : 'text-cyan-400'
                return (
                  <div key={n.title} onClick={() => navigate('/dashboard/problems')} className={`rounded-2xl border p-4 cursor-pointer transition ${borderClass}`}>
                    <div className={`text-[0.63rem] font-bold uppercase tracking-wide mb-1.5 ${toneClass}`}>{n.tag}</div>
                    <div className="font-bold text-[0.9rem] mb-0.5">{n.title}</div>
                    <div className="text-[0.75rem] text-text-2">{n.meta}</div>
                  </div>
                )
              })}
            </div>
          </GlassCard>
        </div>
      </div>

      {error && (
        <div className="text-sm text-pink-400 bg-pink-500/10 border border-pink-500/20 rounded-xl px-4 py-3">
          Could not load stats: {error}
        </div>
      )}
    </div>
  )
}

function BannerStat({ value, label, tone }) {
  const toneClass = { blue: 'blue-gradient-text', cyan: 'text-cyan-400', green: 'text-emerald-400' }[tone]
  return (
    <div className="text-center">
      <div className={`font-display text-4xl font-black ${toneClass}`}>{value}</div>
      <div className="text-[0.68rem] text-text-3 mt-0.5 tracking-wide uppercase">{label}</div>
    </div>
  )
}