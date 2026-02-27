'use client'
import { useState, useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile: any
  }
}

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [error, setError] = useState('')
  const turnstileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.onload = () => {
      if (window.turnstile && turnstileRef.current) {
        window.turnstile.render(turnstileRef.current, {
          sitekey: '0x4AAAAAACjW7P0HSJ-5T5PN',
          theme: 'dark',
          callback: (token: string) => setTurnstileToken(token),
          'expired-callback': () => setTurnstileToken(''),
        })
      }
    }
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    if (!turnstileToken) {
      setError('Please complete the captcha verification.')
      return
    }
    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      subject: (form.elements.namedItem('subject') as HTMLSelectElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
      turnstile_token: turnstileToken,
    }
    try {
      const res = await fetch('https://api.webseccheck.com/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to send message' }))
        throw new Error(err.detail || 'Failed to send message')
      }
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Get in Touch</h1>
        <p className="text-gray-400 text-lg">Questions about security reports, pentests, or enterprise plans? We&apos;re here to help.</p>
      </div>

      {submitted ? (
        <div className="card-dark rounded-2xl p-10 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-white mb-2">Message Received</h2>
          <p className="text-gray-400">We&apos;ll get back to you within 24 hours. For urgent security matters, please indicate so in your message.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card-dark rounded-2xl p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
              <input required name="name" type="text" className="w-full px-4 py-3 bg-cyber-darkblue border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyber-green/50 text-sm" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input required name="email" type="email" className="w-full px-4 py-3 bg-cyber-darkblue border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyber-green/50 text-sm" placeholder="you@company.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
            <select name="subject" className="w-full px-4 py-3 bg-cyber-darkblue border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyber-green/50 text-sm">
              <option>Free Scan Question</option>
              <option>Security Report Inquiry</option>
              <option>Penetration Test Request</option>
              <option>Enterprise Plan</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
            <textarea required name="message" rows={5} className="w-full px-4 py-3 bg-cyber-darkblue border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyber-green/50 text-sm resize-none" placeholder="Tell us about your security needs..." />
          </div>
          <div className="flex justify-center">
            <div ref={turnstileRef} />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button type="submit" className="w-full gradient-cta text-black font-bold py-3 rounded-xl hover:opacity-90 transition text-sm">
            Send Message
          </button>
        </form>
      )}

      <div className="grid sm:grid-cols-3 gap-6 mt-12">
        {[
          { icon: '📧', label: 'Email', value: 'security@webseccheck.com' },
          { icon: '🕐', label: 'Response Time', value: 'Within 24 hours' },
          { icon: '🔒', label: 'Secure', value: 'PGP key available' },
        ].map(i => (
          <div key={i.label} className="card-dark rounded-xl p-5 text-center">
            <div className="text-2xl mb-2">{i.icon}</div>
            <div className="text-white font-semibold text-sm">{i.label}</div>
            <div className="text-gray-400 text-xs mt-1">{i.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
