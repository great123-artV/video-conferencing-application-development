import { AccessToken } from "livekit-server-sdk"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { meetings } from "@/lib/db/schema"

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  const roomName = typeof body?.roomName === "string" ? body.roomName.trim() : ""
  if (!roomName || roomName.length > 120 || !/^[a-z0-9-]+$/i.test(roomName)) return NextResponse.json({ error: "Invalid meeting code" }, { status: 400 })

  const [meeting] = await db
    .select({ id: meetings.id, ownerId: meetings.userId })
    .from(meetings)
    .where(eq(meetings.code, roomName))
    .limit(1)
  if (!meeting) return NextResponse.json({ error: "Meeting not found" }, { status: 404 })

  const livekitUrl = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL
  if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET || !livekitUrl) {
    return NextResponse.json({ error: "Video service is not configured" }, { status: 503 })
  }

  const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity: `${session.user.id}-${crypto.randomUUID()}`,
    name: session.user.name,
    ttl: "1h",
  })
  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    roomAdmin: meeting.ownerId === session.user.id,
  })

  return NextResponse.json({ token: await token.toJwt(), url: livekitUrl }, { headers: { "Cache-Control": "no-store" } })
}
