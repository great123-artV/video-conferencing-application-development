import { redirect } from "next/navigation"
import Dashboard from "@/components/dashboard"
import { getSession } from "@/lib/auth"
import { getMeetings } from "@/app/actions/meetings"

export default async function Page() {
  const session = await getSession()
  if (!session?.user) redirect("/sign-in")
  const meetings = await getMeetings()
  return <Dashboard user={session.user} meetings={meetings} />
}
