export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <h1 className="text-4xl font-black text-white mb-8">Privacy Policy</h1>
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-gray-300 leading-relaxed">
        <p className="text-gray-400 text-sm">Last updated: February 2026</p>

        <h2 className="text-xl font-bold text-white mt-8">1. Information We Collect</h2>
        <p>When you use our scanning service, we collect the URL you submit for analysis. We perform security checks against publicly accessible endpoints only. We do not access private areas of your website, databases, or internal systems during free scans.</p>

        <h2 className="text-xl font-bold text-white mt-8">2. How We Use Your Information</h2>
        <p>URLs submitted are used solely to perform the requested security assessment. Scan results are generated in real-time and provided directly to you. We may retain anonymized, aggregate scan statistics to improve our scanning engine.</p>

        <h2 className="text-xl font-bold text-white mt-8">3. Data Retention</h2>
        <p>Free scan results are retained for 30 days and then automatically deleted. Paid report data is retained for 12 months or until you request deletion. We do not sell, rent, or share your scan data with third parties.</p>

        <h2 className="text-xl font-bold text-white mt-8">4. Security</h2>
        <p>All data in transit is encrypted using TLS 1.3. Data at rest is encrypted using AES-256. Our infrastructure is hosted in SOC 2 compliant data centers. We conduct regular security assessments of our own platform.</p>

        <h2 className="text-xl font-bold text-white mt-8">5. Cookies</h2>
        <p>We use essential cookies for session management. We do not use third-party tracking cookies or advertising pixels. Analytics, if used, are privacy-respecting and cookieless.</p>

        <h2 className="text-xl font-bold text-white mt-8">6. Your Rights</h2>
        <p>You have the right to access, correct, or delete your data at any time. You can request a copy of all data we hold about you. To exercise these rights, contact us at privacy@webseccheck.com.</p>

        <h2 className="text-xl font-bold text-white mt-8">7. Penetration Testing</h2>
        <p>For paid penetration tests, we require explicit written authorization before conducting any active testing. All findings are shared exclusively with the authorized contact. NDA agreements are available and recommended.</p>

        <h2 className="text-xl font-bold text-white mt-8">8. Contact</h2>
        <p>For privacy-related inquiries: privacy@webseccheck.com</p>
      </div>
    </div>
  )
}
