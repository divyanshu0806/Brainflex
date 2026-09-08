import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Sparkles, Loader2, Lightbulb, HelpCircle, BookOpen, Compass, RotateCcw } from 'lucide-react'
import { GlassCard } from './GlassCard.jsx'
import { chatWithTutor } from '../api/api.js'

const QUICK_CHIPS = [
  { icon: Lightbulb, label: 'Give me a mnemonic to remember this', prompt: 'Can you give me a catchy mnemonic or memory trick to easily remember this concept in exams?' },
  { icon: HelpCircle, label: 'Why are other options wrong?', prompt: 'Can you briefly explain why the other options are incorrect and what common traps they represent?' },
  { icon: Compass, label: 'Exam angle & PYQ patterns', prompt: 'How is this topic usually tested in competitive exams (UPSC / SSC / IBPS)? What related questions should I be prepared for?' },
  { icon: BookOpen, label: 'Real-world example / analogy', prompt: 'Can you explain this concept using a simple real-world analogy or case study?' },
]

export default function AITutorChat({ questionId, selectedOptionId, questionTopic }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Reset messages if question changes
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `Hi there! 👋 I'm your AI Exam Tutor for **${questionTopic || 'this topic'}**. Have any doubts about why an option is right/wrong, or want mnemonics and exam tips? Ask me below!`,
      },
    ])
    setError(null)
    setInput('')
  }, [questionId, questionTopic])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(textToSend) {
    const text = textToSend || input.trim()
    if (!text || loading) return

    const newMessages = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const res = await chatWithTutor({
        question_id: questionId,
        selected_option_id: selectedOptionId,
        messages: newMessages,
      })

      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }])
    } catch (err) {
      setError(err.message || 'Failed to get answer from AI Tutor. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function handleReset() {
    setMessages([
      {
        role: 'assistant',
        content: `Hi there! 👋 I'm your AI Exam Tutor for **${questionTopic || 'this topic'}**. Have any doubts about why an option is right/wrong, or want mnemonics and exam tips? Ask me below!`,
      },
    ])
    setError(null)
  }

  return (
    <GlassCard className="p-6 rounded-2xl border-blue-400/20 bg-gradient-to-b from-blue-950/20 via-void/50 to-void/70">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Bot size={17} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-text">Ask AI Tutor</span>
              <span className="inline-flex items-center gap-1 text-[0.62rem] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-400/20">
                <Sparkles size={10} className="text-blue-400" />
                Doubt Solver
              </span>
            </div>
            <p className="text-xs text-text-3">Instant contextual explanations & exam guidance</p>
          </div>
        </div>

        {messages.length > 1 && (
          <button
            onClick={handleReset}
            title="Reset Chat"
            className="flex items-center gap-1 text-xs text-text-3 hover:text-text-2 border border-white/10 rounded-lg px-2.5 py-1 hover:bg-white/[0.04] transition cursor-pointer"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Quick Prompt Chips (Visible especially when no user messages yet) */}
      {messages.length <= 1 && (
        <div className="mb-4">
          <div className="text-[0.68rem] font-bold text-text-3 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles size={11} className="text-blue-400" />
            Quick Prompts
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {QUICK_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(chip.prompt)}
                disabled={loading}
                className="flex items-center gap-2 text-left p-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-blue-500/10 hover:border-blue-400/30 hover:text-blue-300 transition text-xs text-text-2 group cursor-pointer disabled:opacity-50"
              >
                <div className="w-6 h-6 rounded-lg bg-white/[0.04] group-hover:bg-blue-500/20 flex items-center justify-center text-text-3 group-hover:text-blue-400 flex-shrink-0">
                  <chip.icon size={13} />
                </div>
                <span className="font-medium line-clamp-1">{chip.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages Container */}
      <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1 mb-4 scrollbar-thin scrollbar-thumb-white/10">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={13} />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_2px_10px_rgba(59,130,246,0.3)]'
                  : 'bg-white/[0.04] border border-white/[0.08] text-text-2 shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">
                {formatMessageContent(m.content)}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-1">
              <Bot size={13} />
            </div>
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 text-sm text-text-2 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-blue-400" />
              <span className="text-xs text-text-3">AI Tutor is thinking…</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="text-xs text-pink-400 bg-pink-500/10 border border-pink-500/20 rounded-xl px-3.5 py-2 mb-3">
          {error}
        </div>
      )}

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          sendMessage()
        }}
        className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-xl p-1.5 focus-within:border-blue-400/40 transition"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a doubt about this question or topic…"
          disabled={loading}
          className="flex-1 bg-transparent outline-none text-sm text-text placeholder:text-text-3 px-3 py-1"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="w-9 h-9 rounded-lg blue-gradient-bg text-white flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_12px_rgba(59,130,246,0.5)] transition"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        </button>
      </form>
    </GlassCard>
  )
}

function formatMessageContent(content) {
  if (!content) return ''
  const parts = content.split('\n')
  return parts.map((line, idx) => {
    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('* ')
    
    const elements = []
    const boldRegex = /\*\*(.*?)\*\*/g
    let lastIndex = 0
    let match

    while ((match = boldRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        elements.push(line.substring(lastIndex, match.index))
      }
      elements.push(<strong key={match.index} className="text-text font-bold">{match[1]}</strong>)
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < line.length) {
      elements.push(line.substring(lastIndex))
    }

    return (
      <span key={idx} className={`block ${isBullet ? 'pl-2 text-text-2 my-0.5' : 'my-1 text-text-2'}`}>
        {elements.length > 0 ? elements : line}
      </span>
    )
  })
}
