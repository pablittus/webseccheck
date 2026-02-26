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

const testimonials = [
  {
    quote: 'WebSecCheck revealed we were missing critical security headers like CSP and X-Frame-Options across our entire platform. We fixed them within hours and avoided what could have been a serious clickjacking vulnerability.',
    name: 'Marcus Chen',
    role: 'CTO',
    company: 'StreamlineOps',
  },
  {
    quote: 'I had no idea our SSL certificate was using an outdated TLS version. The scan flagged it immediately, and the remediation steps were so clear that even my non-technical team could understand the urgency.',
    name: 'Sarah Lindqvist',
    role: 'Owner',
    company: 'NordicCraft Store',
  },
  {
    quote: 'We run every client site through WebSecCheck before launch now. It catches things like open admin panels and missing HSTS headers that manual reviews always miss. It\'s become part of our QA checklist.',
    name: 'James Okafor',
    role: 'Founder',
    company: 'BrightPixel Agency',
  },
  {
    quote: 'What used to take me 2-3 hours of manual security auditing now takes 30 seconds. The detailed breakdown by category makes it easy to prioritize fixes and explain issues to clients.',
    name: 'Elena Vasquez',
    role: 'Freelance Web Developer',
    company: '',
  },
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-8 sm:pb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-cyber-gray/50 border border-cyber-green/20 rounded-full px-3 sm:px-4 py-1.5 mb-4 sm:mb-8">
            <span className="w-2 h-2 bg-cyber-green rounded-full animate-pulse" />
            <span className="text-[10px] sm:text-xs text-gray-300 font-medium">Security Engine Online — OWASP Top 10 Framework</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-4 sm:mb-6 tracking-tight">
            How Secure Is<br />
            <span className="text-gradient">Your Website?</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto mb-4 sm:mb-6">
            Run an instant security assessment against 45+ attack vectors.
            <span className="hidden sm:inline"> Get actionable results in seconds — no signup, no credit card.</span>
          </p>
          <Scanner />

          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-6 sm:mt-8">
            {trustSignals.map(s => (
              <div key={s.label} className="flex items-center gap-1.5 sm:gap-2 text-gray-400 text-xs sm:text-sm">
                <span className="text-base sm:text-lg">{s.icon}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-cyber-blue/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
          <div className="text-center mb-6 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">How It Works</h2>
            <p className="text-xs sm:text-base text-gray-400 max-w-xl mx-auto">Three simple steps to comprehensive security insights.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-8">
            {steps.map(s => (
              <div key={s.num} className="card-dark rounded-2xl p-3 sm:p-6 text-center transition-all hover:scale-[1.02]">
                <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-cyber-green/10 border border-cyber-green/20 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <span className="text-lg sm:text-2xl font-black text-cyber-green">{s.num}</span>
                </div>
                <h3 className="text-sm sm:text-lg font-bold text-white mb-1 sm:mb-2">{s.title}</h3>
                <p className="hidden sm:block text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Check */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
          <div className="text-center mb-6 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">What We Check</h2>
            <p className="text-xs sm:text-base text-gray-400 max-w-xl mx-auto">Comprehensive coverage across six critical security domains.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {categories.map(c => (
              <div key={c.title} className="card-dark rounded-2xl p-4 sm:p-6 transition-all hover:scale-[1.02]">
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-4">{c.icon}</div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">{c.title}</h3>
                <p className="hidden sm:block text-gray-400 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-cyber-blue/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
          <div className="text-center mb-6 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">Trusted by Developers & Teams</h2>
            <p className="text-xs sm:text-base text-gray-400 max-w-xl mx-auto">See what security-conscious professionals say about WebSecCheck.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="relative card-dark rounded-2xl p-4 sm:p-6 border border-white/5 hover:border-cyber-green/20 transition-all">
                <span className="absolute top-3 right-4 sm:top-4 sm:right-5 text-3xl sm:text-5xl font-serif text-cyber-green/10 leading-none select-none">&ldquo;</span>
                <div className="flex gap-0.5 mb-2 sm:mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-cyber-green" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-3 sm:line-clamp-none">{t.quote}</p>
                <div>
                  <span className="text-white font-semibold text-xs sm:text-sm">{t.name}</span>
                  <span className="text-gray-500 text-xs sm:text-sm"> — {t.role}{t.company && `, ${t.company}`}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-cyber-blue/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-4xl md:text-5xl font-black text-gradient mb-1 sm:mb-2">{s.value}</div>
                <div className="text-gray-400 text-xs sm:text-base">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">Ready to Secure Your Website?</h2>
          <p className="text-xs sm:text-base text-gray-400 max-w-xl mx-auto mb-6 sm:mb-8">Start with a free scan. Get enterprise-grade security insights in seconds.</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/" className="gradient-cta text-black font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:opacity-90 transition glow-green text-sm">
              Start Free Scan
            </Link>
            <Link href="/pricing" className="border border-white/10 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:border-cyber-green/30 transition text-sm">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
