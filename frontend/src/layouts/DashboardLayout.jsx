import { useStreak } from '../hooks/useStreak.js'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import {
  Home,
  Puzzle,
  CheckCircle2,
  NotebookPen,
  LineChart,
  BookOpen,
  Bell,
  Settings,
  Flame,
  ChevronDown,
  User,
  Trophy,
  Volume2,
  Moon,
  LogOut,
  LayoutDashboard,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Home', icon: Home, end: true },
  { to: '/dashboard/problems', label: 'Problems', icon: Puzzle },
  { to: '/dashboard/solved', label: 'Solved', icon: CheckCircle2 },
  { to: '/dashboard/attempted', label: 'Attempted', icon: NotebookPen },
]

const CRUMBS = {
  '/dashboard': { icon: Home, label: 'Dashboard' },
  '/dashboard/problems': { icon: Puzzle, label: 'Problems' },
  '/dashboard/solved': { icon: CheckCircle2, label: 'Solved' },
  '/dashboard/attempted': { icon: NotebookPen, label: 'Attempted' },
}

const NOTIFICATIONS = [
  { id: 1, dot: 'bg-violet-400', title: 'UPSC Prelims 2025 mock added', time: '2 min ago', unread: true },
  { id: 2, dot: 'bg-emerald-400', title: '🎉 5 problems solved today!', time: '1 hour ago', unread: true },
  { id: 3, dot: 'bg-blue-400', title: 'SSC CGL 2025 notification is out', time: '3 hours ago', unread: true },
  { id: 4, dot: 'bg-text-3', title: 'Weekly: you hit the 85th percentile', time: 'Yesterday', unread: false },
  { id: 5, dot: 'bg-text-3', title: 'IBPS PO Mock scored 74/100', time: '2 days ago', unread: false },
]

export default function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const currentStreak = useStreak()
  const crumb = CRUMBS[location.pathname] || CRUMBS['/dashboard']
  const CrumbIcon = crumb.icon

  // Derive initials and short name from real user
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'
  const shortName = user?.name
    ? user.name.split(' ')[0] + (user.name.split(' ')[1] ? ' ' + user.name.split(' ')[1][0] + '.' : '')
    : 'User'

  function handleLogout() {
    logout()
    navigate('/signin')
  }

  const [openDropdown, setOpenDropdown] = useState(null)
  const notifsRef = useRef(null)
  const userRef = useRef(null)
  const popoverRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      const triggers = [notifsRef.current, userRef.current]
      const clickedTrigger = triggers.some((el) => el && el.contains(e.target))
      const clickedPopover = popoverRef.current && popoverRef.current.contains(e.target)
      if (!clickedTrigger && !clickedPopover) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on scroll/resize so a stale popover doesn't drift away from its trigger
  useEffect(() => {
    if (!openDropdown) return
    function close() {
      setOpenDropdown(null)
    }
    window.addEventListener('resize', close)
    return () => window.removeEventListener('resize', close)
  }, [openDropdown])

  function toggleDropdown(name) {
    setOpenDropdown((prev) => (prev === name ? null : name))
  }

  return (
    <div className="relative h-screen bg-void text-text font-sans overflow-hidden flex">
      {/* Aurora background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute w-[900px] h-[600px] rounded-full blur-[110px] opacity-40 -top-52 -left-52 bg-[radial-gradient(ellipse,rgba(59,130,246,0.35),transparent_70%)] animate-[drift1_18s_ease-in-out_infinite]" />
        <div className="absolute w-[700px] h-[700px] rounded-full blur-[110px] opacity-40 top-[15%] -right-52 bg-[radial-gradient(ellipse,rgba(34,211,238,0.25),transparent_70%)] animate-[drift2_22s_ease-in-out_infinite]" />
        <div className="absolute w-[800px] h-[500px] rounded-full blur-[110px] opacity-30 -bottom-24 left-[28%] bg-[radial-gradient(ellipse,rgba(29,78,216,0.2),transparent_70%)] animate-[drift3_20s_ease-in-out_infinite]" />
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[110px] opacity-30 bottom-[18%] right-[8%] bg-[radial-gradient(ellipse,rgba(244,114,182,0.18),transparent_70%)] animate-[drift1_15s_ease-in-out_infinite_reverse]" />
      </div>

      {/* RAIL */}
      <aside className="relative z-10 w-14 flex-shrink-0 flex flex-col items-center py-4 gap-1 bg-void/70 border-r border-white/[0.06] backdrop-blur-xl">
        <div className="w-9 h-9 rounded-xl blue-gradient-bg flex items-center justify-center font-display font-black text-sm text-white mb-3 flex-shrink-0">
          B
        </div>

        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <RailButton key={to} to={to} label={label} icon={Icon} end={end} />
        ))}

        <div className="w-7 h-px bg-white/[0.07] my-2" />

        <RailButton to="#" label="Analytics" icon={LineChart} disabled />
        <RailButton to="#" label="Study Plan" icon={BookOpen} disabled />
        <RailButton to="#" label="Notifications" icon={Bell} disabled dot />
        <RailButton to="#" label="Settings" icon={Settings} disabled />

        <div className="mt-auto w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center font-display font-black text-xs text-white cursor-pointer hover:scale-105 transition flex-shrink-0">
          {initials}
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* TOPBAR */}
        <header className="relative z-30 h-[62px] flex-shrink-0 flex items-center justify-between px-7 bg-void/50 border-b border-white/[0.06] backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <span className="font-display font-black text-lg tracking-tight">
              <span className="blue-gradient-text">Brain</span>Flex
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse mx-1" />
            <span className="text-xs text-text-3 hidden sm:inline">Test. Learn. Conquer.</span>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-3.5 py-1.5 text-sm font-semibold text-text-2">
            <CrumbIcon size={14} />
            <span className="text-text">{crumb.label}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Streak */}
            <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-400/25 rounded-full px-3.5 py-1.5 text-sm font-bold text-blue-300 select-none">
              <Flame size={14} className="text-blue-300" />
              {currentStreak > 0 ? `${currentStreak}-day streak` : 'Start streak'}
            </div>

            {/* Notifications */}
            <IconButton ref={notifsRef} onClick={() => toggleDropdown('notifs')} hasDot>
              <Bell size={15} />
            </IconButton>

            {/* User */}
            <button
              ref={userRef}
              onClick={() => toggleDropdown('user')}
              className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-xl pr-3 pl-1 py-1 cursor-pointer hover:border-white/20 hover:bg-white/[0.06] transition"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center font-display font-black text-[0.7rem] text-white flex-shrink-0">
                {initials}
              </div>
              <span className="text-sm font-medium">{shortName}</span>
              <ChevronDown size={12} className="text-text-3" />
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="relative z-10 flex-1 overflow-y-auto px-7 py-6">
          <Outlet />
        </main>
      </div>

      {/* PORTALED POPOVERS — render outside the dashboard DOM tree entirely,
          so backdrop-blur stacking contexts on cards below can never bury them. */}
      {openDropdown === 'notifs' && (
        <AnchoredPopover anchorRef={notifsRef} popoverRef={popoverRef} width={320}>
          <NotificationsPopoverContent />
        </AnchoredPopover>
      )}
      {openDropdown === 'user' && (
        <AnchoredPopover anchorRef={userRef} popoverRef={popoverRef} width={240}>
          <UserPopoverContent user={user} initials={initials} onLogout={handleLogout} />
        </AnchoredPopover>
      )}

      <style>{`
        @keyframes drift1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(60px,-40px) scale(1.1)} 66%{transform:translate(-40px,60px) scale(.95)} }
        @keyframes drift2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-80px,50px) scale(1.05)} 66%{transform:translate(50px,-60px) scale(1.1)} }
        @keyframes drift3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-60px,-30px) scale(1.08)} }
      `}</style>
    </div>
  )
}

/**
 * Renders its children into document.body, positioned just below/right-aligned
 * to the anchor element's current bounding box. Escapes every ancestor
 * stacking context (backdrop-blur cards, overflow containers, etc.) entirely.
 */
function AnchoredPopover({ anchorRef, popoverRef, width, children }) {
  const [coords, setCoords] = useState(null)

  useEffect(() => {
    function updatePosition() {
      if (!anchorRef.current) return
      const rect = anchorRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom + 10,
        right: window.innerWidth - rect.right,
      })
    }
    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [anchorRef])

  if (!coords) return null

  return createPortal(
    <div
      ref={popoverRef}
      style={{ position: 'fixed', top: coords.top, right: coords.right, width }}
      className="z-[200] bg-[#070914]/95 border border-white/10 rounded-2xl p-3 shadow-[0_30px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
    >
      {children}
    </div>,
    document.body
  )
}

function RailButton({ to, label, icon: Icon, end, disabled, dot }) {
  const base =
    'relative w-9 h-9 rounded-xl flex items-center justify-center transition group flex-shrink-0'

  const content = (
    <>
      <Icon size={16} />
      {dot && (
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-pink-400 ring-2 ring-void" />
      )}
      <span className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 whitespace-nowrap bg-[#0a0c19] border border-white/10 rounded-md px-2.5 py-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition z-50">
        {label}
      </span>
    </>
  )

  if (disabled) {
    return (
      <div className={`${base} text-text-3 cursor-not-allowed hover:bg-white/[0.04]`}>{content}</div>
    )
  }

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `${base} cursor-pointer ${
          isActive
            ? 'bg-white/[0.08] text-text border border-white/10'
            : 'text-text-3 hover:bg-white/[0.05] hover:text-text-2 border border-transparent'
        }`
      }
    >
      {content}
    </NavLink>
  )
}

function IconButton({ children, onClick, hasDot, ref }) {
  return (
    <button
      ref={ref}
      onClick={onClick}
      className="relative w-9 h-9 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center text-text-2 cursor-pointer hover:bg-white/[0.06] hover:border-white/20 hover:text-text transition"
    >
      {children}
      {hasDot && (
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-pink-400 ring-2 ring-void" />
      )}
    </button>
  )
}

function NotificationsPopoverContent() {
  return (
    <>
      <div className="px-2 pt-1 pb-2 border-b border-white/[0.07] mb-1.5">
        <div className="font-bold text-sm">Notifications</div>
      </div>
      <div className="flex flex-col">
        {NOTIFICATIONS.map((n) => (
          <div key={n.id} className="flex gap-2.5 px-2 py-2 rounded-lg hover:bg-white/[0.04] transition cursor-pointer">
            <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.dot}`} />
            <div>
              <div className={`text-sm ${n.unread ? 'text-text font-medium' : 'text-text-2'}`}>
                {n.title}
              </div>
              <div className="text-xs text-text-3 mt-0.5">{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function UserPopoverContent({ user, initials, onLogout }) {
  return (
    <>
      <div className="px-2 pt-1 pb-2.5 border-b border-white/[0.07] mb-1.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center font-display font-black text-[0.7rem] text-white flex-shrink-0">
            {initials}
          </div>
          <div>
            <div className="font-bold text-sm">{user?.name || 'User'}</div>
            <div className="text-xs text-text-2">{user?.email || ''}</div>
          </div>
        </div>
      </div>

      <PopoverRow icon={LayoutDashboard} label="Dashboard" />
      <PopoverRow icon={User} label="Edit Profile" />
      <PopoverRow icon={Trophy} label="Achievements" />

      <div className="h-px bg-white/[0.07] my-1.5" />

      <ToggleRow icon={Volume2} label="Sound" defaultOn />
      <ToggleRow icon={Moon} label="Dark Mode" defaultOn />
      <ToggleRow icon={Bell} label="Notifs" defaultOn />

      <div className="h-px bg-white/[0.07] my-1.5" />

      <div
        onClick={onLogout}
        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm cursor-pointer transition hover:bg-white/[0.05] text-pink-400"
      >
        <LogOut size={14} />
        Sign Out
      </div>
    </>
  )
}

function PopoverRow({ icon: Icon, label, danger }) {
  return (
    <div
      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm cursor-pointer transition hover:bg-white/[0.05] ${
        danger ? 'text-pink-400' : 'text-text-2 hover:text-text'
      }`}
    >
      <Icon size={14} />
      {label}
    </div>
  )
}

function ToggleRow({ icon: Icon, label, defaultOn }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-center justify-between px-2.5 py-1.5 text-sm text-text-2">
      <div className="flex items-center gap-2.5">
        <Icon size={14} />
        {label}
      </div>
      <button
        onClick={() => setOn((v) => !v)}
        className={`w-9 h-5 rounded-full relative cursor-pointer transition flex-shrink-0 ${
          on ? 'bg-blue-500' : 'bg-white/10'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            on ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}