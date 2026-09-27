import { put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: "Sign in required to upload slides" }, { status: 401 })
  const formData = await request.formData()
  const file = formData.get("file")
  const roomName = String(formData.get("roomName") || "").trim()
  if (!(file instanceof File) || !roomName) return NextResponse.json({ error: "Image and meeting are required" }, { status: 400 })
  if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: "Only JPG, PNG, WebP, and GIF images are supported" }, { status: 415 })
  if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "Images must be 10 MB or smaller" }, { status: 413 })

  const safeName = file.name.replace(/[^a-z0-9._-]/gi, "-").slice(-120)
  const blob = await put(`meetings/${roomName}/slides/${crypto.randomUUID()}-${safeName}`, file, { access: "private", addRandomSuffix: false })
  return NextResponse.json({ pathname: blob.pathname, contentType: file.type, name: file.name })
}

export const runtime = "nodejs"
