const team = [
  { name: 'Shannon AI', role: 'Autonomous Pentest Engine', desc: 'Our proprietary AI that thinks like an attacker. Trained on thousands of real-world exploits and continuously learning.' },
  { name: 'Security Research Team', role: 'Offensive Security Experts', desc: 'OSCP, CEH, and GPEN certified professionals with combined 50+ years of experience in offensive security.' },
  { name: 'Engineering Team', role: 'Platform & Infrastructure', desc: 'Building scalable, secure infrastructure that processes millions of security checks daily with 99.9% uptime.' },
]

const values = [
  { icon: '🎯', title: 'Accuracy First', desc: 'We minimize false positives through multi-layer verification. Every finding is validated before reporting.' },
  { icon: '🔐', title: 'Privacy by Design', desc: 'We never store your sensitive data. Scans are ephemeral and results are encrypted at rest.' },
  { icon: '🌍', title: 'Accessible Security', desc: 'Enterprise-grade security should not require an enterprise budget. Our free tier is genuinely useful.' },
  { icon: '🤖', title: 'AI-Augmented', desc: 'Combining human expertise with AI capabilities for faster, deeper, and more comprehensive security assessments.' },
]

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Security Is Not Optional</h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          We&apos;re a team of cybersecurity researchers and AI engineers on a mission to make the web safer. We believe every website deserves enterprise-grade security assessment.
        </p>
      </div>

      <section className="mb-20">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Our Values</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map(v => (
            <div key={v.title} className="card-dark rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">{v.icon}</div>
              <h3 className="text-white font-bold mb-2">{v.title}</h3>
              <p className="text-gray-400 text-sm">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-20">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">The Team</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {team.map(t => (
            <div key={t.name} className="card-dark rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-cyber-green/10 border border-cyber-green/20 flex items-center justify-center text-cyber-green text-2xl font-bold mx-auto mb-4">
                {t.name[0]}
              </div>
              <h3 className="text-white font-bold text-lg mb-1">{t.name}</h3>
              <p className="text-cyber-green text-sm mb-3">{t.role}</p>
              <p className="text-gray-400 text-sm">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card-dark rounded-2xl p-10 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Our Methodology</h2>
        <p className="text-gray-400 max-w-3xl mx-auto leading-relaxed">
          Our scanning engine follows the OWASP Testing Guide v4 methodology, enriched with proprietary checks developed from our team&apos;s offensive security research. We combine passive reconnaissance, active scanning, and AI-powered analysis to deliver actionable security insights with minimal false positives. Every vulnerability is scored using CVSS v3.1 and mapped to CWE identifiers for compliance and tracking.
        </p>
      </section>
    </div>
  )
}
