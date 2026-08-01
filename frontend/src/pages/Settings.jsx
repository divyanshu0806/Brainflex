import { useState } from 'react'
import { User, Lock, Moon, Sun, Bell, Trash2, Save, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { GlassCard } from '../components/GlassCard.jsx'
import { updateProfile, updatePassword, deleteAccount } from '../api/api.js'

export default function Settings() {
  const { user } = useAuth()

  const [profile, setProfile] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  const [passwords, setPasswords] = useState({ current: '', newPw: '', confirm: '' })
  const [showPw, setShowPw]       = useState({ current: false, newPw: false, confirm: false })
  const [darkMode, setDarkMode]       = useState(true)
  const [notifs, setNotifs]           = useState(true)
  const [emailNotifs, setEmailNotifs] = useState(false)
  const [profileSaved,  setProfileSaved]  = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [profileError,  setProfileError]  = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [savingProfile,  setSavingProfile]  = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  async function handleSaveProfile(e) {
    e.preventDefault()
    setProfileError('')
    setSavingProfile(true)
    try {
      await updateProfile({ name: profile.name, phone: profile.phone })
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 3000)
    } catch (err) {
      setProfileError(err.message || 'Failed to save profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setPasswordError('')
    if (passwords.newPw !== passwords.confirm) { setPasswordError('New passwords do not match.'); return }
    if (passwords.newPw.length < 6) { setPasswordError('Password must be at least 6 characters.'); return }
    setSavingPassword(true)
    try {
      await updatePassword({ currentPassword: passwords.current, newPassword: passwords.newPw })
      setPasswordSaved(true)
      setPasswords({ current: '', newPw: '', confirm: '' })
      setTimeout(() => setPasswordSaved(false), 3000)
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.')
    } finally {
      setSavingPassword(false)
    }
  }

  const initials = user?.name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?'

  return (
    <div className="flex flex-col gap-5 max-w-[720px]">
      <div>
        <h1 className="font-display text-3xl font-black tracking-tight">Settings</h1>
        <p className="text-text-2 text-sm mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <GlassCard className="p-6">
        <SectionHead icon={User} iconBg="bg-blue-500/10" iconColor="text-blue-400" title="Profile Information" />
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center font-display font-black text-xl text-white">
              {initials}
            </div>
            <div>
              <div className="font-semibold text-sm">{user?.name}</div>
              <div className="text-text-3 text-xs mt-0.5">{user?.email}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Full Name">
              <Input type="text" value={profile.name} placeholder="Your full name"
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
            </Field>
            <Field label="Phone">
              <Input type="tel" value={profile.phone} placeholder="9876543210"
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
            </Field>
          </div>

          <Field label="Email Address">
            <Input type="email" value={profile.email} disabled className="opacity-50 cursor-not-allowed" />
            <p className="text-text-3 text-xs mt-1">Email cannot be changed</p>
          </Field>

          {profileError  && <Alert type="error">{profileError}</Alert>}
          {profileSaved  && <Alert type="success">Profile saved successfully</Alert>}

          <div className="flex justify-end">
            <SaveButton loading={savingProfile} label="Save Profile" icon={Save} />
          </div>
        </form>
      </GlassCard>

      {/* Change Password */}
      <GlassCard className="p-6">
        <SectionHead icon={Lock} iconBg="bg-violet-500/10" iconColor="text-violet-400" title="Change Password" />
        <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
          <Field label="Current Password">
            <PwInput value={passwords.current} show={showPw.current}
              onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
              onToggle={() => setShowPw((p) => ({ ...p, current: !p.current }))} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="New Password">
              <PwInput value={passwords.newPw} show={showPw.newPw}
                onChange={(e) => setPasswords((p) => ({ ...p, newPw: e.target.value }))}
                onToggle={() => setShowPw((p) => ({ ...p, newPw: !p.newPw }))} />
            </Field>
            <Field label="Confirm New Password">
              <PwInput value={passwords.confirm} show={showPw.confirm}
                onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                onToggle={() => setShowPw((p) => ({ ...p, confirm: !p.confirm }))} />
            </Field>
          </div>
          {passwordError  && <Alert type="error">{passwordError}</Alert>}
          {passwordSaved  && <Alert type="success">Password changed successfully</Alert>}
          <div className="flex justify-end">
            <SaveButton loading={savingPassword} label="Update Password" icon={Lock} />
          </div>
        </form>
      </GlassCard>

      {/* Appearance */}
      <GlassCard className="p-6">
        <SectionHead icon={Moon} iconBg="bg-cyan-500/10" iconColor="text-cyan-400" title="Appearance & Notifications" />
        <div className="flex flex-col">
          <Toggle icon={darkMode ? Moon : Sun} iconClass="text-cyan-400" label="Dark Mode"
            description="Use dark theme across the app" value={darkMode} onChange={setDarkMode} />
          <Divider />
          <Toggle icon={Bell} iconClass="text-violet-400" label="In-app Notifications"
            description="Show notifications inside the app" value={notifs} onChange={setNotifs} />
          <Divider />
          <Toggle icon={Bell} iconClass="text-blue-400" label="Email Notifications"
            description="Receive updates and reminders via email" value={emailNotifs} onChange={setEmailNotifs} />
        </div>
      </GlassCard>

      {/* Danger Zone */}
      <GlassCard className="p-6 border-pink-500/20">
        <SectionHead icon={Trash2} iconBg="bg-pink-500/10" iconColor="text-pink-400" title="Danger Zone" titleClass="text-pink-400" />
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="font-semibold text-sm">Delete Account</div>
            <div className="text-text-3 text-xs mt-0.5">Permanently delete your account and all data. This cannot be undone.</div>
          </div>
          <button className="flex items-center gap-2 border border-pink-500/30 text-pink-400 rounded-xl px-4 py-2 text-sm font-semibold hover:bg-pink-500/10 transition cursor-pointer">
            <Trash2 size={14} /> Delete Account
          </button>
        </div>
      </GlassCard>
    </div>
  )
}

function SectionHead({ icon: Icon, iconBg, iconColor, title, titleClass = '' }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
        <Icon size={15} className={iconColor} />
      </div>
      <h2 className={`font-bold text-sm ${titleClass}`}>{title}</h2>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[0.7rem] font-semibold uppercase tracking-wide text-text-3">{label}</label>
      {children}
    </div>
  )
}

function Input({ className = '', ...props }) {
  return (
    <input {...props}
      className={`w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400/50 transition placeholder:text-text-3 text-text ${className}`}
    />
  )
}

function PwInput({ value, show, onChange, onToggle }) {
  return (
    <div className="relative">
      <Input type={show ? 'text' : 'password'} value={value} onChange={onChange}
        placeholder="••••••••" className="pr-9" required />
      <button type="button" onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-2 cursor-pointer">
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  )
}

function Alert({ type, children }) {
  const styles = type === 'error'
    ? 'text-pink-400 bg-pink-500/10 border-pink-500/20'
    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  return (
    <div className={`flex items-center gap-2 text-sm border rounded-xl px-4 py-2 ${styles}`}>
      <CheckCircle2 size={14} /> {children}
    </div>
  )
}

function SaveButton({ loading, label, icon: Icon }) {
  return (
    <button type="submit" disabled={loading}
      className="flex items-center gap-2 blue-gradient-bg text-white font-bold rounded-xl px-5 py-2.5 text-sm cursor-pointer hover:-translate-y-0.5 transition disabled:opacity-60 disabled:cursor-not-allowed">
      <Icon size={14} /> {loading ? 'Saving…' : label}
    </button>
  )
}

function Toggle({ icon: Icon, iconClass, label, description, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <Icon size={16} className={iconClass} />
        <div>
          <div className="text-sm font-medium">{label}</div>
          <div className="text-text-3 text-xs mt-0.5">{description}</div>
        </div>
      </div>
      <button onClick={() => onChange((v) => !v)}
        className={`w-10 h-5 rounded-full relative cursor-pointer transition flex-shrink-0 ${value ? 'bg-blue-500' : 'bg-white/10'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-white/[0.06]" />
}