import { AccessToken } from "livekit-server-sdk"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  const roomName = typeof body?.roomName === "string" ? body.roomName.trim() : ""
  if (!roomName || roomName.length > 120) return NextResponse.json({ error: "Invalid room" }, { status: 400 })

  const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity: session.user.id,
    name: session.user.name,
    ttl: "2h",
  })
  token.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true })

  return NextResponse.json({ token: await token.toJwt(), url: process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL })
}
