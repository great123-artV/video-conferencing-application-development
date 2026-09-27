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

  return <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_24px_80px_rgba(7,17,31,0.14)] lg:grid-cols-[1.05fr_0.95fr]">
    <section className="relative hidden overflow-hidden bg-[#07111f] p-10 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute -right-24 -top-24 size-80 rounded-full bg-[#4f7cff]/20 blur-3xl" /><div className="absolute -bottom-28 -left-20 size-80 rounded-full bg-[#7c5cff]/20 blur-3xl" />
      <div className="relative"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#4f7cff] to-[#7c5cff] text-lg font-black">M</span><span className="text-lg font-bold tracking-tight">meetly</span></div><p className="mt-20 max-w-md text-4xl font-semibold leading-[1.08] tracking-[-0.05em]">Meet without boundaries.</p><p className="mt-5 max-w-sm text-sm leading-7 text-[#98a6b8]">Secure, polished video collaboration for teams and organizations around the world.</p></div>
      <div className="relative flex items-center gap-3 text-xs text-[#98a6b8]"><span className="size-2 rounded-full bg-[#22c55e]" />Reliable meetings, wherever work happens.</div>
    </section>
    <form onSubmit={submit} className="flex flex-col gap-5 p-7 sm:p-10">
      <div className="lg:hidden"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#4f7cff] to-[#7c5cff] text-sm font-black text-white">M</span><span className="text-lg font-bold tracking-tight text-[#07111f]">meetly</span></div></div>
      <div><p className="text-2xl font-bold tracking-tight text-[#101828]">{isSignUp ? "Create your account" : "Welcome back"}</p><p className="mt-2 text-sm leading-6 text-[#667085]">{isSignUp ? "Build a better way to meet." : "Sign in to your professional meeting workspace."}</p></div>
      {isSignUp && <label className="text-sm font-semibold text-[#344054]">Name<input required value={name} onChange={(e) => setName(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#d0d5dd] bg-[#f8fafc] px-3 outline-none transition focus:border-[#4f7cff] focus:ring-4 focus:ring-[#4f7cff]/10" /></label>}
      <label className="text-sm font-semibold text-[#344054]">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#d0d5dd] bg-[#f8fafc] px-3 outline-none transition focus:border-[#4f7cff] focus:ring-4 focus:ring-[#4f7cff]/10" /></label>
      <label className="text-sm font-semibold text-[#344054]">Password<input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#d0d5dd] bg-[#f8fafc] px-3 outline-none transition focus:border-[#4f7cff] focus:ring-4 focus:ring-[#4f7cff]/10" /></label>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button disabled={pending} className="h-12 rounded-xl bg-gradient-to-r from-[#4f7cff] to-[#7c5cff] text-sm font-bold text-white shadow-lg shadow-[#4f7cff]/20 transition hover:brightness-105 disabled:opacity-50">{pending ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}</button>
      <a href={isSignUp ? "/sign-in" : "/sign-up"} className="text-center text-sm font-semibold text-[#4f7cff] hover:text-[#7c5cff]">{isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}</a>
    </form>
  </div>
}
