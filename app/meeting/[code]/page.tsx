import { headers } from "next/headers"
import { notFound } from "next/navigation"

import LiveKitRoomView from "@/components/livekit-room"
import { auth } from "@/lib/auth"

export default async function MeetingPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const decodedCode = decodeURIComponent(code).trim()
  if (!/^[a-z0-9]{3}-[a-z0-9]{4}-[a-z0-9]{3}$/i.test(decodedCode)) notFound()

  const session = await auth.api.getSession({ headers: await headers() })
  return <LiveKitRoomView roomName={decodedCode} userName={session?.user.name || "Guest"} />
}
