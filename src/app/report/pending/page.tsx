export default function PaymentPending() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <div className="text-5xl">⏳</div>
        <h1 className="text-2xl font-bold text-white">Payment Pending</h1>
        <p className="text-gray-400">
          Your payment is being processed. We&apos;ll send your report once the payment is confirmed.
        </p>
        <a href="/" className="inline-block mt-4 px-6 py-3 bg-cyber-green/20 border border-cyber-green/30 text-cyber-green rounded-xl hover:bg-cyber-green/30 transition-all">
          ← Back to WebSecCheck
        </a>
      </div>
    </main>
  )
}
