'use client'
import { useState } from 'react'

export default function Scanner() {
  const [url, setUrl] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) setSubmitted(true)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Enter your website URL (e.g., example.com)"
            className="w-full pl-12 pr-4 py-4 bg-cyber-gray border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyber-green/50 focus:ring-1 focus:ring-cyber-green/30 transition-all text-sm"
          />
        </div>
        <button
          type="submit"
          className="gradient-cta text-black font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-all glow-green text-sm whitespace-nowrap"
        >
          Scan Now — Free
        </button>
      </form>

      {submitted && (
        <div className="mt-6 p-4 rounded-xl bg-cyber-gray border border-cyber-green/20 text-center">
          <div className="flex items-center justify-center gap-2 text-cyber-green mb-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">Scan Queued</span>
          </div>
          <p className="text-gray-400 text-sm">Scan functionality coming soon. We&apos;re finalizing our scanning engine for <span className="text-white font-medium">{url}</span></p>
        </div>
      )}
    </div>
  )
}
