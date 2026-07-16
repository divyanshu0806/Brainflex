import { useState, useEffect, useMemo } from 'react'
import { CheckCircle2, TrendingUp, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getSolvedQuestions } from '../api/api.js'
import { GlassCard, SectionLabel, ProgressBar } from '../components/GlassCard.jsx'

const DIFF_STYLE = {
  Easy:   { big: 'from-emerald-500 to-emerald-400', tag: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', bar: 'green'  },
  Medium: { big: 'from-blue-600 to-blue-400',       tag: 'bg-blue-500/10 text-blue-400 border-blue-500/20',         bar: 'blue'   },
  Hard:   { big: 'from-pink-600 to-pink-400',       tag: 'bg-pink-500/10 text-pink-400 border-pink-500/20',         bar: 'pink'   },
}

const DIFFS = ['All', 'Easy', 'Medium', 'Hard']

export default function Solved() {
  const navigate = useNavigate()
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [activeDiff, setActiveDiff] = useState('All')

  useEffect(() => {
    getSolvedQuestions()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const questions = data?.questions || []
  const summary   = data?.summary   || { Easy: { solved: 0, total: 0 }, Medium: { solved: 0, total: 0 }, Hard: { solved: 0, total: 0 } }

  const filtered = useMemo(() =>
    activeDiff === 'All' ? questions : questions.filter((q) => q.difficulty === activeDiff),
    [questions, activeDiff]
  )

  // Topic progress
  const topicProgress = useMemo(() => {
    const map = {}
    questions.forEach((q) => {
      if (!map[q.topic]) map[q.topic] = 0
      map[q.topic]++
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [questions])

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
        Could not load solved questions: {error}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1100px]">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black tracking-tight">Solved Problems</h1>
        <p className="text-text-2 text-sm mt-1">
          {questions.length === 0
            ? 'No questions solved yet — start practicing!'
            : `${questions.length} solved · keep going!`}
        </p>
      </div>

      {/* Breakdown cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {['Easy', 'Medium', 'Hard'].map((d) => {
          const { solved, total } = summary[d] || { solved: 0, total: 0 }
          const pct = total > 0 ? Math.round((solved / total) * 100) : 0
          const style = DIFF_STYLE[d]
          return (
            <GlassCard key={d} className="p-6 text-center">
              <div className={`font-display text-5xl font-black leading-none mb-1.5 bg-gradient-to-br ${style.big} bg-clip-text text-transparent`}>
                {solved}
              </div>
              <div className="text-[0.78rem] text-text-2 mb-3">{d} Solved</div>
              <ProgressBar label="" value={pct} tone={style.bar} />
              <div className="text-[0.7rem] text-text-3 mt-1.5">{solved}/{total} · {pct}%</div>
            </GlassCard>
          )
        })}
      </div>

      {questions.length > 0 && (
        <>
          {/* Topic progress */}
          <GlassCard className="p-6">
            <SectionLabel>
              <span className="flex items-center gap-1.5"><TrendingUp size={13} /> Progress by Topic</span>
            </SectionLabel>
            {topicProgress.length === 0 ? (
              <p className="text-text-3 text-sm">No topic data yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                {topicProgress.map(([topic, count]) => (
                  <ProgressBar
                    key={topic}
                    label={`${topic} (${count})`}
                    value={Math.min(count * 20, 100)}
                    tone="violet"
                  />
                ))}
              </div>
            )}
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

            {filtered.length === 0 ? (
              <p className="text-text-3 text-sm py-4">No {activeDiff} questions solved yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {filtered.map((q) => {
                  const style = DIFF_STYLE[q.difficulty]
                  return (
                    <div
                      key={q.id}
                      onClick={() => navigate(`/dashboard/quiz/${q.id}`)}
                      className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 hover:bg-white/[0.04] transition cursor-pointer"
                    >
                      <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[0.85rem] truncate">{q.question_text}</div>
                        <div className="text-[0.73rem] text-text-2 mt-0.5">{q.topic} · {q.exam}</div>
                      </div>
                      <span className={`text-[0.62rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${style.tag} flex-shrink-0`}>
                        {q.difficulty}
                      </span>
                      <div className="text-[0.75rem] text-text-3 flex-shrink-0 hidden sm:block">
                        Acc <span className="text-text font-semibold">{q.accuracy}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </GlassCard>
        </>
      )}

      {questions.length === 0 && (
        <GlassCard className="p-10 text-center">
          <CheckCircle2 size={40} className="text-text-3 mx-auto mb-3" />
          <div className="font-display text-xl font-black mb-2">No solved questions yet</div>
          <p className="text-text-2 text-sm mb-5">Start practicing to see your solved questions here.</p>
          <button
            onClick={() => navigate('/dashboard/problems')}
            className="blue-gradient-bg text-white font-bold rounded-xl px-6 py-2.5 text-sm cursor-pointer"
          >
            Start Practicing
          </button>
        </GlassCard>
      )}
    </div>
  )
}