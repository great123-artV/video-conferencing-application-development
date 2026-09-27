"use client"

import "@livekit/components-styles"

import { useEffect, useState } from "react"
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

  return <LiveKitRoom token={token} serverUrl={serverUrl} connect audio video className="min-h-screen bg-[#17181c] text-white"><RoomAudioRenderer /><MeetingGrid /><ControlBar /></LiveKitRoom>
}

function MeetingGrid() {
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }])
  return <GridLayout tracks={tracks} className="min-h-[calc(100vh-72px)] p-4"><ParticipantTile /></GridLayout>
}
