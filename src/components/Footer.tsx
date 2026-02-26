import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-cyber-darkblue border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-black text-cyber-green px-2 py-0.5 border border-cyber-green/30 rounded">WS</span>
              <span className="text-white font-semibold">WebSecCheck</span>
            </div>
            <p className="text-gray-400 text-sm">Enterprise-grade web security scanning powered by AI. Protect your digital assets.</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-gray-400 hover:text-cyber-green text-sm transition-colors">Free Scanner</Link>
              <Link href="/pricing" className="block text-gray-400 hover:text-cyber-green text-sm transition-colors">Security Report</Link>
              <Link href="/pricing" className="block text-gray-400 hover:text-cyber-green text-sm transition-colors">Penetration Test</Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
            <div className="space-y-2">
              <Link href="/about" className="block text-gray-400 hover:text-cyber-green text-sm transition-colors">About Us</Link>
              <Link href="/contact" className="block text-gray-400 hover:text-cyber-green text-sm transition-colors">Contact</Link>
              <Link href="/privacy" className="block text-gray-400 hover:text-cyber-green text-sm transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="block text-gray-400 hover:text-cyber-green text-sm transition-colors">Terms of Service</Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Security</h4>
            <div className="space-y-2 text-gray-400 text-sm">
              <p>OWASP Top 10 Framework</p>
              <p>CVSS v3.1 Scoring</p>
              <p>SOC 2 Compliant</p>
              <p>GDPR Ready</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} WebSecCheck. All rights reserved.</p>
          <p className="text-gray-600 text-xs">Securing the web, one scan at a time.</p>
        </div>
      </div>
    </footer>
  )
}
