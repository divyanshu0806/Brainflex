import { useState, useMemo, useEffect } from 'react'
import { Search, CheckCircle2, Clock, Lock, Circle, ChevronDown, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getQuestions } from '../api/api.js'
import { GlassCard } from '../components/GlassCard.jsx'

const DIFFS = ['All', 'Easy', 'Medium', 'Hard']

const DIFF_STYLE = {
  Easy:   { tag: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', dot: 'bg-emerald-400' },
  Medium: { tag: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',           dot: 'bg-blue-400'   },
  Hard:   { tag: 'bg-pink-500/10 text-pink-400 border border-pink-500/20',           dot: 'bg-pink-400'   },
}

const FILTER_ACTIVE = {
  All:    'bg-white/10 text-text border-white/20',
  Easy:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  Medium: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  Hard:   'bg-pink-500/10 text-pink-400 border-pink-500/30',
}

function StatusIcon({ status }) {
  if (status === 'solved')   return <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
  if (status === 'attempted') return <Clock size={16} className="text-blue-400 flex-shrink-0" />
  if (status === 'unsolved') return <Circle size={16} className="text-text-3 flex-shrink-0" />
  return <Lock size={16} className="text-text-3 flex-shrink-0" />
}

export default function Problems() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [activeDiff, setActiveDiff]   = useState('All')
  const [search, setSearch]           = useState('')
  const [activeTopic, setActiveTopic] = useState('All Topics')
  const [topicOpen, setTopicOpen]     = useState(false)

  useEffect(() => {
    getQuestions()
      .then((data) => setQuestions(data.questions || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const topics = useMemo(() =>
    ['All Topics', ...Array.from(new Set(questions.map((q) => q.topic))).sort()],
    [questions]
  )

  const filtered = useMemo(() => {
    return questions.filter((p) => {
      const matchDiff  = activeDiff === 'All' || p.difficulty === activeDiff
      const matchTopic = activeTopic === 'All Topics' || p.topic === activeTopic
      const q = search.toLowerCase()
      const matchSearch = !q || p.question_text?.toLowerCase().includes(q) || p.topic?.toLowerCase().includes(q)
      return matchDiff && matchTopic && matchSearch
    })
  }, [questions, activeDiff, search, activeTopic])

  function diffCount(diff) {
    if (diff === 'All') return questions.length
    return questions.filter((q) => q.difficulty === diff).length
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1100px]">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-black tracking-tight">Problem Bank</h1>
          <p className="text-text-2 text-sm mt-1">
            {loading ? 'Loading…' : `${questions.length} questions · click any to start practicing`}
          </p>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-2 flex-wrap">
        {DIFFS.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDiff(d)}
            className={`px-4 py-1.5 rounded-full border text-sm font-semibold transition cursor-pointer ${
              activeDiff === d
                ? FILTER_ACTIVE[d]
                : 'bg-white/[0.03] border-white/10 text-text-2 hover:text-text hover:border-white/20'
            }`}
          >
            {d === 'All' ? `All · ${diffCount('All')}` : (
              <span className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${DIFF_STYLE[d]?.dot}`} />
                {d} · {diffCount(d)}
              </span>
            )}
          </button>
        ))}

        {/* Topic dropdown */}
        <div className="relative ml-auto">
          <button
            onClick={() => setTopicOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-sm font-semibold text-text-2 hover:text-text hover:border-white/20 transition cursor-pointer"
          >
            {activeTopic}
            <ChevronDown size={13} className={`transition-transform ${topicOpen ? 'rotate-180' : ''}`} />
          </button>
          {topicOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-52 z-50 bg-[#070914]/95 border border-white/10 rounded-2xl py-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl max-h-64 overflow-y-auto">
              {topics.map((t) => (
                <button
                  key={t}
                  onClick={() => { setActiveTopic(t); setTopicOpen(false) }}
                  className={`w-full text-left px-4 py-2 text-sm transition cursor-pointer hover:bg-white/[0.05] ${
                    activeTopic === t ? 'text-blue-400 font-semibold' : 'text-text-2'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 focus-within:border-blue-400/40 transition max-w-lg">
        <Search size={15} className="text-text-3 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search problems by title or topic…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none text-sm w-full placeholder:text-text-3"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-text-3 hover:text-text-2 text-xs cursor-pointer">✕</button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-3 text-text-2 text-sm">
          <Loader2 size={18} className="animate-spin" />
          Loading questions…
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-sm text-pink-400 bg-pink-500/10 border border-pink-500/20 rounded-xl px-4 py-3">
          Could not load questions: {error}. Make sure questions are seeded in the database.
        </div>
      )}

      {/* No questions in DB yet */}
      {!loading && !error && questions.length === 0 && (
        <div className="text-center py-16 text-text-3 text-sm">
          No questions in the database yet. Seed some questions to get started.
        </div>
      )}

      {/* Problem list */}
      {!loading && !error && questions.length > 0 && (
        <div className="flex flex-col gap-2">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-text-3 text-sm">
              No problems match your filters.{' '}
              <button
                onClick={() => { setActiveDiff('All'); setSearch(''); setActiveTopic('All Topics') }}
                className="text-blue-400 hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          ) : (
            filtered.map((p, index) => (
              <ProblemCard
                key={p.id}
                problem={p}
                index={index}
                onClick={() => {
                    sessionStorage.setItem('quiz_queue', JSON.stringify(filtered.map(q => q.id)))
                    sessionStorage.setItem('quiz_index', String(index))
                    navigate(`/dashboard/quiz/${p.id}`)
                  }}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

function ProblemCard({ problem, index, onClick }) {
  const diff = DIFF_STYLE[problem.difficulty]

  return (
    <GlassCard
      onClick={onClick}
      className="flex items-center gap-4 px-5 py-4 hover:translate-x-1 transition-transform cursor-pointer rounded-2xl"
    >
      <span className="font-display text-xl font-black text-white/15 w-9 flex-shrink-0 select-none">
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="font-semibold text-[0.88rem] truncate max-w-sm">{problem.question_text}</span>
          {diff && (
            <span className={`text-[0.62rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${diff.tag}`}>
              {problem.difficulty}
            </span>
          )}
        </div>
        <span className="text-[0.75rem] text-text-2">{problem.topic} · {problem.exam}</span>
      </div>

      {problem.accuracy !== null && (
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="text-[0.75rem] text-text-3">
            Accuracy <span className="text-text font-semibold">{problem.accuracy}%</span>
          </div>
          <div className="w-20 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
              style={{ width: `${problem.accuracy}%` }}
            />
          </div>
        </div>
      )}

      <StatusIcon status={problem.status} />
    </GlassCard>
  )
}