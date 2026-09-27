import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { toNextJsHandler } from "better-auth/next-js"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import * as schema from "@/lib/db/schema"

const developmentOrigins = [
  "http://localhost:3000",
  process.env.V0_RUNTIME_URL,
  process.env.V0_DEV_APP_URL,
  process.env.V0_BUILD_URL,
  process.env.V0_SANDBOX_URL,
]
const deploymentOrigins = [
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined,
]
const origins = (process.env.NODE_ENV === "development" ? developmentOrigins : deploymentOrigins).filter(Boolean) as string[]

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  baseURL: process.env.BETTER_AUTH_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) || process.env.V0_RUNTIME_URL,
  trustedOrigins: origins,
  emailAndPassword: { enabled: true },
  ...(process.env.NODE_ENV === "development" ? { advanced: { defaultCookieAttributes: { sameSite: "none" as const, secure: true } } } : {}),
})

export const authHandler = toNextJsHandler(auth)

export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}
