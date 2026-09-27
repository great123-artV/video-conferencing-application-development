"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

export default function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const isSignUp = mode === "sign-up"

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setPending(true); setError("")
    const result = isSignUp ? await authClient.signUp.email({ name, email, password }) : await authClient.signIn.email({ email, password })
    setPending(false)
    if (result.error) { setError("Unable to authenticate with those details."); return }
    router.push("/"); router.refresh()
  }

  return <form onSubmit={submit} className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-[#e8e9ed] bg-white p-7 shadow-sm">
    <div><p className="text-2xl font-bold text-[#242832]">{isSignUp ? "Create your account" : "Welcome back"}</p><p className="mt-1 text-sm text-[#808896]">{isSignUp ? "Start making every meeting count." : "Sign in to your Meetly workspace."}</p></div>
    {isSignUp && <label className="text-sm font-semibold text-[#596170]">Name<input required value={name} onChange={(e) => setName(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#dfe1e6] px-3 outline-none focus:border-[#8f1d2c]" /></label>}
    <label className="text-sm font-semibold text-[#596170]">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#dfe1e6] px-3 outline-none focus:border-[#8f1d2c]" /></label>
    <label className="text-sm font-semibold text-[#596170]">Password<input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#dfe1e6] px-3 outline-none focus:border-[#8f1d2c]" /></label>
    {error && <p role="alert" className="text-sm text-[#8f1d2c]">{error}</p>}
    <button disabled={pending} className="h-11 rounded-xl bg-[#8f1d2c] text-sm font-bold text-white disabled:opacity-50">{pending ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}</button>
    <a href={isSignUp ? "/sign-in" : "/sign-up"} className="text-center text-sm font-semibold text-[#8f1d2c]">{isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}</a>
  </form>
}
