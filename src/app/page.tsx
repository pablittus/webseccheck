import Scanner from '@/components/Scanner'
import Link from 'next/link'

const trustSignals = [
  { icon: '🛡️', label: 'OWASP Top 10 Framework' },
  { icon: '🔍', label: '45+ Security Checks' },
  { icon: '⚡', label: 'Results in 30 Seconds' },
]

const steps = [
  { num: '01', title: 'Enter Your URL', desc: 'Type your website address. No signup required — start scanning immediately.' },
  { num: '02', title: 'We Scan', desc: 'Our AI-powered engine runs 45+ security checks against OWASP Top 10 and beyond.' },
  { num: '03', title: 'Get Results', desc: 'Receive a detailed security score with prioritized findings and remediation steps.' },
]

const categories = [
  { icon: '🔒', title: 'SSL/TLS Security', desc: 'Certificate validity, protocol versions, cipher strength, HSTS implementation, and certificate chain analysis.' },
  { icon: '📋', title: 'HTTP Headers', desc: 'Content-Security-Policy, X-Frame-Options, CORS configuration, and all critical security headers.' },
  { icon: '🌐', title: 'DNS Security', desc: 'DNSSEC validation, SPF/DKIM/DMARC records, zone transfer protection, and DNS-based threats.' },
  { icon: '🖥️', title: 'Server Exposure', desc: 'Open ports, server version disclosure, directory listing, debug endpoints, and admin panel detection.' },
  { icon: '🍪', title: 'Cookie Security', desc: 'Secure/HttpOnly flags, SameSite policy, session management, and cookie-based attack vectors.' },
  { icon: '⚙️', title: 'CMS Vulnerabilities', desc: 'WordPress, Drupal, Joomla plugin vulnerabilities, outdated versions, and known CVEs.' },
]

const stats = [
  { value: '2M+', label: 'Websites Scanned' },
  { value: '45+', label: 'Security Checks' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '<30s', label: 'Average Scan Time' },
]

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,255,65,0.08)_0%,_transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 lg:pt-14 pb-10 sm:pb-14 lg:pb-18 text-center">
          <div className="inline-flex items-center gap-2 bg-cyber-gray/50 border border-cyber-green/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-cyber-green rounded-full animate-pulse" />
            <span className="text-xs text-gray-300 font-medium">Security Engine Online — OWASP Top 10 Framework</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-white mb-4 tracking-tight">
            How Secure Is<br />
            <span className="text-gradient">Your Website?</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-6">
            Run an instant security assessment against 45+ attack vectors. Get actionable results in seconds — no signup, no credit card.
          </p>
          <Scanner />

          <div className="flex flex-wrap justify-center gap-8 mt-8">
            {trustSignals.map(s => (
              <div key={s.label} className="flex items-center gap-2 text-gray-400 text-sm">
                <span className="text-lg">{s.icon}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-cyber-blue/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Three simple steps to comprehensive security insights.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(s => (
              <div key={s.num} className="card-dark rounded-2xl p-6 text-center transition-all hover:scale-[1.02]">
                <div className="text-4xl font-black text-cyber-green/20 mb-3">{s.num}</div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Check */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">What We Check</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Comprehensive coverage across six critical security domains.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(c => (
              <div key={c.title} className="card-dark rounded-2xl p-6 transition-all hover:scale-[1.02]">
                <div className="text-3xl mb-4">{c.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{c.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-cyber-blue/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-4xl sm:text-5xl font-black text-gradient mb-2">{s.value}</div>
                <div className="text-gray-400 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Ready to Secure Your Website?</h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-8">Start with a free scan. Get enterprise-grade security insights in seconds.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="gradient-cta text-black font-bold px-8 py-4 rounded-xl hover:opacity-90 transition glow-green text-sm">
              Start Free Scan
            </Link>
            <Link href="/pricing" className="border border-white/10 text-white font-semibold px-8 py-4 rounded-xl hover:border-cyber-green/30 transition text-sm">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
