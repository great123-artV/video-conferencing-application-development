import { get } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get("pathname")
  if (!pathname || !/^meetings\/[a-z0-9-]+\/slides\/.+/i.test(pathname)) return NextResponse.json({ error: "Invalid slide" }, { status: 400 })
  const result = await get(pathname, { access: "private", ifNoneMatch: request.headers.get("if-none-match") ?? undefined })
  if (!result) return new NextResponse("Not found", { status: 404 })
  if (result.statusCode === 304) return new NextResponse(null, { status: 304, headers: { ETag: result.blob.etag, "Cache-Control": "private, no-cache" } })
  return new NextResponse(result.stream, { headers: { "Content-Type": result.blob.contentType || "application/octet-stream", ETag: result.blob.etag, "Cache-Control": "private, no-cache" } })
}

export const runtime = "nodejs"
