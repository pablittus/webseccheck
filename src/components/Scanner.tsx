'use client'
import { useState, useEffect } from 'react'

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

const FREE_CHECK_IDS = ['ssl_certificate_validity', 'server_version_disclosure', 'header_csp', 'mixed_content']

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

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="flex items-center justify-center gap-2 text-red-400 font-mono text-lg sm:text-2xl font-bold">
      <div className="bg-red-900/30 border border-red-500/30 rounded-lg px-3 py-1.5">
        {String(minutes).padStart(2, '0')}
      </div>
      <span className="animate-pulse">:</span>
      <div className="bg-red-900/30 border border-red-500/30 rounded-lg px-3 py-1.5">
        {String(seconds).padStart(2, '0')}
      </div>
      <span className="text-xs sm:text-sm text-gray-400 ml-2">left at this price</span>
    </div>
  )
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

const handleOrderReport = async () => {    if (!email.trim() || !url.trim()) {      setError('Please enter your email address to receive the report.')      return    }    setOrdering(true)    setError('')    try {      const res = await fetch(`${API_URL}/checkout`, {        method: 'POST',        headers: { 'Content-Type': 'application/json' },        body: JSON.stringify({ url: url.trim(), email: email.trim() }),      })      if (!res.ok) {        const err = await res.json().catch(() => ({ detail: 'Failed to create checkout' }))        throw new Error(err.detail || 'Failed to create checkout')      }      const data = await res.json()      if (data.init_point) {        window.location.href = data.init_point      } else {        throw new Error('No payment URL received')      }    } catch (err) {      setError(err instanceof Error ? err.message : 'An error occurred.')    } finally {      setOrdering(false)    }  }

  // Split checks into free and hidden
  const freeChecks = result ? result.checks.filter(c => FREE_CHECK_IDS.includes(c.id)) : []
  const hiddenChecks = result ? result.checks.filter(c => !FREE_CHECK_IDS.includes(c.id)) : []
  const hiddenVulnerabilities = hiddenChecks.filter(c => c.status === 'fail' || c.status === 'warn').length

  // Score range (±8 around actual score, clamped to 0-100)
  const scoreMin = result ? Math.max(0, result.score - 8) : 0
  const scoreMax = result ? Math.min(100, result.score + 8) : 0

  const freeCategories = result
    ? Array.from(new Set(freeChecks.map(c => c.category)))
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
          {/* Score header - shows range instead of exact */}
          <div className="p-4 sm:p-6 rounded-xl bg-cyber-gray border border-cyber-green/20">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <p className="text-gray-400 text-[10px] sm:text-xs mb-1">Estimated Security Score</p>
                <div className="flex items-baseline gap-1 sm:gap-2">
                  <span className={`text-3xl sm:text-5xl font-black ${gradeColor[result.grade] || 'text-white'}`}>
                    {scoreMin}-{scoreMax}
                  </span>
                  <span className="text-gray-500 text-sm sm:text-lg">/ 100</span>
                  <span className={`text-xl sm:text-3xl font-bold ml-1 sm:ml-2 ${gradeColor[result.grade] || 'text-white'}`}>
                    {result.grade}
                  </span>
                </div>
                <p className="text-gray-500 text-[10px] mt-1">Unlock full report for your exact score</p>
              </div>
              <div className="text-right text-xs sm:text-sm text-gray-400">
                <p className="truncate max-w-[120px] sm:max-w-none">{result.url}</p>
                <p>{result.scan_time_seconds.toFixed(2)}s · {result.total_checks} checks</p>
              </div>
            </div>

            {/* Score bar - blurred middle section */}
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${result.score}%`,
                  background: result.score >= 80 ? '#22c55e' : result.score >= 60 ? '#eab308' : result.score >= 40 ? '#f97316' : '#ef4444',
                  filter: 'blur(3px)',
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

          {/* FREE checks by category */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="text-cyber-green text-xs font-semibold uppercase tracking-wider">Free Preview</span>
              <span className="text-gray-600 text-xs">— {freeChecks.length} of {result.total_checks} checks</span>
            </div>
            {freeCategories.map(cat => (
              <div key={cat} className="rounded-xl bg-cyber-gray border border-white/5 overflow-hidden mb-3">
                <div className="px-4 py-3 bg-white/5 border-b border-white/5">
                  <h3 className="text-white font-semibold text-sm">{cat}</h3>
                </div>
                <div className="divide-y divide-white/5">
                  {freeChecks
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
          </div>

          {/* BLURRED TEASER SECTION */}
          <div className="relative">
            {/* Blurred fake checks behind overlay */}
            <div className="rounded-xl bg-cyber-gray border border-white/5 overflow-hidden" style={{ filter: 'blur(6px)', userSelect: 'none' as const }}>
              <div className="px-4 py-3 bg-white/5 border-b border-white/5">
                <h3 className="text-white font-semibold text-sm">Security Headers</h3>
              </div>
              <div className="divide-y divide-white/5">
                {hiddenChecks.slice(0, 4).map((check, i) => (
                  <div key={i} className="px-4 py-3 flex items-start gap-3">
                    <span className="text-red-400 font-bold mt-0.5">✗</span>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">████████ ██████</p>
                      <p className="text-gray-400 text-xs mt-0.5">████████████ ██████ ████████</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overlay CTA */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
              <div className="text-center px-4">
                <div className="text-3xl mb-2">🔒</div>
                <p className="text-white font-bold text-lg sm:text-xl mb-1">
                  {hiddenChecks.length} More Critical Checks Performed
                </p>
                <p className="text-red-400 text-sm font-medium">
                  We found {hiddenVulnerabilities > 0 ? hiddenVulnerabilities : 'additional'} vulnerabilit{hiddenVulnerabilities === 1 ? 'y' : 'ies'} that need immediate attention
                </p>
              </div>
            </div>
          </div>

          {/* Urgency / social proof bar */}
          <div className="p-3 sm:p-4 rounded-xl bg-red-900/10 border border-red-500/20 text-center space-y-3">
            <p className="text-red-400 text-xs sm:text-sm font-medium animate-pulse">
              ⚠️ Your competitors can see these vulnerabilities. Hackers scan for these daily.
            </p>
            <CountdownTimer />
          </div>

          {/* Premium CTA */}
          <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-r from-red-500/10 via-cyber-green/10 to-cyan-500/10 border border-cyber-green/30 text-center">
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
                <div className="text-3xl mb-2">🛡️</div>
                <h3 className="text-white font-bold text-lg sm:text-xl mb-2">
                  Unlock All {result.total_checks} Security Checks
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm mb-1">
                  🔒 <strong>{hiddenChecks.length} more critical checks</strong> were performed on your site.
                </p>
                <p className="text-gray-400 text-xs sm:text-sm mb-4">
                  Get your exact score, detailed remediation steps, priority action plan, and code examples.
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
                    className="gradient-cta text-black font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition-all glow-green text-sm whitespace-nowrap disabled:opacity-50"
                  >
                    {ordering ? 'Redirecting to payment...' : 'Get Full Report — $49'}
                  </button>
                </div>
                <p className="text-gray-500 text-[10px]">
                  Instant delivery · Detailed remediation steps · Money-back guarantee
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
