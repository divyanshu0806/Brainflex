import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Loader2, Sparkles, Lock, Trophy } from 'lucide-react'
import { getQuestion, submitAnswer, getExplanation } from '../api/api.js'
import { GlassCard } from '../components/GlassCard.jsx'

const OPTION_LABELS = ['A', 'B', 'C', 'D']

export default function QuizPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Queue from sessionStorage
  const queue = JSON.parse(sessionStorage.getItem('quiz_queue') || '[]')
  const currentIndex = queue.indexOf(parseInt(id))
  const isLast = currentIndex === queue.length - 1
  const nextId = !isLast ? queue[currentIndex + 1] : null

  const [question, setQuestion]             = useState(null)
  const [loading, setLoading]               = useState(true)
  const [selectedOption, setSelectedOption] = useState(null)
  const [locked, setLocked]                 = useState(false)
  const [result, setResult]                 = useState(null)
  const [explanation, setExplanation]       = useState(null)
  const [explainLoading, setExplainLoading] = useState(false)
  const [error, setError]                   = useState(null)

  useEffect(() => {
    setLoading(true)
    setSelectedOption(null)
    setLocked(false)
    setResult(null)
    setExplanation(null)
    setError(null)

    getQuestion(id)
      .then((data) => setQuestion(data.question))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  async function handleLockAnswer() {
    if (!selectedOption || locked) return
    setLocked(true)

    try {
      const res = await submitAnswer(id, selectedOption)
      setResult(res)

      setExplainLoading(true)
      try {
        const explRes = await getExplanation(parseInt(id), selectedOption)
        setExplanation(explRes.explanation)
      } catch {
        setExplanation('AI overview unavailable right now. Please try again.')
      } finally {
        setExplainLoading(false)
      }
    } catch (err) {
      setError(err.message)
      setLocked(false)
    }
  }

  function handleNext() {
    if (nextId) {
      sessionStorage.setItem('quiz_index', String(currentIndex + 1))
      navigate(`/dashboard/quiz/${nextId}`)
    } else {
      // Last question — go to problems with a completion flag
      sessionStorage.removeItem('quiz_queue')
      sessionStorage.removeItem('quiz_index')
      navigate('/dashboard/problems', { state: { completed: true } })
    }
  }

  function getOptionStyle(option) {
    if (!locked) {
      return selectedOption === option.id
        ? 'border-blue-400/60 bg-blue-500/10 text-text'
        : 'border-white/10 bg-white/[0.02] text-text-2 hover:border-white/25 hover:bg-white/[0.05] hover:text-text cursor-pointer'
    }
    if (option.is_correct)
      return 'border-emerald-400/60 bg-emerald-500/10 text-emerald-400'
    if (option.id === selectedOption && !option.is_correct)
      return 'border-pink-400/60 bg-pink-500/10 text-pink-400'
    return 'border-white/[0.06] bg-white/[0.02] text-text-3 opacity-60'
  }

  function getOptionIcon(option) {
    if (!locked) return null
    if (option.is_correct) return <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
    if (option.id === selectedOption) return <XCircle size={16} className="text-pink-400 flex-shrink-0" />
    return null
  }

  const displayOptions = locked && result?.all_options
    ? result.all_options
    : question?.options || []

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-blue-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-pink-400 mb-4">{error}</p>
        <button onClick={() => navigate('/dashboard/problems')} className="blue-gradient-bg text-white px-6 py-2.5 rounded-xl text-sm font-bold cursor-pointer">
          Back to Problems
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/problems')}
            className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center text-text-2 hover:text-text hover:border-white/20 transition cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-3">{question?.topic}</span>
            <span className="text-text-3">·</span>
            <DiffBadge diff={question?.difficulty} />
          </div>
        </div>

        {/* Progress indicator */}
        {queue.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-3">
              {currentIndex + 1} / {queue.length}
            </span>
            <div className="flex gap-1">
              {queue.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-5 rounded-full transition-colors ${
                    i < currentIndex ? 'bg-blue-400' :
                    i === currentIndex ? 'bg-blue-400/60' :
                    'bg-white/[0.08]'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Question card */}
      <GlassCard className="p-7 rounded-2xl">
        <p className="text-lg font-semibold leading-relaxed mb-6">{question?.question_text}</p>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {displayOptions.map((option, i) => (
            <button
              key={option.id}
              onClick={() => !locked && setSelectedOption(option.id)}
              className={`flex items-center gap-3 w-full text-left px-4 py-3.5 rounded-xl border transition-all ${getOptionStyle(option)}`}
            >
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                locked && option.is_correct ? 'bg-emerald-500/20 text-emerald-400' :
                locked && option.id === selectedOption && !option.is_correct ? 'bg-pink-500/20 text-pink-400' :
                selectedOption === option.id ? 'bg-blue-500/20 text-blue-400' :
                'bg-white/[0.06] text-text-3'
              }`}>
                {OPTION_LABELS[i]}
              </span>
              <span className="text-sm flex-1">{option.option_text}</span>
              {getOptionIcon(option)}
            </button>
          ))}
        </div>

        {/* Lock answer button */}
        {!locked && (
          <button
            onClick={handleLockAnswer}
            disabled={!selectedOption}
            className="mt-5 w-full blue-gradient-bg text-white font-bold rounded-xl py-3 text-sm shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:shadow-[0_4px_24px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
          >
            <Lock size={14} />
            Lock Answer
          </button>
        )}

        {/* Result badge */}
        {locked && result && (
          <div className={`mt-5 flex items-center gap-2.5 px-4 py-3 rounded-xl ${
            result.is_correct
              ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400'
              : 'bg-pink-500/10 border border-pink-500/25 text-pink-400'
          }`}>
            {result.is_correct ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            <span className="font-bold text-sm">
              {result.is_correct ? 'Correct! Well done.' : 'Incorrect — see the AI overview below.'}
            </span>
          </div>
        )}
      </GlassCard>

      {/* AI Overview */}
      {locked && (
        <GlassCard className="p-7 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-blue-400" />
            <span className="text-sm font-bold blue-gradient-text uppercase tracking-wide">AI Overview</span>
          </div>

          {explainLoading ? (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-text-2 text-sm mb-2">
                <Loader2 size={14} className="animate-spin" />
                Generating explanation…
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-3.5 rounded-lg bg-white/[0.06] animate-pulse" style={{ width: `${90 - i * 8}%` }} />
              ))}
            </div>
          ) : (
            <div className="text-sm text-text-2 leading-relaxed whitespace-pre-wrap">
              {explanation}
            </div>
          )}
        </GlassCard>
      )}

      {/* Next / Finish button */}
      {locked && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard/problems')}
            className="text-sm text-text-2 hover:text-text transition cursor-pointer"
          >
            ← Back to Problems
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 blue-gradient-bg text-white font-bold rounded-xl px-6 py-3 text-sm shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:shadow-[0_4px_24px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 transition cursor-pointer"
          >
            {isLast ? (
              <><Trophy size={15} /> Finish</>
            ) : (
              <>Next Question <ArrowRight size={15} /></>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

function DiffBadge({ diff }) {
  const style = {
    Easy:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Hard:   'bg-pink-500/10 text-pink-400 border-pink-500/20',
  }[diff] || 'bg-white/[0.05] text-text-3 border-white/10'

  return (
    <span className={`text-[0.62rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${style}`}>
      {diff}
    </span>
  )
}