"use client"

import "@livekit/components-styles"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Copy, Hand, ImagePlus, LayoutGrid, Maximize, MessageCircle, MoreHorizontal, Send, Share2, Smile, Users, X } from "lucide-react"
import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useLocalParticipant,
  useRoomContext,
  useTracks,
} from "@livekit/components-react"
import { ConnectionQuality, RoomEvent, Track } from "livekit-client"

const TOPIC = "meetly-collaboration"
const REACTION_GROUPS = [
  { label: "Popular", emojis: ["❤️", "😂", "👏", "👍", "🎉", "😮", "😢", "🔥", "✋", "💯", "🙌", "✨"] },
  { label: "Faces", emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😊", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😎", "🤔", "😴", "😭", "😡", "🤯", "🥳"] },
  { label: "Gestures", emojis: ["👋", "🤝", "👏", "🙌", "👐", "🤲", "🙏", "💪", "🤞", "✌️", "🤟", "👌", "👀", "💅"] },
  { label: "Objects", emojis: ["🎉", "🎊", "🎁", "🎈", "⭐", "🌟", "💡", "✅", "❌", "❤️", "💜", "💙", "🧡", "💚", "🔥", "🚀"] },
]
const REACTIONS = REACTION_GROUPS.flatMap((group) => group.emojis)
type Signal = { type: "hand" | "reaction" | "chat" | "slide"; identity: string; name: string; active?: boolean; emoji?: string; text?: string; pathname?: string; fileName?: string; sentAt: number }
type PeerState = { identity: string; name: string; hand: boolean; reaction?: string; reactionAt?: number }

export default function LiveKitRoomView({ roomName, userName }: { roomName: string; userName: string }) {
  const [token, setToken] = useState<string>()
  const [serverUrl, setServerUrl] = useState<string>()
  const [error, setError] = useState<string>()
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const meetingLink = useMemo(() => typeof window === "undefined" ? "" : `${window.location.origin}/meeting/${encodeURIComponent(roomName)}`, [roomName])

  useEffect(() => {
    const controller = new AbortController()
    setToken(undefined); setServerUrl(undefined); setError(undefined)
    fetch("/api/livekit/token", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ roomName }), signal: controller.signal, cache: "no-store" })
      .then(async (response) => { const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || "Unable to join meeting"); if (typeof data.token !== "string" || typeof data.url !== "string") throw new Error("Invalid video service response"); setToken(data.token); setServerUrl(data.url) })
      .catch((reason) => { if (reason instanceof DOMException && reason.name === "AbortError") return; setError(reason instanceof Error ? reason.message : "Unable to join meeting") })
    return () => controller.abort()
  }, [roomName])

  async function copyMeetingLink() { if (!meetingLink) return; await navigator.clipboard.writeText(meetingLink); setCopied(true); window.setTimeout(() => setCopied(false), 1800) }
  async function shareMeetingLink() { if (!meetingLink) return; if (navigator.share) await navigator.share({ title: "Join my Meetly meeting", text: "You are invited to join my video meeting.", url: meetingLink }); else await copyMeetingLink() }

  if (error) return <div className="flex min-h-screen items-center justify-center bg-[#0d1b2a] p-6 text-center text-white"><div><h1 className="text-xl font-bold">Unable to join meeting</h1><p className="mt-2 text-sm text-white/60">{error}</p><a className="mt-6 inline-block rounded-lg bg-[#4f7cff] px-4 py-2 text-sm font-semibold" href="/">Return to dashboard</a></div></div>
  if (!token || !serverUrl) return <div className="flex min-h-screen items-center justify-center bg-[#0d1b2a] text-sm text-white/70">Connecting to {userName}&apos;s meeting…</div>

  return <LiveKitRoom token={token} serverUrl={serverUrl} connect audio video className="min-h-screen bg-[#07111f] text-white"><RoomAudioRenderer /><MeetingExperience roomName={roomName} userName={userName} meetingLink={meetingLink} onInvite={() => setShareOpen(true)} /><InviteDialog open={shareOpen} onClose={() => setShareOpen(false)} meetingLink={meetingLink} copied={copied} onCopy={copyMeetingLink} onShare={shareMeetingLink} /></LiveKitRoom>
}

function MeetingExperience({ roomName, userName, meetingLink, onInvite }: { roomName: string; userName: string; meetingLink: string; onInvite: () => void }) {
  const room = useRoomContext()
  const { localParticipant } = useLocalParticipant()
  const [handRaised, setHandRaised] = useState(false)
  const [layout, setLayout] = useState<"grid" | "speaker">("grid")
  const [panel, setPanel] = useState<"people" | "chat" | null>(null)
  const [peers, setPeers] = useState<Record<string, PeerState>>({})
  const [reaction, setReaction] = useState<string>()
  const [reactionPickerOpen, setReactionPickerOpen] = useState(false)
  const [chat, setChat] = useState("")
  const [messages, setMessages] = useState<{ name: string; text: string; at: number }[]>([])
  const [flash, setFlash] = useState<{ emoji: string; name: string }>()
  const [slides, setSlides] = useState<{ pathname: string; name: string; by: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const [slideError, setSlideError] = useState<string>()
  const slideInputRef = useRef<HTMLInputElement>(null)

  const identity = localParticipant.identity
  const send = useCallback((signal: Signal) => { void room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify(signal)) as Uint8Array<ArrayBuffer>, { reliable: true, topic: TOPIC }) }, [room])
  useEffect(() => {
    const onData = (payload: Uint8Array, participant?: { identity?: string; name?: string }) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(payload)) as Signal & { text?: string }
        if (data.type === "hand" || data.type === "reaction") {
          const id = data.identity || participant?.identity || "unknown"
          setPeers((current) => ({ ...current, [id]: { identity: id, name: data.name || participant?.name || id, hand: data.type === "hand" ? Boolean(data.active) : current[id]?.hand || false, reaction: data.type === "reaction" ? data.emoji : current[id]?.reaction, reactionAt: data.type === "reaction" ? data.sentAt : current[id]?.reactionAt } }))
          if (data.type === "reaction" && data.emoji) { setFlash({ emoji: data.emoji, name: data.name }); window.setTimeout(() => setFlash(undefined), 2200) }
        }
        if (data.type === "chat" && data.text) setMessages((current) => [...current.slice(-99), { name: data.name, text: data.text!, at: data.sentAt }])
        if (data.type === "slide" && data.pathname) setSlides((current) => [...current.slice(-19), { pathname: data.pathname!, name: data.fileName || "Shared slide", by: data.name }])
      } catch { /* Ignore malformed data from other clients. */ }
    }
    room.on(RoomEvent.DataReceived, onData)
    return () => { room.off(RoomEvent.DataReceived, onData) }
  }, [room])

  function toggleHand() { const next = !handRaised; setHandRaised(next); send({ type: "hand", identity, name: localParticipant.name || userName, active: next, sentAt: Date.now() }) }
  function sendReaction(emoji: string) { setReaction(emoji); setFlash({ emoji, name: "You" }); send({ type: "reaction", identity, name: localParticipant.name || userName, emoji, sentAt: Date.now() }); window.setTimeout(() => setReaction(undefined), 2500) }
  function sendChat() { const text = chat.trim(); if (!text) return; setMessages((current) => [...current, { name: "You", text, at: Date.now() }]); send({ type: "chat", identity, name: localParticipant.name || userName, sentAt: Date.now(), text } as Signal); setChat("") }
  async function uploadSlide(file: File) {
    setUploading(true)
    try {
      const body = new FormData()
      body.append("file", file)
      body.append("roomName", roomName)
      const response = await fetch("/api/meeting-files", { method: "POST", body })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Unable to share image")
      const slide = { pathname: data.pathname as string, name: data.name as string, by: localParticipant.name || userName }
      setSlides((current) => [...current, slide])
      send({ type: "slide", identity, name: slide.by, pathname: slide.pathname, fileName: slide.name, sentAt: Date.now() })
    } catch (reason) { setSlideError(reason instanceof Error ? reason.message : "Unable to share image") } finally { setUploading(false); if (slideInputRef.current) slideInputRef.current.value = "" }
  }
  function fullscreen() { void document.documentElement.requestFullscreen?.() }
  const raised = Object.values(peers).filter((peer) => peer.hand)

  return <div className="relative flex min-h-screen flex-col bg-[#07111f]">
    <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Meetly room</p><p className="truncate text-sm font-semibold">{roomName}</p></div><div className="flex items-center gap-2"><span className="hidden text-xs text-white/50 sm:inline">{raised.length ? `${raised.length} hand${raised.length === 1 ? "" : "s"} raised` : "Secure meeting"}</span><button type="button" onClick={onInvite} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-[#25272d]"><Share2 className="size-4" />Invite</button></div></header>
    <div className="flex min-h-0 flex-1"><main className="relative min-w-0 flex-1"><MeetingGrid layout={layout} />{slides.length > 0 && <div className="absolute inset-x-4 top-4 z-20 overflow-hidden rounded-2xl border border-white/15 bg-black/50 shadow-2xl backdrop-blur"><div className="flex items-center justify-between border-b border-white/10 px-4 py-2"><p className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Shared slides</p><span className="text-xs text-white/50">{slides.length} image{slides.length === 1 ? "" : "s"}</span></div><div className="flex snap-x gap-3 overflow-x-auto p-3">{slides.map((slide, index) => <figure key={`${slide.pathname}-${index}`} className="relative min-w-[min(78vw,34rem)] snap-center overflow-hidden rounded-xl bg-black/30"><img src={`/api/meeting-files/file?pathname=${encodeURIComponent(slide.pathname)}`} alt={slide.name} className="max-h-[min(48vh,28rem)] w-full object-contain" /><figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-8 text-xs text-white">{slide.name} · {slide.by}</figcaption></figure>)}</div></div>}<div className="pointer-events-none absolute inset-x-0 bottom-28 flex justify-center">{flash && <div className="reaction-float rounded-full border border-white/15 bg-black/70 px-4 py-2 text-sm shadow-xl backdrop-blur"><span className="mr-2 text-xl">{flash.emoji}</span>{flash.name}</div>}</div></main>
      {panel && <aside className="fixed inset-y-0 right-0 z-30 flex w-full max-w-sm flex-col border-l border-white/10 bg-[#13263a] shadow-2xl sm:relative sm:w-80"><div className="flex items-center justify-between border-b border-white/10 p-4"><h2 className="font-bold">{panel === "people" ? `People (${room.remoteParticipants.size + 1})` : "Meeting chat"}</h2><button onClick={() => setPanel(null)} aria-label="Close panel" className="rounded-lg p-2 text-white/60 hover:bg-white/10"><X className="size-5" /></button></div>{panel === "people" ? <div className="flex flex-col gap-2 overflow-y-auto p-4"><Person name={localParticipant.name || userName} hand={handRaised} local quality={localParticipant.connectionQuality} />{Array.from(room.remoteParticipants.values()).map((participant) => <Person key={participant.identity} name={participant.name || participant.identity} hand={peers[participant.identity]?.hand} quality={participant.connectionQuality} />)}</div> : <div className="flex min-h-0 flex-1 flex-col"><div className="flex-1 space-y-3 overflow-y-auto p-4">{messages.map((message, index) => <div key={`${message.at}-${index}`}><p className="text-xs font-bold text-white/50">{message.name} <span className="font-normal">{new Date(message.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span></p><p className="mt-1 break-words rounded-xl bg-white/10 px-3 py-2 text-sm">{message.text}</p></div>)}</div><div className="flex gap-2 border-t border-white/10 p-3"><input value={chat} onChange={(event) => setChat(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.nativeEvent.isComposing && event.keyCode !== 229) sendChat() }} placeholder="Message everyone" aria-label="Meeting message" className="min-w-0 flex-1 rounded-xl bg-white/10 px-3 py-2 text-sm outline-none" /><button onClick={sendChat} aria-label="Send message" className="rounded-xl bg-[#4f7cff] p-2"><Send className="size-4" /></button></div></div>}</aside>}
    </div>
    <div className="border-t border-white/10 bg-[#0d1b2a] px-3 pt-3"><ControlBar controls={{ microphone: true, camera: true, screenShare: true, chat: false, leave: false }} /></div>
    {slideError && <div role="alert" className="border-t border-red-400/20 bg-red-950/40 px-4 py-2 text-center text-xs text-red-200">{slideError}<button onClick={() => setSlideError(undefined)} className="ml-2 underline">Dismiss</button></div>}<footer className="relative flex flex-wrap items-center justify-center gap-2 border-t border-white/10 bg-[#0d1b2a] p-3"><button onClick={toggleHand} className={`meeting-control ${handRaised ? "meeting-control-active" : ""}`} aria-label={handRaised ? "Lower hand" : "Raise hand"}><Hand className="size-4" />{handRaised ? "Lower hand" : "Raise hand"}</button><div className="relative"><button onClick={() => setReactionPickerOpen((open) => !open)} className="meeting-control" aria-label="Open emoji reactions" aria-expanded={reactionPickerOpen}><Smile className="size-4" />Reactions</button>{reactionPickerOpen && <div className="absolute bottom-14 left-1/2 z-40 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#24262c] p-4 text-left shadow-2xl"><div className="mb-3 flex items-center justify-between"><p className="text-sm font-bold">Send a reaction</p><button onClick={() => setReactionPickerOpen(false)} aria-label="Close reactions" className="rounded-lg p-1 text-white/50 hover:bg-white/10"><X className="size-4" /></button></div>{REACTION_GROUPS.map((group) => <section key={group.label} className="mb-3 last:mb-0"><p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">{group.label}</p><div className="grid grid-cols-8 gap-1">{group.emojis.map((emoji) => <button key={emoji} onClick={() => { sendReaction(emoji); setReactionPickerOpen(false) }} className="flex size-9 items-center justify-center rounded-lg text-xl transition hover:bg-white/10 hover:scale-110" aria-label={`Send ${emoji} reaction`}>{emoji}</button>)}</div></section>)}</div>}</div><input ref={slideInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadSlide(file) }} /><button onClick={() => slideInputRef.current?.click()} disabled={uploading} className="meeting-control" aria-label="Share images as slides"><ImagePlus className="size-4" />{uploading ? "Uploading" : "Slides"}</button><button onClick={() => setPanel(panel === "people" ? null : "people")} className="meeting-control" aria-label="Open participants"><Users className="size-4" />People</button><button onClick={() => setPanel(panel === "chat" ? null : "chat")} className="meeting-control" aria-label="Open chat"><MessageCircle className="size-4" />Chat{messages.length > 0 && <span className="rounded-full bg-[#4f7cff] px-1.5 text-[10px]">{messages.length}</span>}</button><button onClick={() => setLayout(layout === "grid" ? "speaker" : "grid")} className="meeting-control" aria-label="Change layout"><LayoutGrid className="size-4" />{layout === "grid" ? "Speaker" : "Grid"}</button><button onClick={fullscreen} className="meeting-control" aria-label="Enter fullscreen"><Maximize className="size-4" />Full screen</button><button onClick={onInvite} className="meeting-control" aria-label="Invite people"><Copy className="size-4" />Copy link</button><button onClick={() => room.disconnect()} className="meeting-control bg-[#a52a38] hover:bg-[#bd3545]" aria-label="Leave meeting">Leave</button></footer>
    {reaction && <div className="pointer-events-none fixed bottom-24 left-5 text-3xl">{reaction}</div>}
  </div>
}

function MeetingGrid({ layout }: { layout: "grid" | "speaker" }) { const tracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }, { source: Track.Source.Camera, withPlaceholder: true }]); const hasScreenShare = tracks.some((track) => track.source === Track.Source.ScreenShare && Boolean(track.publication)); return <div className={layout === "speaker" ? "min-h-[calc(100vh-140px)] p-4" : "min-h-[calc(100vh-140px)] p-4"}><div className={hasScreenShare ? "h-full rounded-2xl border border-[#4f7cff]/40 bg-black/20 p-2" : "h-full"}><GridLayout tracks={tracks} className="h-full"><ParticipantTile /></GridLayout></div></div> }
function Person({ name, hand, local, quality }: { name: string; hand?: boolean; local?: boolean; quality: ConnectionQuality }) { const qualityLabel = quality === ConnectionQuality.Excellent ? "Excellent" : quality === ConnectionQuality.Good ? "Good" : quality === ConnectionQuality.Poor ? "Poor" : "Checking"; return <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3"><span className="flex size-9 items-center justify-center rounded-full bg-[#f3d9d7] text-xs font-bold text-[#4f7cff]">{name.slice(0, 2).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{name}{local ? " (You)" : ""}</p><p className="text-xs text-white/45"><span className={quality === ConnectionQuality.Excellent ? "text-emerald-400" : "text-amber-400"}>●</span> {qualityLabel}{hand ? " · Hand raised" : ""}</p></div>{hand && <span className="text-lg" aria-label="Hand raised">✋</span>}</div> }

function InviteDialog({ open, onClose, meetingLink, copied, onCopy, onShare }: { open: boolean; onClose: () => void; meetingLink: string; copied: boolean; onCopy: () => void; onShare: () => void }) { if (!open) return null; return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="share-meeting-title"><div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#23252b] p-6 text-white shadow-2xl"><div className="flex items-start justify-between gap-4"><div><div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-[#f3d9d7] text-[#4f7cff]"><Share2 className="size-5" /></div><h2 id="share-meeting-title" className="text-xl font-bold">Invite people to join</h2><p className="mt-1 text-sm leading-6 text-white/60">Share this secure meeting link while the call is in progress.</p></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-white/50 hover:bg-white/10" aria-label="Close invite dialog"><X className="size-5" /></button></div><div className="mt-6 flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 p-2"><input readOnly value={meetingLink} aria-label="Meeting link" className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white/80 outline-none" /><button type="button" onClick={onCopy} className="flex shrink-0 items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#25272d]"><Copy className="size-3.5" />{copied ? "Copied" : "Copy link"}</button></div><button type="button" onClick={onShare} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#4f7cff] text-sm font-bold"><Share2 className="size-4" />Share invite</button></div></div> }
