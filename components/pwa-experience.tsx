"use client"

import { useEffect, useState } from "react"
import { Download, RefreshCw, WifiOff, X } from "lucide-react"

const DISMISS_KEY = "meetly-install-dismissed"

export default function PwaExperience() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [installOpen, setInstallOpen] = useState(false)
  const [offline, setOffline] = useState(false)
  const [updateReady, setUpdateReady] = useState(false)
  const [ios, setIos] = useState(false)

  useEffect(() => {
    setOffline(!navigator.onLine)
    const onOnline = () => setOffline(false)
    const onOffline = () => setOffline(true)
    const onInstall = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
      if (localStorage.getItem(DISMISS_KEY) !== "1") setInstallOpen(true)
    }
    const onControllerChange = () => setUpdateReady(true)
    const isIosDevice = /iphone|ipad|ipod/i.test(navigator.userAgent) && !("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone)
    setIos(isIosDevice)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
    if (!isStandalone && !isIosDevice && localStorage.getItem(DISMISS_KEY) !== "1") {
      window.setTimeout(() => setInstallOpen(true), 900)
    }
    window.addEventListener("online", onOnline)
    window.addEventListener("offline", onOffline)
    window.addEventListener("beforeinstallprompt", onInstall)
    navigator.serviceWorker?.addEventListener("controllerchange", onControllerChange)
    navigator.serviceWorker?.register("/sw.js", { scope: "/" }).catch(() => undefined)
    return () => {
      window.removeEventListener("online", onOnline)
      window.removeEventListener("offline", onOffline)
      window.removeEventListener("beforeinstallprompt", onInstall)
      navigator.serviceWorker?.removeEventListener("controllerchange", onControllerChange)
    }
  }, [])

  async function install() {
    if (!installEvent) return
    await installEvent.prompt()
    await installEvent.userChoice
    setInstallOpen(false)
    setInstallEvent(null)
  }

  function dismissInstall() {
    localStorage.setItem(DISMISS_KEY, "1")
    setInstallOpen(false)
  }

  return <>
    {offline && <div className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-3 bg-[#07111f] px-4 py-3 text-sm font-semibold text-white shadow-lg" role="status"><WifiOff className="size-4 text-[#8ea7ff]" />You&apos;re offline. Check your internet connection and try again.<button onClick={() => window.location.reload()} className="ml-2 rounded-lg border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10"><RefreshCw className="mr-1 inline size-3" />Retry</button></div>}
    {installOpen && <div className="fixed inset-x-4 bottom-4 z-[90] mx-auto max-w-md rounded-2xl border border-white/10 bg-[#07111f] p-4 text-white shadow-[0_18px_60px_rgba(7,17,31,0.35)] sm:right-6 sm:left-auto"><button onClick={dismissInstall} aria-label="Dismiss install prompt" className="absolute right-3 top-3 rounded-lg p-1 text-white/50 hover:bg-white/10"><X className="size-4" /></button><div className="flex gap-3"><img src="/icon-512.png" alt="Meetly" className="size-12 rounded-xl" /><div><p className="font-bold">Install Meetly</p><p className="mt-1 pr-5 text-sm leading-5 text-white/60">Get faster access to your meetings from your device.</p><div className="mt-3 flex items-center gap-2"><button onClick={install} disabled={!installEvent} className="rounded-lg bg-[#4f7cff] px-3 py-2 text-xs font-bold disabled:cursor-default disabled:opacity-60">{installEvent ? "Install" : "Use browser menu"}</button><button onClick={dismissInstall} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-white/75">Not now</button></div></div></div></div>}
    {ios && <div className="fixed inset-x-4 bottom-4 z-[90] mx-auto max-w-md rounded-2xl border border-white/10 bg-[#07111f] p-4 text-white shadow-2xl"><p className="font-bold">Install this app</p><p className="mt-1 text-sm leading-6 text-white/65">Tap Share, choose &quot;Add to Home Screen&quot;, then tap Add.</p></div>}
    {updateReady && <div className="fixed bottom-4 left-4 z-[90] rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white shadow-2xl"><span>A new version is available.</span><button onClick={() => window.location.reload()} className="ml-3 font-bold text-[#8ea7ff]">Update</button></div>}
  </>
}

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
  }
}
