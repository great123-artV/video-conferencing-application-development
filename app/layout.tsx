import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import PwaExperience from '@/components/pwa-experience'

export const metadata: Metadata = {
  title: "Meetly — Professional video meetings",
  description: "Secure, polished video meetings for teams and organizations around the world.",
  applicationName: "Meetly",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Meetly — Professional video meetings",
    description: "Meet without boundaries with secure, reliable video collaboration.",
    type: "website",
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f8fc' },
    { media: '(prefers-color-scheme: dark)', color: '#07111f' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <PwaExperience />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
