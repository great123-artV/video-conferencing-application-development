"use client"

import { useMemo, useState } from "react"
import type { FormEvent } from "react"
import { useRouter } from "next/navigation"
import { createMeeting } from "@/app/actions/meetings"
import { authClient } from "@/lib/auth-client"
import {
  CalendarDays,
  ChevronDown,
  Clock3,
  Copy,
  Grid2X2,
  Headphones,
  HelpCircle,
  History,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  Mic,
  MicOff,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
  VideoOff,
  X,
} from "lucide-react"

import type { Meeting } from "@/lib/db/schema"

type DashboardProps = {
  user: { name: string; email: string }
  meetings: Meeting[]
}

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "My meetings", icon: CalendarDays },
  { label: "History", icon: History },
]

export default function Dashboard({ user, meetings }: DashboardProps) {
  const [activeNav, setActiveNav] = useState("Overview")
  const [joinOpen, setJoinOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [meetingTitle, setMeetingTitle] = useState("")
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState("")
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  function normalizeMeetingCode(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return ""

    try {
      const parsed = new URL(trimmed)
      const meetingSegment = parsed.pathname.split("/").filter(Boolean)
      const meetingIndex = meetingSegment.findIndex((segment) => segment.toLowerCase() === "meeting")
      if (meetingIndex >= 0 && meetingSegment[meetingIndex + 1]) {
        return decodeURIComponent(meetingSegment[meetingIndex + 1]).trim().toLowerCase()
      }
    } catch {
      // Treat non-URL input as a meeting code.
    }

    return trimmed.replace(/^\/?meeting\//i, "").split(/[?#]/, 1)[0].trim().toLowerCase()
  }

  function openMeeting(value: string) {
    const code = normalizeMeetingCode(value)
    if (!/^[a-z0-9]{3}-[a-z0-9]{4}-[a-z0-9]{3}$/i.test(code)) {
      setFormError("Enter a valid meeting code or paste a complete meeting link.")
      return
    }
    setJoinOpen(false)
    setJoinCode("")
    router.push(`/meeting/${encodeURIComponent(code)}`)
  }

  const initials = useMemo(() => user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(), [user.name])

  function copyLink(code: string) {
    navigator.clipboard?.writeText(`${window.location.origin}/meeting/${code}`)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  async function startInstantMeeting() {
    setCreating(true)
    setFormError("")
    try {
      const meeting = await createMeeting({ title: "Instant meeting" })
      openMeeting(meeting.code)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to create meeting")
    } finally {
      setCreating(false)
    }
  }

  async function handleCreateMeeting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreating(true)
    setFormError("")
    try {
      const meeting = await createMeeting({ title: meetingTitle.trim() })
      setCreateOpen(false)
      setMeetingTitle("")
      router.push(`/meeting/${encodeURIComponent(meeting.code)}`)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to create meeting")
    } finally {
      setCreating(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-[#1f2937]">
      <header className="sticky top-0 z-20 border-b border-[#e8e9ed] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-8">
            <button className="lg:hidden" aria-label="Open navigation" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X /> : <Menu />}
            </button>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#4f7cff] text-white shadow-sm">
                <Video className="size-5" strokeWidth={2.5} />
              </div>
              <span className="text-[20px] font-bold tracking-[-0.04em] text-[#07111f]">meetly</span>
            </div>
            <div className="hidden h-7 w-px bg-[#e8e9ed] lg:block" />
            <span className="hidden text-sm font-medium text-[#687083] lg:block">Workspace</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden rounded-full p-2.5 text-[#737b8c] transition hover:bg-[#f3f4f6] sm:block" aria-label="Help"><HelpCircle className="size-5" /></button>
            <button onClick={() => setSettingsOpen(true)} className="rounded-full p-2.5 text-[#737b8c] transition hover:bg-[#f3f4f6]" aria-label="Open settings"><Settings className="size-5" /></button>
            <div className="mx-1 hidden h-7 w-px bg-[#e8e9ed] sm:block" />
            <button className="flex items-center gap-2 rounded-full pl-1 pr-2 transition hover:bg-[#f5f5f6]" aria-label="Open profile menu">
              <span className="flex size-9 items-center justify-center rounded-full bg-[#f3d9d7] text-xs font-bold text-[#4f7cff]">{initials}</span>
              <span className="hidden text-sm font-semibold text-[#333946] md:block">{user.name}</span>
              <ChevronDown className="hidden size-4 text-[#89909d] md:block" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px]">
        <aside className={`${menuOpen ? "absolute inset-x-0 top-[72px] z-10 block bg-white shadow-lg" : "hidden"} w-full border-r border-[#e8e9ed] bg-white lg:relative lg:block lg:min-h-[calc(100vh-72px)] lg:w-[236px] lg:shrink-0 lg:bg-transparent lg:shadow-none`}>
          <nav className="flex flex-col gap-1 p-5 lg:sticky lg:top-[92px]">
            <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.13em] text-[#a0a6b2]">Main menu</p>
            {navItems.map(({ label, icon: Icon }) => (
              <button key={label} onClick={() => { setActiveNav(label); setMenuOpen(false) }} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${activeNav === label ? "bg-[#eaf0ff] text-[#4f7cff]" : "text-[#737b8c] hover:bg-[#f2f3f5] hover:text-[#333946]"}`}>
                <Icon className="size-[18px]" />{label}

              </button>
            ))}
            <div className="my-5 h-px bg-[#e8e9ed]" />
            <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.13em] text-[#a0a6b2]">Workspace</p>
            <button className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#737b8c] transition hover:bg-[#f2f3f5]"><Users className="size-[18px]" />Team members</button>
            <button className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#737b8c] transition hover:bg-[#f2f3f5]"><ShieldCheck className="size-[18px]" />Admin console</button>
            <div className="mt-auto pt-12">
              <div className="rounded-2xl bg-[#eef3ff] p-4">
                <div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-white text-[#4f7cff]"><Sparkles className="size-4" /></div>
                <p className="text-sm font-bold text-[#3d3031]">Make every meeting count.</p>
                <p className="mt-1 text-xs leading-5 text-[#8c7374]">Try smart notes on your next call.</p>
                <button className="mt-3 text-xs font-bold text-[#4f7cff]">Learn more <span aria-hidden="true">→</span></button>
              </div>
            </div>
          </nav>
        </aside>

        <section className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-11">
          <div className="mx-auto max-w-[1080px]">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 text-sm font-medium text-[#9399a5]">{new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(new Date())}</p>
                <h1 className="text-[30px] font-bold tracking-[-0.045em] text-[#242832] sm:text-[36px]">Welcome back, {user.name.split(" ")[0]} <span aria-hidden="true">✦</span></h1>
                <p className="mt-2 text-sm text-[#7b8391]">Ready to connect with your team?</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setJoinOpen(true)} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#dfe1e6] bg-white px-4 text-sm font-bold text-[#3b4250] shadow-sm transition hover:border-[#c7cbd3] hover:bg-[#fafafa]"><Link2 className="size-4" />Join meeting</button>
                <button onClick={() => setCreateOpen(true)} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#4f7cff] px-4 text-sm font-bold text-white shadow-[0_5px_14px_rgba(143,29,44,0.2)] transition hover:bg-[#791725]"><Plus className="size-4" />New meeting</button>
              </div>
            </div>

            <div className="mt-9 rounded-2xl bg-[#4f7cff] p-7 text-white shadow-[0_12px_30px_rgba(143,29,44,0.14)] sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#f6cacc]">Your meeting room</p>
              <h2 className="mt-3 text-2xl font-bold tracking-[-0.035em]">Start a video call in seconds</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#f5dfe0]">Create a private room, copy the link, and invite anyone to join. No account is needed for guests.</p>
              <div className="mt-6 flex flex-wrap gap-3"><button onClick={startInstantMeeting} disabled={creating} className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#4f7cff] transition hover:bg-[#fff3f3] disabled:opacity-60"><Video className="mr-2 inline size-4" />{creating ? "Creating room…" : "Start instant meeting"}</button><button onClick={() => setJoinOpen(true)} className="rounded-xl border border-white/30 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"><Link2 className="mr-2 inline size-4" />Join with code</button></div>
            </div>

            <div className="mt-10 flex items-center justify-between"><div><h2 className="text-lg font-bold tracking-[-0.02em] text-[#2c323c]">Upcoming meetings</h2><p className="mt-1 text-sm text-[#9299a5]">Your schedule for the next few days</p></div><button className="hidden text-sm font-bold text-[#4f7cff] sm:block">View calendar <span aria-hidden="true">→</span></button></div>
            <div className="mt-5 grid gap-3">
              {meetings.map((meeting) => <div key={meeting.id} className="group flex flex-col gap-4 rounded-2xl border border-[#e8e9ed] bg-white p-5 shadow-sm transition hover:border-[#d9c1c3] hover:shadow-md sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-center gap-4"><div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${meeting.id % 3 === 0 ? "bg-[#f9e3e4] text-[#a52a38]" : meeting.id % 3 === 1 ? "bg-[#e7eff9] text-[#4773a8]" : "bg-[#eee8f9] text-[#7857a4]"}`}><Video className="size-5" /></div><div className="min-w-0"><h3 className="truncate text-sm font-bold text-[#343a46]">{meeting.title}</h3><p className="mt-1 text-xs text-[#9299a5]">{meeting.meetingDate} · {meeting.meetingTime} <span className="mx-1">·</span> {meeting.attendees} attendees</p></div></div><div className="flex items-center gap-4 pl-[60px] sm:pl-0"><span className="hidden text-xs font-medium text-[#a0a6b2] md:block">{meeting.code}</span><button onClick={() => copyLink(meeting.code)} className="flex h-9 items-center gap-2 rounded-lg border border-[#e3e5e9] px-3 text-xs font-bold text-[#687083] transition hover:border-[#c9cdd5] hover:text-[#4f7cff]"><Copy className="size-3.5" />Copy link</button><button className="rounded-lg p-2 text-[#9ca2ad] transition hover:bg-[#f4f4f5] hover:text-[#525966]" aria-label={`More options for ${meeting.title}`}><MoreHorizontal className="size-4" /></button></div></div>)}
            </div>

            <div className="mt-10 rounded-2xl border border-[#e8e9ed] bg-white p-6 shadow-sm"><p className="text-sm font-bold text-[#3a414d]">Meeting links are ready when you are</p><p className="mt-2 text-sm leading-6 text-[#808896]">Your rooms are saved here after creation. Share a link from the meeting list or start another instant call.</p></div>
          </div>
        </section>
      </div>

      {createOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2937]/40 p-5" role="dialog" aria-modal="true" aria-labelledby="create-title"><form onSubmit={handleCreateMeeting} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between"><div><h2 id="create-title" className="text-xl font-bold text-[#2d333d]">New meeting</h2><p className="mt-1 text-sm text-[#8a919e]">Create a room and invite your team.</p></div><button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg p-2 text-[#9299a5] hover:bg-[#f3f4f5]" aria-label="Close dialog"><X className="size-5" /></button></div><label htmlFor="meeting-title" className="mt-7 block text-xs font-bold text-[#596170]">Meeting title <span className="font-normal text-[#9ca2ad]">(optional)</span></label><input id="meeting-title" value={meetingTitle} onChange={(event) => setMeetingTitle(event.target.value)} placeholder="Weekly team sync" className="mt-2 h-12 w-full rounded-xl border border-[#dfe1e6] px-4 text-sm outline-none focus:border-[#4f7cff]" /><p className="mt-3 text-xs leading-5 text-[#8a919e]">The room is created immediately. You can share its link once you enter.</p>{formError && <p className="mt-3 text-sm text-[#a52a38]" role="alert">{formError}</p>}<button disabled={creating} className="mt-5 h-12 w-full rounded-xl bg-[#4f7cff] text-sm font-bold text-white disabled:opacity-50">{creating ? "Creating…" : "Create meeting"}</button></form></div>}

      {joinOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2937]/40 p-5" role="dialog" aria-modal="true" aria-labelledby="join-title"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between"><div><h2 id="join-title" className="text-xl font-bold text-[#2d333d]">Join a meeting</h2><p className="mt-1 text-sm text-[#8a919e]">Enter the meeting code shared by your host.</p></div><button onClick={() => setJoinOpen(false)} className="rounded-lg p-2 text-[#9299a5] hover:bg-[#f3f4f5]" aria-label="Close dialog"><X className="size-5" /></button></div><label htmlFor="meeting-code" className="mt-7 block text-xs font-bold text-[#596170]">Meeting code</label><input id="meeting-code" autoFocus value={joinCode} onChange={(event) => setJoinCode(event.target.value)} placeholder="xxx-xxxx-xxx" className="mt-2 h-12 w-full rounded-xl border border-[#dfe1e6] px-4 text-sm font-medium outline-none transition focus:border-[#4f7cff] focus:ring-2 focus:ring-[#4f7cff]/10" /><button onClick={() => openMeeting(joinCode.trim())} disabled={!joinCode.trim()} className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-[#4f7cff] text-sm font-bold text-white transition hover:bg-[#791725] disabled:cursor-not-allowed disabled:opacity-50">Continue to preview</button><p className="mt-4 text-center text-xs text-[#9ca2ad]">You can also paste a full Meetly link.</p></div></div>}

      {settingsOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2937]/40 p-5" role="dialog" aria-modal="true" aria-labelledby="settings-title"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between"><div><h2 id="settings-title" className="text-xl font-bold text-[#2d333d]">Settings</h2><p className="mt-1 text-sm text-[#8a919e]">Manage your Meetly workspace session.</p></div><button onClick={() => setSettingsOpen(false)} className="rounded-lg p-2 text-[#9299a5] hover:bg-[#f3f4f5]" aria-label="Close settings"><X className="size-5" /></button></div><div className="mt-6 rounded-xl border border-[#e8e9ed] p-4"><p className="text-sm font-bold text-[#343a46]">Signed in as</p><p className="mt-1 text-sm text-[#7b8391]">{user.email}</p></div><button onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => { router.push("/sign-in"); router.refresh() } } })} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#fff1f2] text-sm font-bold text-[#a52a38] transition hover:bg-[#ffe4e6]"><LogOut className="size-4" />Sign out</button></div></div>}
      <div className="fixed bottom-5 right-5 hidden items-center gap-2 rounded-full border border-[#e8e9ed] bg-white px-3 py-2 text-xs font-semibold text-[#7d8592] shadow-lg sm:flex"><span className="size-2 rounded-full bg-[#4d9273]" />All systems operational</div>
      <div className="sr-only"><button onClick={() => setMicOn(!micOn)}>{micOn ? <Mic /> : <MicOff />}</button><button onClick={() => setCameraOn(!cameraOn)}>{cameraOn ? <Video /> : <VideoOff />}</button><Grid2X2 /><Headphones /><Search /></div>
    </main>
  )
}
