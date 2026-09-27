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

export async function createMeeting(input: { title?: string; meetingDate?: string; meetingTime?: string; attendees?: number; durationMinutes?: number }) {
  const userId = await getUserId()
  const title = input.title?.trim() || "Instant meeting"
  if (title.length > 120) throw new Error("Meeting title is too long")

  const now = new Date()
  const [meeting] = await db.insert(meetings).values({
    title,
    meetingDate: input.meetingDate || now.toISOString().slice(0, 10),
    meetingTime: input.meetingTime || now.toTimeString().slice(0, 5),
    userId,
    code: crypto.randomUUID().replace(/-/g, "").slice(0, 10).replace(/(.{3})(.{4})(.{3})/, "$1-$2-$3"),
    attendees: 1,
    durationMinutes: 45,
  }).returning()
  if (!meeting) throw new Error("Unable to create meeting")
  revalidatePath("/")
  return meeting
}

export async function deleteMeeting(id: number) {
  const userId = await getUserId()
  if (!Number.isInteger(id) || id < 1) throw new Error("Invalid meeting")
  await db.delete(meetings).where(and(eq(meetings.id, id), eq(meetings.userId, userId)))
  revalidatePath("/")
}
