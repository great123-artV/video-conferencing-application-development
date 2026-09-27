'use server'

import { and, desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { meetings } from "@/lib/db/schema"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export async function getMeetings() {
  const userId = await getUserId()
  return db.select().from(meetings).where(eq(meetings.userId, userId)).orderBy(desc(meetings.createdAt))
}

export async function createMeeting(input: { title: string; meetingDate: string; meetingTime: string; attendees?: number; durationMinutes?: number }) {
  const userId = await getUserId()
  const code = crypto.randomUUID().slice(0, 11).replace(/-/g, "-")
  const [meeting] = await db.insert(meetings).values({ ...input, userId, code, attendees: input.attendees ?? 1, durationMinutes: input.durationMinutes ?? 45 }).returning()
  revalidatePath("/")
  return meeting
}

export async function deleteMeeting(id: number) {
  const userId = await getUserId()
  await db.delete(meetings).where(and(eq(meetings.id, id), eq(meetings.userId, userId)))
  revalidatePath("/")
}
