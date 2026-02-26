import Link from 'next/link'

const tiers = [
  {
    name: 'Free Scan',
    price: '$0',
    period: 'forever',
    desc: 'Quick security assessment for any website.',
    features: [
      'OWASP Top 10 passive checks',
      'Overall security score (A-F)',
      'SSL/TLS basic validation',
      'HTTP security headers check',
      'Instant results — no signup',
      'Shareable report link',
    ],
    cta: 'Scan Now — Free',
    href: '/',
    highlight: false,
  },
  {
    name: 'Security Report',
    price: '$49',
    period: 'per scan',
    desc: 'Comprehensive vulnerability assessment with remediation guidance.',
    features: [
      'All 45+ security checks',
      'CVSS v3.1 risk scoring',
      'Priority-ranked vulnerabilities',
      'Detailed remediation roadmap',
      'Industry benchmark comparison',
      'PDF export & API access',
      'Email alerts for changes',
      '30-day money-back guarantee',
    ],
    cta: 'Get Security Report',
    href: '/contact',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Penetration Test',
    price: '$499',
    period: 'per engagement',
    desc: 'Full autonomous pentest by AI + certified experts.',
    features: [
      'Full autonomous pentest with Shannon AI',
      'Actual exploit proof-of-concepts',
      'Comprehensive audit report (50+ pages)',
      'Remediation support & re-test',
      'Conducted by certified experts (OSCP/CEH)',
      'NDA & compliance documentation',
      'Executive summary for stakeholders',
      'Priority support channel',
    ],
    cta: 'Request Pentest',
    href: '/contact',
    highlight: false,
  },
]

export default function Pricing() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Simple, Transparent Pricing</h1>
        <p className="text-gray-400 max-w-xl mx-auto text-lg">From free scans to full penetration tests. Choose the depth of security you need.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {tiers.map(t => (
          <div key={t.name} className={`rounded-2xl p-8 relative transition-all hover:scale-[1.02] ${t.highlight ? 'bg-gradient-to-b from-cyber-green/10 to-cyber-gray border-2 border-cyber-green/30 glow-green' : 'card-dark'}`}>
            {t.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-cta text-black text-xs font-bold px-4 py-1 rounded-full">
                {t.badge}
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-1">{t.name}</h3>
              <p className="text-gray-400 text-sm">{t.desc}</p>
            </div>
            <div className="mb-6">
              <span className="text-5xl font-black text-white">{t.price}</span>
              <span className="text-gray-500 text-sm ml-2">/ {t.period}</span>
            </div>
            <ul className="space-y-3 mb-8">
              {t.features.map(f => (
                <li key={f} className="flex items-start gap-3 text-sm text-gray-300">
                  <svg className="w-5 h-5 text-cyber-green flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={t.href}
              className={`block text-center py-3 rounded-xl font-semibold text-sm transition ${t.highlight ? 'gradient-cta text-black hover:opacity-90' : 'border border-white/10 text-white hover:border-cyber-green/30'}`}
            >
              {t.cta}
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-gray-500 text-sm">All plans include SOC 2 compliant infrastructure. Enterprise plans available — <Link href="/contact" className="text-cyber-green hover:underline">contact us</Link>.</p>
      </div>
    </div>
  )
}
