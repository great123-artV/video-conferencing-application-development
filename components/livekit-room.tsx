"use client"

import "@livekit/components-styles"

import { useEffect, useMemo, useState } from "react"
import { Copy, Link2, Share2, X } from "lucide-react"
import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
} from "@livekit/components-react"
import { Track } from "livekit-client"

export default function LiveKitRoomView({ roomName, userName }: { roomName: string; userName: string }) {
  const [token, setToken] = useState<string>()
  const [serverUrl, setServerUrl] = useState<string>()
  const [error, setError] = useState<string>()
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const meetingLink = useMemo(() => {
    if (typeof window === "undefined") return ""
    return `${window.location.origin}/meeting/${encodeURIComponent(roomName)}`
  }, [roomName])

  async function copyMeetingLink() {
    if (!meetingLink) return
    await navigator.clipboard.writeText(meetingLink)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  async function shareMeetingLink() {
    if (!meetingLink) return
    if (navigator.share) {
      await navigator.share({ title: "Join my Meetly meeting", text: "Join my video meeting", url: meetingLink })
    } else {
      await copyMeetingLink()
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    setToken(undefined)
    setServerUrl(undefined)
    setError(undefined)

    fetch("/api/livekit/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName }),
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.error || "Unable to join meeting")
        if (typeof data.token !== "string" || typeof data.url !== "string") throw new Error("Invalid video service response")
        setToken(data.token)
        setServerUrl(data.url)
      })
      .catch((reason) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return
        setError(reason instanceof Error ? reason.message : "Unable to join meeting")
      })

    return () => controller.abort()
  }, [roomName])

  if (error) return <div className="flex min-h-screen items-center justify-center bg-[#17181c] p-6 text-center text-white"><div><h1 className="text-xl font-bold">Unable to join meeting</h1><p className="mt-2 text-sm text-white/60">{error}</p><a className="mt-6 inline-block rounded-lg bg-[#8f1d2c] px-4 py-2 text-sm font-semibold" href="/">Return to dashboard</a></div></div>
  if (!token || !serverUrl) return <div className="flex min-h-screen items-center justify-center bg-[#17181c] text-sm text-white/70">Connecting to {userName}&apos;s meeting…</div>

  return (
    <LiveKitRoom token={token} serverUrl={serverUrl} connect audio video className="min-h-screen bg-[#17181c] text-white">
      <RoomAudioRenderer />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-4 sm:p-6">
        <div className="pointer-events-auto rounded-2xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">Meetly room</p>
          <p className="mt-1 max-w-[180px] truncate text-sm font-semibold text-white">{roomName}</p>
        </div>
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="pointer-events-auto flex items-center gap-2 rounded-xl border border-white/15 bg-white px-4 py-3 text-sm font-bold text-[#25272d] shadow-lg transition hover:bg-white/90"
        >
          <Share2 className="size-4" />
          Invite people
        </button>
      </div>
      <MeetingGrid />
      <ControlBar />
      {shareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="share-meeting-title">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#23252b] p-6 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-[#f3d9d7] text-[#8f1d2c]"><Link2 className="size-5" /></div>
                <h2 id="share-meeting-title" className="text-xl font-bold tracking-tight">Invite people to join</h2>
                <p className="mt-1 text-sm leading-6 text-white/60">Anyone with this link can join your meeting. Share it while the call is in progress.</p>
              </div>
              <button type="button" onClick={() => setShareOpen(false)} className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white" aria-label="Close invite dialog"><X className="size-5" /></button>
            </div>
            <label htmlFor="meeting-share-link" className="mt-6 block text-xs font-bold uppercase tracking-[0.12em] text-white/45">Meeting link</label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 p-2">
              <input id="meeting-share-link" readOnly value={meetingLink} className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white/80 outline-none" />
              <button type="button" onClick={copyMeetingLink} className="flex shrink-0 items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#25272d] transition hover:bg-white/90"><Copy className="size-3.5" />{copied ? "Copied" : "Copy link"}</button>
            </div>
            <button type="button" onClick={shareMeetingLink} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#8f1d2c] text-sm font-bold text-white transition hover:bg-[#a9283a]"><Share2 className="size-4" />Share invite</button>
            <p className="mt-4 text-center text-xs text-white/40">Keep this window open to copy the link again anytime.</p>
          </div>
        </div>
      )}
    </LiveKitRoom>
  )
}

function MeetingGrid() {
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }])
  return <GridLayout tracks={tracks} className="min-h-[calc(100vh-72px)] p-4"><ParticipantTile /></GridLayout>
}
