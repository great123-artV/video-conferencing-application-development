import { headers } from "next/headers"
import { redirect } from "next/navigation"

import LiveKitRoomView from "@/components/livekit-room"
import { auth } from "@/lib/auth"

export default async function MeetingPage({ params }: { params: Promise<{ code: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect(`/sign-in?redirect=/meeting/${(await params).code}`)
  const { code } = await params
  return <LiveKitRoomView roomName={code} userName={session.user.name} />
}
