import { useState, useMemo } from 'react'
import { Calendar, Target, BookOpen, ChevronRight, CheckCircle2, Clock, Flame, Trophy } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { GlassCard, SectionLabel } from '../components/GlassCard.jsx'

const EXAMS = [
  { id: 'upsc', name: 'UPSC CSE', icon: '🏛️', topics: ['History', 'Geography', 'Polity', 'Economics', 'Science', 'Current Affairs', 'Reasoning'] },
  { id: 'ssc',  name: 'SSC CGL',  icon: '📋', topics: ['Mathematics', 'Reasoning', 'English', 'General Awareness'] },
  { id: 'ibps', name: 'IBPS PO',  icon: '🏦', topics: ['Reasoning', 'Mathematics', 'English', 'General Awareness', 'Computer Knowledge'] },
]

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const INTENSITY_COLORS = {
  light:  'bg-blue-500/10 text-blue-300 border-blue-500/20',
  medium: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  heavy:  'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  rest:   'bg-white/[0.03] text-text-3 border-white/10',
}

function generateWeeklyPlan(topics) {
  // Distribute topics across the week, Sunday = rest
  const plan = WEEK_DAYS.map((day, i) => {
    if (i === 6) return { day, topic: 'Rest & Revision', intensity: 'rest', questions: 0 }
    const topic = topics[i % topics.length]
    const intensity = i < 2 ? 'light' : i < 5 ? 'medium' : 'heavy'
    const questions = intensity === 'light' ? 10 : intensity === 'medium' ? 15 : 20
    return { day, topic, intensity, questions }
  })
  return plan
}

export default function StudyPlan() {
  const navigate = useNavigate()
  const [selectedExam, setSelectedExam] = useState(null)
  const [targetDate, setTargetDate]     = useState('')
  const [planGenerated, setPlanGenerated] = useState(false)

  const exam = EXAMS.find((e) => e.id === selectedExam)

  const daysRemaining = useMemo(() => {
    if (!targetDate) return null
    const diff = new Date(targetDate) - new Date()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }, [targetDate])

  const dailyTarget = useMemo(() => {
    if (!exam || !daysRemaining) return 0
    return Math.ceil((exam.topics.length * 25) / daysRemaining)
  }, [exam, daysRemaining])

  const weeklyPlan = useMemo(() => {
    if (!exam) return []
    return generateWeeklyPlan(exam.topics)
  }, [exam])

  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  const todayPlan  = weeklyPlan[todayIndex]

  function handleGenerate() {
    if (!selectedExam || !targetDate) return
    setPlanGenerated(true)
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1100px]">
      <div>
        <h1 className="font-display text-3xl font-black tracking-tight">Study Plan</h1>
        <p className="text-text-2 text-sm mt-1">Build a personalised schedule for your target exam</p>
      </div>

      {/* Setup Card */}
      {!planGenerated ? (
        <GlassCard className="p-8">
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 blue-gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                <BookOpen size={28} className="text-white" />
              </div>
              <h2 className="font-display text-2xl font-black mb-2">Set Up Your Plan</h2>
              <p className="text-text-2 text-sm">Choose your target exam and date to generate a personalised study schedule</p>
            </div>

            {/* Exam selector */}
            <div className="mb-6">
              <label className="text-[0.7rem] font-semibold uppercase tracking-wide text-text-3 mb-3 block">
                Target Exam
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {EXAMS.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setSelectedExam(e.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition cursor-pointer ${
                      selectedExam === e.id
                        ? 'bg-blue-500/10 border-blue-400/40 text-text'
                        : 'bg-white/[0.03] border-white/10 text-text-2 hover:border-white/20 hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className="text-2xl">{e.icon}</span>
                    <span className="font-bold text-sm">{e.name}</span>
                    <span className="text-[0.68rem] text-text-3">{e.topics.length} topics</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target date */}
            <div className="mb-8">
              <label className="text-[0.7rem] font-semibold uppercase tracking-wide text-text-3 mb-3 block">
                Exam Date
              </label>
              <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 focus-within:border-blue-400/40 transition">
                <Calendar size={15} className="text-text-3 flex-shrink-0" />
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="bg-transparent outline-none text-sm w-full text-text"
                />
              </div>
              {daysRemaining !== null && (
                <p className="text-xs text-blue-300 mt-2 flex items-center gap-1">
                  <Clock size={11} /> {daysRemaining} days remaining
                </p>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={!selectedExam || !targetDate}
              className="w-full blue-gradient-bg text-white font-bold rounded-xl py-3.5 text-sm shadow-[0_0_24px_rgba(59,130,246,0.25)] hover:shadow-[0_6px_30px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              <Target size={15} /> Generate Study Plan
            </button>
          </div>
        </GlassCard>
      ) : (
        <>
          {/* Plan Header */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{exam?.icon}</span>
                  <h2 className="font-display text-2xl font-black">{exam?.name} Plan</h2>
                </div>
                <p className="text-text-2 text-sm">Target: {new Date(targetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-center">
                  <div className="font-display text-3xl font-black blue-gradient-text">{daysRemaining}</div>
                  <div className="text-[0.68rem] text-text-3 uppercase tracking-wide">Days Left</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-3xl font-black text-emerald-400">{dailyTarget}</div>
                  <div className="text-[0.68rem] text-text-3 uppercase tracking-wide">Qs/Day</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-3xl font-black text-violet-400">{exam?.topics.length}</div>
                  <div className="text-[0.68rem] text-text-3 uppercase tracking-wide">Topics</div>
                </div>
              </div>
              <button
                onClick={() => { setPlanGenerated(false); setSelectedExam(null); setTargetDate('') }}
                className="text-xs text-text-3 hover:text-text-2 transition cursor-pointer border border-white/10 rounded-lg px-3 py-1.5"
              >
                ← Change Plan
              </button>
            </div>
          </GlassCard>

          {/* Today's Focus */}
          {todayPlan && todayPlan.intensity !== 'rest' && (
            <GlassCard className="p-6 bg-gradient-to-br from-blue-500/10 to-violet-500/5 border-blue-400/20">
              <div className="flex items-center gap-2 mb-3">
                <Flame size={16} className="text-blue-400" />
                <span className="text-sm font-bold text-blue-300 uppercase tracking-wide">Today's Focus</span>
              </div>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="font-display text-2xl font-black mb-1">{todayPlan.topic}</div>
                  <div className="text-text-2 text-sm">Target: {todayPlan.questions} questions today</div>
                </div>
                <button
                  onClick={() => navigate('/dashboard/problems')}
                  className="flex items-center gap-2 blue-gradient-bg text-white font-bold rounded-xl px-5 py-2.5 text-sm cursor-pointer hover:-translate-y-0.5 transition shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                >
                  Start Practice <ChevronRight size={15} />
                </button>
              </div>
            </GlassCard>
          )}

          {todayPlan?.intensity === 'rest' && (
            <GlassCard className="p-6 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 border-emerald-400/20">
              <div className="flex items-center gap-3">
                <Trophy size={24} className="text-emerald-400" />
                <div>
                  <div className="font-bold text-base">Rest & Revision Day 🎉</div>
                  <div className="text-text-2 text-sm mt-0.5">Review your weak areas and consolidate what you've learned this week.</div>
                </div>
              </div>
            </GlassCard>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Weekly Schedule */}
            <GlassCard className="p-6">
              <SectionLabel>Weekly Schedule</SectionLabel>
              <div className="flex flex-col gap-2">
                {weeklyPlan.map((day, i) => (
                  <div
                    key={day.day}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border transition ${
                      i === todayIndex
                        ? 'bg-blue-500/10 border-blue-400/30'
                        : 'bg-white/[0.02] border-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold w-8 ${i === todayIndex ? 'text-blue-400' : 'text-text-3'}`}>
                        {day.day}
                      </span>
                      <span className="text-sm font-medium">{day.topic}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {day.questions > 0 && (
                        <span className="text-xs text-text-3">{day.questions} Qs</span>
                      )}
                      <span className={`text-[0.6rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${INTENSITY_COLORS[day.intensity]}`}>
                        {day.intensity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Topics Overview */}
            <GlassCard className="p-6">
              <SectionLabel>Topics to Cover</SectionLabel>
              <div className="flex flex-col gap-2.5">
                {exam?.topics.map((topic, i) => (
                  <div key={topic} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-[0.65rem] font-bold text-blue-400">
                        {i + 1}
                      </div>
                      <span className="text-sm font-medium">{topic}</span>
                    </div>
                    <button
                      onClick={() => navigate('/dashboard/problems')}
                      className="text-xs text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      Practice <ChevronRight size={11} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-white/[0.07]">
                <div className="flex items-center gap-2 text-xs text-text-3">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  <span>Complete <span className="text-text font-semibold">{dailyTarget} questions/day</span> to finish all topics before your exam</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </div>
  )
}