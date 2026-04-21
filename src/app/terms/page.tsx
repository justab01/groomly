import Link from 'next/link'
import { PawPrint } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <PawPrint className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Groomly</span>
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: April 2026</p>

        <div className="prose prose-gray max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Groomly (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use the Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            Groomly provides booking and business management software for mobile pet grooming businesses.
            The Service includes online booking, customer management, payment processing, and communication tools.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            You must provide accurate and complete information when creating an account. You are responsible
            for maintaining the security of your account and any activities that occur under your account.
          </p>

          <h2>4. Subscription and Payment</h2>
          <p>
            Groomly operates on a subscription basis. By subscribing, you agree to pay the monthly or annual
            fee associated with your plan. All payments are processed securely through Stripe.
          </p>
          <ul>
            <li>Monthly subscription: $39/month</li>
            <li>Annual subscription: $390/year (2 months free)</li>
            <li>Payment processing fees: 2.9% + $0.30 per transaction (paid by customer)</li>
          </ul>

          <h2>5. Cancellation and Refunds</h2>
          <p>
            You may cancel your subscription at any time. Upon cancellation, you will retain access to the
            Service until the end of your current billing period. We do not provide refunds for partial
            months or years.
          </p>

          <h2>6. User Data</h2>
          <p>
            You own all data you upload to Groomly, including customer information, booking records, and
            business data. We will not sell or share your data with third parties except as required to
            provide the Service (e.g., payment processing through Stripe).
          </p>

          <h2>7. Acceptable Use</h2>
          <p>You agree not to use Groomly for any illegal purpose or in violation of any laws.</p>

          <h2>8. Intellectual Property</h2>
          <p>
            The Groomly name, logo, and all related trademarks are the property of Groomly. You may not
            use our trademarks without written permission.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            Groomly is provided &quot;as is&quot; without warranties of any kind. We are not liable for any indirect,
            incidental, or consequential damages arising from your use of the Service.
          </p>

          <h2>10. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. We will notify you of any material changes via
            email or through the Service.
          </p>

          <h2>11. Contact</h2>
          <p>
            If you have questions about these Terms, please contact us at{' '}
            <a href="mailto:legal@groomly.com">legal@groomly.com</a>.
          </p>
        </div>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <Link href="/terms" className="hover:text-gray-900">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
            <Link href="/" className="hover:text-gray-900">Back to Home</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}