import Link from 'next/link'
import { PawPrint } from 'lucide-react'

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: April 2026</p>

        <div className="prose prose-gray max-w-none">
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us:</p>
          <ul>
            <li><strong>Account Information:</strong> Name, email, phone number, business details</li>
            <li><strong>Customer Data:</strong> Names, contact info, pet information you add to your account</li>
            <li><strong>Payment Information:</strong> Processed securely through Stripe (we do not store card numbers)</li>
            <li><strong>Usage Data:</strong> How you interact with the Service for improvement purposes</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve the Service</li>
            <li>Process payments and send transaction confirmations</li>
            <li>Send booking reminders and notifications</li>
            <li>Respond to your comments, questions, and support requests</li>
            <li>Communicate with you about product updates and new features</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>We do not sell your personal information. We share information only:</p>
          <ul>
            <li>With service providers who process data on our behalf (Stripe, Resend, Supabase)</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and safety</li>
            <li>With your consent</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data, including encryption
            at rest and in transit, secure authentication, and regular security audits. All data is
            stored securely on Supabase infrastructure.
          </p>

          <h2>5. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active. You can export or delete your
            data at any time. After account deletion, data is removed within 30 days.
          </p>

          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access and export your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and associated data</li>
            <li>Object to processing of your data</li>
            <li>Data portability</li>
          </ul>

          <h2>7. Cookies</h2>
          <p>
            We use essential cookies to authenticate users and remember preferences. We do not use
            tracking cookies or third-party advertising cookies.
          </p>

          <h2>8. Third-Party Services</h2>
          <p>Groomly integrates with:</p>
          <ul>
            <li><strong>Stripe:</strong> For payment processing. See stripe.com/privacy</li>
            <li><strong>Supabase:</strong> For data storage. See supabase.com/privacy</li>
            <li><strong>Resend:</strong> For email delivery. See resend.com/privacy</li>
          </ul>

          <h2>9. Children&apos;s Privacy</h2>
          <p>
            Groomly is not intended for children under 13. We do not knowingly collect information
            from children under 13.
          </p>

          <h2>10. Changes to Privacy Policy</h2>
          <p>
            We may update this policy from time to time. We will notify you of any material changes
            via email or through the Service.
          </p>

          <h2>11. Contact</h2>
          <p>
            For privacy-related questions or to exercise your rights, contact us at{' '}
            <a href="mailto:privacy@groomly.com">privacy@groomly.com</a>.
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