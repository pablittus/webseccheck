export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <h1 className="text-4xl font-black text-white mb-8">Terms of Service</h1>
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-gray-300 leading-relaxed">
        <p className="text-gray-400 text-sm">Last updated: February 2026</p>

        <h2 className="text-xl font-bold text-white mt-8">1. Acceptance of Terms</h2>
        <p>By using WebSecCheck, you agree to these terms. Our service provides automated web security scanning and assessment. You must be at least 18 years old or have parental consent to use this service.</p>

        <h2 className="text-xl font-bold text-white mt-8">2. Authorized Use</h2>
        <p>You may only scan websites that you own or have explicit written authorization to test. Unauthorized scanning of third-party websites is prohibited and may violate applicable laws. You are solely responsible for ensuring you have proper authorization.</p>

        <h2 className="text-xl font-bold text-white mt-8">3. Free Scan Service</h2>
        <p>Our free scan performs passive, non-intrusive security checks against publicly accessible endpoints. Free scans are limited and may be rate-limited. Results are provided as-is for informational purposes.</p>

        <h2 className="text-xl font-bold text-white mt-8">4. Paid Services</h2>
        <p>Security Reports and Penetration Tests are governed by separate service agreements provided at the time of purchase. Paid reports include a 30-day money-back guarantee. Penetration tests require a signed authorization form before commencement.</p>

        <h2 className="text-xl font-bold text-white mt-8">5. Disclaimer</h2>
        <p>Our scans provide a point-in-time assessment and do not guarantee complete security. We are not liable for any damages resulting from vulnerabilities not detected by our tools. Security is an ongoing process — we recommend regular assessments.</p>

        <h2 className="text-xl font-bold text-white mt-8">6. Limitation of Liability</h2>
        <p>WebSecCheck&apos;s total liability shall not exceed the amount paid for the specific service in question. We are not liable for indirect, incidental, or consequential damages.</p>

        <h2 className="text-xl font-bold text-white mt-8">7. Responsible Disclosure</h2>
        <p>If our scans discover critical vulnerabilities, we will report findings only to you (the authorized user). We follow responsible disclosure principles and will never publicly disclose your vulnerabilities.</p>

        <h2 className="text-xl font-bold text-white mt-8">8. Modifications</h2>
        <p>We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of modified terms. We will notify registered users of material changes via email.</p>

        <h2 className="text-xl font-bold text-white mt-8">9. Contact</h2>
        <p>For questions about these terms: legal@webseccheck.com</p>
      </div>
    </div>
  )
}
