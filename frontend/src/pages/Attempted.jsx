import { useState, useMemo } from 'react'
import { Trophy, TrendingDown, BarChart2, Clock, CalendarDays, HelpCircle } from 'lucide-react'
import { mockTests } from '../data/dashboardData.js'
import { GlassCard } from '../components/GlassCard.jsx'

const EXAMS = ['All', 'UPSC', 'SSC', 'IBPS', 'Mixed']

const TAG_STYLE = {
  Excellent:  { bar: 'from-emerald-500 to-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  Passed:     { bar: 'from-emerald-500 to-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  Good:       { bar: 'from-cyan-500 to-cyan-400',       text: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/20'       },
  Average:    { bar: 'from-blue-600 to-blue-400',       text: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20'       },
  'Needs Work': { bar: 'from-pink-600 to-pink-400',     text: 'text-pink-400',    bg: 'bg-pink-500/10 border-pink-500/20'       },
}

const EXAM_BADGE = {
  UPSC:  'bg-violet-500/10 text-violet-400',
  SSC:   'bg-amber-500/10 text-amber-400',
  IBPS:  'bg-cyan-500/10 text-cyan-400',
  Mixed: 'bg-white/[0.06] text-text-2',
}

const scores = mockTests.map((t) => t.score)
const bestScore   = Math.max(...scores)
const lowestScore = Math.min(...scores)
const avgScore    = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)

export default function Attempted() {
  const [activeExam, setActiveExam] = useState('All')

  const filtered = useMemo(() =>
    activeExam === 'All' ? mockTests : mockTests.filter((t) => t.exam === activeExam),
    [activeExam]
  )

  return (
    <div className="flex flex-col gap-5 max-w-[1100px]">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-black tracking-tight">Mock Tests</h1>
          <p className="text-text-2 text-sm mt-1">
            {mockTests.length} completed · avg {avgScore}% · best {bestScore}%
          </p>
        </div>
        <button className="blue-gradient-bg text-white font-bold rounded-xl px-5 py-2.5 text-sm shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:shadow-[0_4px_24px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 transition cursor-pointer">
          + Start New Mock
        </button>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Trophy}       iconClass="bg-emerald-500/10 text-emerald-400" value={`${bestScore}%`}   valueClass="text-emerald-400" label="Best Score"     />
        <StatCard icon={TrendingDown} iconClass="bg-pink-500/10 text-pink-400"       value={`${lowestScore}%`} valueClass="text-pink-400"    label="Lowest Score"  />
        <StatCard icon={BarChart2}    iconClass="bg-blue-500/10 text-blue-400"       value={`${avgScore}%`}    valueClass="text-text"        label="Average Score" />
        <StatCard icon={Clock}        iconClass="bg-cyan-500/10 text-cyan-400"       value="1h 38m"            valueClass="text-text"        label="Avg Duration"  />
      </div>

      {/* Exam filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {EXAMS.map((e) => (
          <button
            key={e}
            onClick={() => setActiveExam(e)}
            className={`px-4 py-1.5 rounded-full border text-sm font-semibold transition cursor-pointer ${
              activeExam === e
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                : 'bg-white/[0.03] border-white/10 text-text-2 hover:text-text hover:border-white/20'
            }`}
          >
            {e}
          </button>
        ))}
        <span className="ml-auto text-xs text-text-3">{filtered.length} tests</span>
      </div>

      {/* Test cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((test) => (
          <TestCard key={test.id} test={test} />
        ))}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, iconClass, value, valueClass, label }) {
  return (
    <GlassCard className="p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${iconClass}`}>
        <Icon size={18} />
      </div>
      <div className={`font-display text-2xl font-black leading-none ${valueClass}`}>{value}</div>
      <div className="text-[0.78rem] text-text-2 mt-1">{label}</div>
    </GlassCard>
  )
}

function TestCard({ test }) {
  const style = TAG_STYLE[test.tag] || TAG_STYLE['Average']

  return (
    <GlassCard className="p-5 cursor-pointer hover:-translate-y-0.5 transition-transform rounded-2xl">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="font-bold text-[0.9rem] truncate">{test.title}</span>
            <span className={`text-[0.6rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${EXAM_BADGE[test.exam]}`}>
              {test.exam}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[0.75rem] text-text-2 flex-wrap">
            <span className="flex items-center gap-1"><CalendarDays size={11} />{test.date}</span>
            <span className="flex items-center gap-1"><HelpCircle size={11} />{test.questions} Qs</span>
            <span className="flex items-center gap-1"><Clock size={11} />{test.duration}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`font-display text-2xl font-black leading-none ${style.text}`}>{test.score}%</div>
          <div className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full border mt-1 ${style.bg} ${style.text}`}>
            {test.tag}
          </div>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${style.bar} transition-[width] duration-700`}
          style={{ width: `${test.score}%` }}
        />
      </div>
    </GlassCard>
  )
}