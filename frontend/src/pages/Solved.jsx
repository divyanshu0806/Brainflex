import { useMemo, useState } from 'react'
import { CheckCircle2, TrendingUp } from 'lucide-react'
import { problems } from '../data/dashboardData.js'
import { GlassCard, SectionLabel, ProgressBar } from '../components/GlassCard.jsx'

const solved = problems.filter((p) => p.status === 'solved')
const byDiff = {
  Easy:   solved.filter((p) => p.diff === 'Easy'),
  Medium: solved.filter((p) => p.diff === 'Medium'),
  Hard:   solved.filter((p) => p.diff === 'Hard'),
}
const total = { Easy: problems.filter((p) => p.diff === 'Easy').length, Medium: problems.filter((p) => p.diff === 'Medium').length, Hard: problems.filter((p) => p.diff === 'Hard').length }

const DIFF_STYLE = {
  Easy:   { big: 'from-emerald-500 to-emerald-400', tag: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', bar: 'green' },
  Medium: { big: 'from-blue-600 to-blue-400',       tag: 'bg-blue-500/10 text-blue-400 border-blue-500/20',         bar: 'blue'  },
  Hard:   { big: 'from-pink-600 to-pink-400',       tag: 'bg-pink-500/10 text-pink-400 border-pink-500/20',         bar: 'pink'  },
}

const DIFFS = ['All', 'Easy', 'Medium', 'Hard']

export default function Solved() {
  const [activeDiff, setActiveDiff] = useState('All')

  const filtered = useMemo(() =>
    activeDiff === 'All' ? solved : solved.filter((p) => p.diff === activeDiff),
    [activeDiff]
  )

  return (
    <div className="flex flex-col gap-5 max-w-[1100px]">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black tracking-tight">Solved Problems</h1>
        <p className="text-text-2 text-sm mt-1">
          {solved.length} solved · top 20% of all users
        </p>
      </div>

      {/* Breakdown cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {['Easy', 'Medium', 'Hard'].map((d) => {
          const count = byDiff[d].length
          const tot   = total[d]
          const pct   = Math.round((count / tot) * 100)
          const style = DIFF_STYLE[d]
          return (
            <GlassCard key={d} className="p-6 text-center">
              <div className={`font-display text-5xl font-black leading-none mb-1.5 bg-gradient-to-br ${style.big} bg-clip-text text-transparent`}>
                {count}
              </div>
              <div className="text-[0.78rem] text-text-2 mb-3">{d} Solved</div>
              <ProgressBar label="" value={pct} tone={style.bar} />
              <div className="text-[0.7rem] text-text-3 mt-1.5">{count}/{tot} · {pct}%</div>
            </GlassCard>
          )
        })}
      </div>

      {/* Overall topic progress */}
      <GlassCard className="p-6">
        <SectionLabel>
          <span className="flex items-center gap-1.5"><TrendingUp size={13} /> Progress by Topic</span>
        </SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          {Object.entries(
            solved.reduce((acc, p) => {
              if (!acc[p.topic]) acc[p.topic] = { solved: 0, total: 0 }
              acc[p.topic].solved++
              return acc
            }, problems.reduce((acc, p) => {
              if (!acc[p.topic]) acc[p.topic] = { solved: 0, total: 0 }
              acc[p.topic].total++
              return acc
            }, {}))
          )
            .filter(([, v]) => v.solved > 0)
            .sort((a, b) => b[1].solved - a[1].solved)
            .map(([topic, { solved: s, total: t }]) => (
              <ProgressBar
                key={topic}
                label={`${topic} (${s}/${t})`}
                value={Math.round((s / t) * 100)}
                tone="violet"
              />
            ))}
        </div>
      </GlassCard>

      {/* Solved list */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <SectionLabel>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={13} /> Recently Solved</span>
          </SectionLabel>
          <div className="flex items-center gap-2">
            {DIFFS.map((d) => (
              <button
                key={d}
                onClick={() => setActiveDiff(d)}
                className={`px-3 py-1 rounded-full border text-xs font-semibold transition cursor-pointer ${
                  activeDiff === d
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    : 'bg-white/[0.03] border-white/10 text-text-2 hover:text-text'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {filtered.map((p) => {
            const style = DIFF_STYLE[p.diff]
            return (
              <div
                key={p.id}
                className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 hover:bg-white/[0.04] transition cursor-pointer"
              >
                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[0.85rem] truncate">{p.title}</div>
                  <div className="text-[0.73rem] text-text-2 mt-0.5">{p.topic}</div>
                </div>
                <span className={`text-[0.62rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${style.tag}`}>
                  {p.diff}
                </span>
                <div className="text-[0.75rem] text-text-3 flex-shrink-0 hidden sm:block">
                  Acc <span className="text-text font-semibold">{p.acc}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </GlassCard>
    </div>
  )
}