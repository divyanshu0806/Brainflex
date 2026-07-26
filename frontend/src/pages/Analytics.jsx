import { useState, useEffect } from 'react'
import { Loader2, TrendingUp, Target, Calendar, Zap } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { getAnalytics } from '../api/api.js'
import { GlassCard, SectionLabel } from '../components/GlassCard.jsx'

const DIFF_COLOR = { Easy: '#34d399', Medium: '#3b82f6', Hard: '#f472b6' }

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#070914]/95 border border-white/10 rounded-xl px-3 py-2 text-xs backdrop-blur-xl">
      <div className="text-text-2 mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}{p.name.toLowerCase().includes('accuracy') ? '%' : ''}
        </div>
      ))}
    </div>
  )
}

export default function Analytics() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-blue-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-pink-400 bg-pink-500/10 border border-pink-500/20 rounded-xl px-4 py-3 max-w-md">
        Could not load analytics: {error}
      </div>
    )
  }

  const hasData = data?.overallStats?.totalAttempts > 0

  return (
    <div className="flex flex-col gap-5 max-w-[1200px]">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black tracking-tight">Analytics</h1>
        <p className="text-text-2 text-sm mt-1">
          {hasData ? 'Your performance breakdown' : 'Start answering questions to see your analytics'}
        </p>
      </div>

      {/* Overall stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Target}    label="Overall Accuracy"   value={`${data.overallStats.overallAccuracy}%`}  color="text-blue-400"    bg="bg-blue-500/10"    />
        <StatCard icon={Zap}       label="Total Attempted"    value={data.overallStats.totalAttempts}           color="text-violet-400"  bg="bg-violet-500/10"  />
        <StatCard icon={TrendingUp} label="Total Correct"     value={data.overallStats.totalCorrect}            color="text-emerald-400" bg="bg-emerald-500/10" />
        <StatCard icon={Calendar}  label="Active Days"        value={data.overallStats.activeDays}              color="text-cyan-400"    bg="bg-cyan-500/10"    />
      </div>

      {!hasData ? (
        <GlassCard className="p-16 text-center">
          <TrendingUp size={48} className="text-text-3 mx-auto mb-4" />
          <div className="font-display text-xl font-black mb-2">No data yet</div>
          <p className="text-text-2 text-sm">Answer some questions to unlock your analytics dashboard.</p>
        </GlassCard>
      ) : (
        <>
          {/* Accuracy trend line chart */}
          {data.recentTrend.length > 1 && (
            <GlassCard className="p-6">
              <SectionLabel>Accuracy Trend — Last 14 Days</SectionLabel>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.recentTrend} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#4a5278', fontSize: 11 }}
                    tickFormatter={(d) => d.slice(5)}
                  />
                  <YAxis
                    tick={{ fill: '#4a5278', fontSize: 11 }}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    name="Accuracy"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </GlassCard>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Performance by difficulty */}
            <GlassCard className="p-6">
              <SectionLabel>Performance by Difficulty</SectionLabel>
              {data.difficultyPerformance.length === 0 ? (
                <p className="text-text-3 text-sm py-4">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.difficultyPerformance} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="difficulty" tick={{ fill: '#4a5278', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#4a5278', fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="accuracy" name="Accuracy" radius={[6, 6, 0, 0]}>
                      {data.difficultyPerformance.map((entry) => (
                        <Cell key={entry.difficulty} fill={DIFF_COLOR[entry.difficulty] || '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </GlassCard>

            {/* Daily activity bar chart */}
            <GlassCard className="p-6">
              <SectionLabel>Daily Activity — Last 30 Days</SectionLabel>
              {data.dailyActivity.length === 0 ? (
                <p className="text-text-3 text-sm py-4">No activity yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.dailyActivity} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: '#4a5278', fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                    <YAxis tick={{ fill: '#4a5278', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="correct" name="Correct" fill="#34d399" radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="total"   name="Total"   fill="rgba(59,130,246,0.3)" radius={[4, 4, 0, 0]} stackId="b" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </GlassCard>
          </div>

          {/* Topic performance horizontal bars */}
          <GlassCard className="p-6">
            <SectionLabel>Topic Performance</SectionLabel>
            {data.topicPerformance.length === 0 ? (
              <p className="text-text-3 text-sm py-4">No topic data yet</p>
            ) : (
              <div className="flex flex-col gap-3">
                {data.topicPerformance.map((t) => (
                  <div key={t.topic}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-text-2 font-medium">{t.topic}</span>
                      <div className="flex items-center gap-3 text-xs text-text-3">
                        <span>{t.correct}/{t.total} correct</span>
                        <span className={`font-bold ${
                          t.accuracy >= 70 ? 'text-emerald-400' :
                          t.accuracy >= 40 ? 'text-blue-400' : 'text-pink-400'
                        }`}>{t.accuracy}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-[width] duration-700 ${
                          t.accuracy >= 70 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                          t.accuracy >= 40 ? 'bg-gradient-to-r from-blue-600 to-blue-400' :
                          'bg-gradient-to-r from-pink-600 to-pink-400'
                        }`}
                        style={{ width: `${t.accuracy}%` }}
                      />
                    </div>
                    {t.accuracy < 50 && (
                      <div className="text-[0.68rem] text-pink-400 mt-0.5">⚠ Weak area — needs practice</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <GlassCard className="p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
        <Icon size={18} className={color} />
      </div>
      <div className={`font-display text-2xl font-black leading-none ${color}`}>{value}</div>
      <div className="text-[0.78rem] text-text-2 mt-1">{label}</div>
    </GlassCard>
  )
}