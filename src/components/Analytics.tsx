'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.webseccheck.com'

export default function Analytics() {
  const pathname = usePathname()
  const lastPath = useRef('')

  useEffect(() => {
    if (pathname === lastPath.current) return
    lastPath.current = pathname

    const data = JSON.stringify({
      path: pathname,
      referrer: document.referrer || '',
    })

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          `${API_URL}/track`,
          new Blob([data], { type: 'application/json' })
        )
      } else {
        fetch(`${API_URL}/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: data,
          keepalive: true,
        }).catch(() => {})
      }
    } catch {}
  }, [pathname])

  return null
}
