"use client"

import { useMemo, useState } from "react"
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

const meetings = [
  { title: "Weekly design critique", date: "Today", time: "10:00 AM", code: "bqz-hxkp-nrm", attendees: 8, tone: "red" },
  { title: "Product planning sync", date: "Tomorrow", time: "2:30 PM", code: "jkm-ptsr-vfd", attendees: 5, tone: "blue" },
  { title: "Onboarding · Jordan Lee", date: "Thu, Oct 3", time: "9:00 AM", code: "mno-wxyz-abc", attendees: 2, tone: "purple" },
]

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "My meetings", icon: CalendarDays },
  { label: "History", icon: History },
]

export default function Page() {
  const [activeNav, setActiveNav] = useState("Overview")
  const [joinOpen, setJoinOpen] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const initials = useMemo(() => "AM", [])

  function copyLink(code: string) {
    navigator.clipboard?.writeText(`meetly.app/${code}`)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#1f2937]">
      <header className="sticky top-0 z-20 border-b border-[#e8e9ed] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-8">
            <button className="lg:hidden" aria-label="Open navigation" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X /> : <Menu />}
            </button>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#8f1d2c] text-white shadow-sm">
                <Video className="size-5" strokeWidth={2.5} />
              </div>
              <span className="text-[20px] font-bold tracking-[-0.04em] text-[#20232a]">meetly</span>
            </div>
            <div className="hidden h-7 w-px bg-[#e8e9ed] lg:block" />
            <span className="hidden text-sm font-medium text-[#687083] lg:block">Workspace</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden rounded-full p-2.5 text-[#737b8c] transition hover:bg-[#f3f4f6] sm:block" aria-label="Help"><HelpCircle className="size-5" /></button>
            <button className="hidden rounded-full p-2.5 text-[#737b8c] transition hover:bg-[#f3f4f6] sm:block" aria-label="Settings"><Settings className="size-5" /></button>
            <div className="mx-1 hidden h-7 w-px bg-[#e8e9ed] sm:block" />
            <button className="flex items-center gap-2 rounded-full pl-1 pr-2 transition hover:bg-[#f5f5f6]" aria-label="Open profile menu">
              <span className="flex size-9 items-center justify-center rounded-full bg-[#f3d9d7] text-xs font-bold text-[#8f1d2c]">{initials}</span>
              <span className="hidden text-sm font-semibold text-[#333946] md:block">Alex Morgan</span>
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
              <button key={label} onClick={() => { setActiveNav(label); setMenuOpen(false) }} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${activeNav === label ? "bg-[#f9e7e7] text-[#8f1d2c]" : "text-[#737b8c] hover:bg-[#f2f3f5] hover:text-[#333946]"}`}>
                <Icon className="size-[18px]" />{label}
                {label === "My meetings" && <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[11px] text-[#8f1d2c] shadow-sm">3</span>}
              </button>
            ))}
            <div className="my-5 h-px bg-[#e8e9ed]" />
            <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.13em] text-[#a0a6b2]">Workspace</p>
            <button className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#737b8c] transition hover:bg-[#f2f3f5]"><Users className="size-[18px]" />Team members</button>
            <button className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#737b8c] transition hover:bg-[#f2f3f5]"><ShieldCheck className="size-[18px]" />Admin console</button>
            <div className="mt-auto pt-12">
              <div className="rounded-2xl bg-[#fff5f3] p-4">
                <div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-white text-[#8f1d2c]"><Sparkles className="size-4" /></div>
                <p className="text-sm font-bold text-[#3d3031]">Make every meeting count.</p>
                <p className="mt-1 text-xs leading-5 text-[#8c7374]">Try smart notes on your next call.</p>
                <button className="mt-3 text-xs font-bold text-[#8f1d2c]">Learn more <span aria-hidden="true">→</span></button>
              </div>
              <button className="mt-6 flex items-center gap-3 px-3 text-sm font-semibold text-[#8b929e] hover:text-[#8f1d2c]"><LogOut className="size-[17px]" />Sign out</button>
            </div>
          </nav>
        </aside>

        <section className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-11">
          <div className="mx-auto max-w-[1080px]">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 text-sm font-medium text-[#9399a5]">Tuesday, October 1, 2024</p>
                <h1 className="text-[30px] font-bold tracking-[-0.045em] text-[#242832] sm:text-[36px]">Good morning, Alex <span aria-hidden="true">✦</span></h1>
                <p className="mt-2 text-sm text-[#7b8391]">Ready to connect with your team?</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setJoinOpen(true)} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#dfe1e6] bg-white px-4 text-sm font-bold text-[#3b4250] shadow-sm transition hover:border-[#c7cbd3] hover:bg-[#fafafa]"><Link2 className="size-4" />Join meeting</button>
                <button onClick={() => setJoinOpen(true)} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#8f1d2c] px-4 text-sm font-bold text-white shadow-[0_5px_14px_rgba(143,29,44,0.2)] transition hover:bg-[#791725]"><Plus className="size-4" />New meeting</button>
              </div>
            </div>

            <div className="mt-9 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
              <div className="relative overflow-hidden rounded-2xl bg-[#8f1d2c] p-7 text-white shadow-[0_12px_30px_rgba(143,29,44,0.14)] sm:p-8">
                <div className="relative z-10 max-w-[360px]">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#f6cacc]">Next up · In 24 minutes</p>
                  <h2 className="mt-4 text-2xl font-bold tracking-[-0.035em]">Weekly design critique</h2>
                  <div className="mt-3 flex items-center gap-2 text-sm text-[#f5dfe0]"><Clock3 className="size-4" />10:00 AM – 10:45 AM <span className="text-[#ddaeb2]">·</span> <Users className="size-4" />8 people</div>
                  <div className="mt-7 flex items-center gap-3"><button className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#8f1d2c] transition hover:bg-[#fff3f3]">Join now</button><button onClick={() => copyLink("bqz-hxkp-nrm")} className="rounded-xl border border-white/30 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10" aria-label="Copy meeting link"><Copy className="mr-2 inline size-4" />{copied ? "Copied" : "Copy link"}</button></div>
                </div>
                <div className="absolute -right-10 -top-12 size-56 rounded-full border-[24px] border-white/10" /><div className="absolute -bottom-24 right-20 size-64 rounded-full border-[28px] border-white/10" />
              </div>
              <div className="rounded-2xl border border-[#e8e9ed] bg-white p-7 shadow-sm sm:p-8">
                <div className="flex items-center justify-between"><p className="text-sm font-bold text-[#3a414d]">Quick start</p><Sparkles className="size-4 text-[#b67a80]" /></div>
                <p className="mt-3 text-sm leading-6 text-[#808896]">Start a meeting instantly or join one with a code.</p>
                <div className="mt-6 flex gap-2"><button onClick={() => setJoinOpen(true)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#f8e9e9] px-3 py-3 text-xs font-bold text-[#8f1d2c] transition hover:bg-[#f4dddd]"><Video className="size-4" />Start a call</button><button onClick={() => setJoinOpen(true)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#e8e9ed] px-3 py-3 text-xs font-bold text-[#596170] transition hover:bg-[#f7f7f8]"><Link2 className="size-4" />Use a code</button></div>
              </div>
            </div>

            <div className="mt-10 flex items-center justify-between"><div><h2 className="text-lg font-bold tracking-[-0.02em] text-[#2c323c]">Upcoming meetings</h2><p className="mt-1 text-sm text-[#9299a5]">Your schedule for the next few days</p></div><button className="hidden text-sm font-bold text-[#8f1d2c] sm:block">View calendar <span aria-hidden="true">→</span></button></div>
            <div className="mt-5 grid gap-3">
              {meetings.map((meeting) => <div key={meeting.code} className="group flex flex-col gap-4 rounded-2xl border border-[#e8e9ed] bg-white p-5 shadow-sm transition hover:border-[#d9c1c3] hover:shadow-md sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-center gap-4"><div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${meeting.tone === "red" ? "bg-[#f9e3e4] text-[#a52a38]" : meeting.tone === "blue" ? "bg-[#e7eff9] text-[#4773a8]" : "bg-[#eee8f9] text-[#7857a4]"}`}><Video className="size-5" /></div><div className="min-w-0"><h3 className="truncate text-sm font-bold text-[#343a46]">{meeting.title}</h3><p className="mt-1 text-xs text-[#9299a5]">{meeting.date} · {meeting.time} <span className="mx-1">·</span> {meeting.attendees} attendees</p></div></div><div className="flex items-center gap-4 pl-[60px] sm:pl-0"><span className="hidden text-xs font-medium text-[#a0a6b2] md:block">{meeting.code}</span><button onClick={() => copyLink(meeting.code)} className="flex h-9 items-center gap-2 rounded-lg border border-[#e3e5e9] px-3 text-xs font-bold text-[#687083] transition hover:border-[#c9cdd5] hover:text-[#8f1d2c]"><Copy className="size-3.5" />Copy link</button><button className="rounded-lg p-2 text-[#9ca2ad] transition hover:bg-[#f4f4f5] hover:text-[#525966]" aria-label={`More options for ${meeting.title}`}><MoreHorizontal className="size-4" /></button></div></div>)}
            </div>

            <div className="mt-10 flex items-center justify-between"><div><h2 className="text-lg font-bold tracking-[-0.02em] text-[#2c323c]">Your activity</h2><p className="mt-1 text-sm text-[#9299a5]">A snapshot of your workspace</p></div><button className="rounded-lg p-2 text-[#9ca2ad] hover:bg-white"><MoreHorizontal className="size-5" /></button></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-[#e8e9ed] bg-white p-5"><p className="text-xs font-semibold text-[#9299a5]">Meetings this month</p><p className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#2f3540]">18</p><p className="mt-1 text-xs font-semibold text-[#4d9273]">+12% from last month</p></div><div className="rounded-2xl border border-[#e8e9ed] bg-white p-5"><p className="text-xs font-semibold text-[#9299a5]">Hours in meetings</p><p className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#2f3540]">24.5</p><p className="mt-1 text-xs font-semibold text-[#9299a5]">Across 18 meetings</p></div><div className="rounded-2xl border border-[#e8e9ed] bg-white p-5"><p className="text-xs font-semibold text-[#9299a5]">People met</p><p className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#2f3540]">42</p><p className="mt-1 text-xs font-semibold text-[#4d9273]">+8 new connections</p></div></div>
          </div>
        </section>
      </div>

      {joinOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2937]/40 p-5" role="dialog" aria-modal="true" aria-labelledby="join-title"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between"><div><h2 id="join-title" className="text-xl font-bold text-[#2d333d]">Join a meeting</h2><p className="mt-1 text-sm text-[#8a919e]">Enter the meeting code shared by your host.</p></div><button onClick={() => setJoinOpen(false)} className="rounded-lg p-2 text-[#9299a5] hover:bg-[#f3f4f5]" aria-label="Close dialog"><X className="size-5" /></button></div><label htmlFor="meeting-code" className="mt-7 block text-xs font-bold text-[#596170]">Meeting code</label><input id="meeting-code" autoFocus value={joinCode} onChange={(event) => setJoinCode(event.target.value)} placeholder="xxx-xxxx-xxx" className="mt-2 h-12 w-full rounded-xl border border-[#dfe1e6] px-4 text-sm font-medium outline-none transition focus:border-[#8f1d2c] focus:ring-2 focus:ring-[#8f1d2c]/10" /><button disabled={!joinCode.trim()} className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-[#8f1d2c] text-sm font-bold text-white transition hover:bg-[#791725] disabled:cursor-not-allowed disabled:opacity-50">Continue to preview</button><p className="mt-4 text-center text-xs text-[#9ca2ad]">You can also paste a full Meetly link.</p></div></div>}

      <div className="fixed bottom-5 right-5 hidden items-center gap-2 rounded-full border border-[#e8e9ed] bg-white px-3 py-2 text-xs font-semibold text-[#7d8592] shadow-lg sm:flex"><span className="size-2 rounded-full bg-[#4d9273]" />All systems operational</div>
      <div className="sr-only"><button onClick={() => setMicOn(!micOn)}>{micOn ? <Mic /> : <MicOff />}</button><button onClick={() => setCameraOn(!cameraOn)}>{cameraOn ? <Video /> : <VideoOff />}</button><Grid2X2 /><Headphones /><Search /></div>
    </main>
  )
}
