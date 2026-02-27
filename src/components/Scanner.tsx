'use client'
import { useState } from 'react'

interface CheckResult {
  id: string
  name: string
  category: string
  status: 'pass' | 'warn' | 'fail'
  description: string
  details: Record<string, unknown> | null
}

interface ScanResult {
  url: string
  score: number
  grade: string
  checks: CheckResult[]
  scan_time_seconds: number
  total_checks: number
  passed: number
  warnings: number
  failed: number
}

const API_URL = 'https://api.webseccheck.com'

const gradeColor: Record<string, string> = {
  'A': 'text-green-400',
  'B': 'text-green-300',
  'C': 'text-yellow-400',
  'D': 'text-orange-400',
  'F': 'text-red-500',
}

const statusIcon: Record<string, { icon: string; color: string }> = {
  pass: { icon: '✓', color: 'text-green-400' },
  warn: { icon: '⚠', color: 'text-yellow-400' },
  fail: { icon: '✗', color: 'text-red-400' },
}

export default function Scanner() {
  const [url, setUrl] = useState('')
  const [email, setEmail] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')
  const [reportStatus, setReportStatus] = useState<{ sent: boolean; email: string; grade: string; score: number } | null>(null)
  const [ordering, setOrdering] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setScanning(true)
    setResult(null)
    setError('')

    try {
      const res = await fetch(`${API_URL}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Scan failed' }))
        throw new Error(err.detail || 'Scan failed')
      }

      const data: ScanResult = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.')
    } finally {
      setScanning(false)
    }
  }

  const handleOrderReport = async () => {
    if (!email.trim() || !url.trim()) {
      setError('Please enter your email address to receive the report.')
      return
    }
    setOrdering(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), email: email.trim() }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to generate report' }))
        throw new Error(err.detail || 'Failed to generate report')
      }
      const data = await res.json()
      setReportStatus({ sent: true, email: email.trim(), grade: data.grade, score: data.score })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.')
    } finally {
      setOrdering(false)
    }
  }

  const categories = result
    ? Array.from(new Set(result.checks.map(c => c.category)))
    : []

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-3 sm:left-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Enter your website URL (e.g., example.com)"
            disabled={scanning}
            className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-cyber-gray border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyber-green/50 focus:ring-1 focus:ring-cyber-green/30 transition-all text-sm disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={scanning}
          className="gradient-cta text-black font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:opacity-90 transition-all glow-green text-sm whitespace-nowrap disabled:opacity-50"
        >
          {scanning ? 'Scanning...' : 'Scan Now — Free'}
        </button>
      </form>

      {/* Scanning animation */}
      {scanning && (
        <div className="mt-4 sm:mt-6 p-4 sm:p-6 rounded-xl bg-cyber-gray border border-cyber-green/20 text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-cyber-green border-t-transparent rounded-full animate-spin" />
            <span className="text-cyber-green font-semibold text-sm sm:text-base">Scanning {url}...</span>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm">Running 16 security checks against OWASP Top 10</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl bg-red-900/20 border border-red-500/30 text-center">
          <p className="text-red-400 text-xs sm:text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
          {/* Score header */}
          <div className="p-4 sm:p-6 rounded-xl bg-cyber-gray border border-cyber-green/20">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <p className="text-gray-400 text-[10px] sm:text-xs mb-1">Security Score</p>
                <div className="flex items-baseline gap-1 sm:gap-2">
                  <span className={`text-3xl sm:text-5xl font-black ${gradeColor[result.grade] || 'text-white'}`}>
                    {result.score}
                  </span>
                  <span className="text-gray-500 text-sm sm:text-lg">/100</span>
                  <span className={`text-xl sm:text-3xl font-bold ml-1 sm:ml-2 ${gradeColor[result.grade] || 'text-white'}`}>
                    {result.grade}
                  </span>
                </div>
              </div>
              <div className="text-right text-xs sm:text-sm text-gray-400">
                <p className="truncate max-w-[120px] sm:max-w-none">{result.url}</p>
                <p>{result.scan_time_seconds.toFixed(2)}s · {result.total_checks} checks</p>
              </div>
            </div>

            {/* Score bar */}
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${result.score}%`,
                  background: result.score >= 80 ? '#22c55e' : result.score >= 60 ? '#eab308' : result.score >= 40 ? '#f97316' : '#ef4444',
                }}
              />
            </div>

            {/* Summary pills */}
            <div className="flex flex-wrap gap-2 sm:gap-4 mt-3 sm:mt-4">
              <span className="text-green-400 text-xs sm:text-sm font-medium">✓ {result.passed} passed</span>
              <span className="text-yellow-400 text-xs sm:text-sm font-medium">⚠ {result.warnings} warnings</span>
              <span className="text-red-400 text-xs sm:text-sm font-medium">✗ {result.failed} failed</span>
            </div>
          </div>

          {/* Checks by category */}
          {categories.map(cat => (
            <div key={cat} className="rounded-xl bg-cyber-gray border border-white/5 overflow-hidden">
              <div className="px-4 py-3 bg-white/5 border-b border-white/5">
                <h3 className="text-white font-semibold text-sm">{cat}</h3>
              </div>
              <div className="divide-y divide-white/5">
                {result.checks
                  .filter(c => c.category === cat)
                  .map(check => (
                    <div key={check.id} className="px-4 py-3 flex items-start gap-3">
                      <span className={`${statusIcon[check.status].color} font-bold mt-0.5`}>
                        {statusIcon[check.status].icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">{check.name}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{check.description}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}

          {/* CTA for paid report */}
          <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-r from-cyber-green/10 to-cyan-500/10 border border-cyber-green/20 text-center">
            {reportStatus?.sent ? (
              <>
                <div className="text-3xl mb-2">📧</div>
                <h3 className="text-white font-bold text-base sm:text-lg mb-1 sm:mb-2">Report Sent!</h3>
                <p className="text-gray-400 text-xs sm:text-sm mb-2">
                  Your full security report has been sent to <span className="text-cyber-green font-semibold">{reportStatus.email}</span>
                </p>
                <p className="text-gray-500 text-xs">
                  Score: {reportStatus.score}/100 · Grade: {reportStatus.grade} · Check your inbox (and spam folder)
                </p>
              </>
            ) : (
              <>
                <h3 className="text-white font-bold text-base sm:text-lg mb-1 sm:mb-2">Want the full picture?</h3>
                <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">
                  Get a detailed security report with remediation steps, priority action plan, and code examples.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto mb-3">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 px-4 py-2.5 bg-cyber-gray border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyber-green/50 text-sm"
                  />
                  <button
                    onClick={handleOrderReport}
                    disabled={ordering}
                    className="gradient-cta text-black font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition-all text-sm whitespace-nowrap disabled:opacity-50"
                  >
                    {ordering ? 'Generating...' : 'Get Full Report — $49'}
                  </button>
                </div>
                <p className="text-gray-600 text-[10px]">Report link will be emailed to you instantly</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
