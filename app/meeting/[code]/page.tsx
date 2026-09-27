import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"

import LiveKitRoomView from "@/components/livekit-room"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { meetings } from "@/lib/db/schema"

export default async function MeetingPage({ params }: { params: Promise<{ code: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect(`/sign-in?redirect=/meeting/${(await params).code}`)
  const { code } = await params
  const decodedCode = decodeURIComponent(code).trim()
  const [meeting] = await db.select({ code: meetings.code }).from(meetings).where(eq(meetings.code, decodedCode)).limit(1)
  if (!meeting) notFound()
  return <LiveKitRoomView roomName={meeting.code} userName={session.user.name} />
}
