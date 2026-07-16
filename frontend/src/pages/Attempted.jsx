import { useState, useEffect, useMemo } from 'react'
import { Trophy, TrendingDown, BarChart2, CheckCircle2, Clock, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getAttemptedData } from '../api/api.js'
import { GlassCard } from '../components/GlassCard.jsx'

const DIFF_STYLE = {
  Easy:   { tag: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', bar: 'from-emerald-500 to-emerald-400' },
  Medium: { tag: 'bg-blue-500/10 text-blue-400 border-blue-500/20',         bar: 'from-blue-600 to-blue-400'       },
  Hard:   { tag: 'bg-pink-500/10 text-pink-400 border-pink-500/20',         bar: 'from-pink-600 to-pink-400'       },
}

const FILTERS = ['All', 'Solved', 'Incorrect']

export default function Attempted() {
  const navigate = useNavigate()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [activeFilter, setActiveFilter] = useState('All')

  useEffect(() => {
    getAttemptedData()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const questions = data?.questions || []
  const summary   = data?.summary   || { total: 0, solved: 0, avgAccuracy: 0, bestAccuracy: 0 }

  const filtered = useMemo(() => {
    if (activeFilter === 'Solved')    return questions.filter((q) => q.status === 'solved')
    if (activeFilter === 'Incorrect') return questions.filter((q) => q.status !== 'solved')
    return questions
  }, [questions, activeFilter])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 size={28} className="animate-spin text-blue-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-pink-400 bg-pink-500/10 border border-pink-500/20 rounded-xl px-4 py-3 max-w-md">
        Could not load attempted questions: {error}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1100px]">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-black tracking-tight">Attempted</h1>
          <p className="text-text-2 text-sm mt-1">
            {questions.length === 0
              ? 'No questions attempted yet'
              : `${questions.length} attempted · ${summary.solved} correct`}
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/problems')}
          className="blue-gradient-bg text-white font-bold rounded-xl px-5 py-2.5 text-sm shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:shadow-[0_4px_24px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 transition cursor-pointer"
        >
          Practice More
        </button>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Trophy}       iconClass="bg-emerald-500/10 text-emerald-400" value={`${summary.bestAccuracy}%`}  valueClass="text-emerald-400" label="Best Accuracy"  />
        <StatCard icon={TrendingDown} iconClass="bg-pink-500/10 text-pink-400"       value={`${summary.avgAccuracy}%`}   valueClass="text-text"        label="Avg Accuracy"   />
        <StatCard icon={BarChart2}    iconClass="bg-blue-500/10 text-blue-400"       value={summary.total}               valueClass="text-text"        label="Total Attempted" />
        <StatCard icon={CheckCircle2} iconClass="bg-cyan-500/10 text-cyan-400"       value={summary.solved}              valueClass="text-cyan-400"    label="Correct"         />
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full border text-sm font-semibold transition cursor-pointer ${
              activeFilter === f
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                : 'bg-white/[0.03] border-white/10 text-text-2 hover:text-text hover:border-white/20'
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-xs text-text-3">{filtered.length} questions</span>
      </div>

      {/* Questions list */}
      {questions.length === 0 ? (
        <GlassCard className="p-10 text-center">
          <Clock size={40} className="text-text-3 mx-auto mb-3" />
          <div className="font-display text-xl font-black mb-2">No attempts yet</div>
          <p className="text-text-2 text-sm mb-5">Start answering questions to track your progress here.</p>
          <button
            onClick={() => navigate('/dashboard/problems')}
            className="blue-gradient-bg text-white font-bold rounded-xl px-6 py-2.5 text-sm cursor-pointer"
          >
            Start Practicing
          </button>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((q) => {
            const diff = DIFF_STYLE[q.difficulty]
            const isCorrect = q.status === 'solved'
            return (
              <GlassCard
                key={q.id}
                onClick={() => navigate(`/dashboard/quiz/${q.id}`)}
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:translate-x-1 transition-transform rounded-2xl"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isCorrect ? 'bg-emerald-500/10' : 'bg-pink-500/10'
                }`}>
                  {isCorrect
                    ? <CheckCircle2 size={16} className="text-emerald-400" />
                    : <Clock size={16} className="text-pink-400" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[0.88rem] truncate mb-0.5">{q.question_text}</div>
                  <div className="text-[0.75rem] text-text-2">{q.topic} · {q.exam}</div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-[0.62rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border hidden sm:inline ${diff?.tag}`}>
                    {q.difficulty}
                  </span>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${isCorrect ? 'text-emerald-400' : 'text-pink-400'}`}>
                      {q.accuracy}%
                    </div>
                    <div className="text-[0.68rem] text-text-3">{q.attempt_count}x tried</div>
                  </div>
                </div>

                {/* Mini accuracy bar */}
                <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden flex-shrink-0 hidden sm:block">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${diff?.bar || 'from-blue-600 to-blue-400'}`}
                    style={{ width: `${q.accuracy}%` }}
                  />
                </div>
              </GlassCard>
            )
          })}
        </div>
      )}
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