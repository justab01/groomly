import Link from 'next/link'
import { PawPrint, Calendar, CreditCard, Mail, Check, ArrowRight, Phone, Shield, Zap } from 'lucide-react'

export default function HonestDesignPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b sticky top-0 z-50 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <PawPrint className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Groomly</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/signin" className="text-gray-600 hover:text-gray-900 font-medium hidden sm:block">
                Sign in
              </Link>
              <Link href="/auth/signin" className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Booking software for
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> mobile dog groomers</span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Built to replace the spreadsheets, text messages, and missed appointments.
              Simple, affordable, and actually built for your business.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link
                href="/auth/signin"
                className="w-full sm:w-auto bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all hover:shadow-lg flex items-center justify-center gap-2"
              >
                Start free trial <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/b/demo-grooming"
                className="w-full sm:w-auto bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all border-2 border-gray-200 flex items-center justify-center gap-2"
              >
                Try live demo
              </Link>
            </div>

            <p className="text-sm text-gray-500">No credit card required • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What you get</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to run your booking and payments. Nothing you don't.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Calendar}
              iconBg="from-indigo-500 to-purple-500"
              title="Online Booking"
              description="Clients book appointments 24/7 from their phone. You get notified instantly. No more phone tag."
              benefits={["Calendar sync", "Buffer times", "Recurring bookings"]}
            />
            <FeatureCard
              icon={CreditCard}
              iconBg="from-green-500 to-emerald-500"
              title="Deposits & Payments"
              description="Require a deposit to book. Reduces no-shows dramatically. Tap-to-pay when you arrive."
              benefits={["Card on file", "Automatic receipts", "Refund handling"]}
            />
            <FeatureCard
              icon={Mail}
              iconBg="from-blue-500 to-cyan-500"
              title="Automated Reminders"
              description="SMS and email reminders go out automatically. Clients show up. You don't have to think about it."
              benefits={["Custom messages", "Delivery tracking", "Reply handling"]}
            />
            <FeatureCard
              icon={PawPrint}
              iconBg="from-orange-500 to-red-500"
              title="Pet Profiles"
              description="Track breed, weight, behavior notes, and medical alerts. Remember every client's preferences."
              benefits={["Photo storage", "Grooming history", "Behavior flags"]}
            />
            <FeatureCard
              icon={Shield}
              iconBg="from-purple-500 to-pink-500"
              title="Smart Pricing"
              description="Set different prices by breed, weight, or coat condition. Charge what you're worth."
              benefits={["Breed multipliers", "Weight brackets", "Add-on services"]}
            />
            <FeatureCard
              icon={Zap}
              iconBg="from-yellow-500 to-orange-500"
              title="Your Own Booking Page"
              description="Get a custom link to share on Instagram, your website, everywhere. Your brand, your clients."
              benefits={["Custom branding", "Your colors", "No competitor ads"]}
            />
          </div>
        </div>
      </section>

      {/* Why this exists */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Why this exists</h2>
          <div className="prose prose-lg mx-auto text-gray-600">
            <p>
              Most booking software was built for salons. You work out of a van.
              That's a different business.
            </p>
            <p>
              You need route optimization, not a reception desk.
              You need deposit protection, not a waiting room.
              You need breed-based pricing, not a service menu.
            </p>
            <p>
              Groomly is built for mobile groomers, specifically.
              Nothing more, nothing less.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How it works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <Step number={1} title="Sign up" description="Create your account in 2 minutes. No credit card needed to start." />
            <Step number={2} title="Set up your services" description="Add your services, set your prices, define your working hours." />
            <Step number={3} title="Share your link" description="Send clients your booking page. They book, you get notified. Done." />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Pricing</h2>
            <p className="text-lg text-gray-600">Less than one grooming session per month</p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-indigo-600 p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Pro</h3>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-gray-900">$39</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">or $390/year (2 months free)</p>
              </div>
              <ul className="space-y-4 mb-8">
                <PricingFeature>Unlimited bookings</PricingFeature>
                <PricingFeature>Unlimited customers</PricingFeature>
                <PricingFeature>Unlimited SMS reminders</PricingFeature>
                <PricingFeature>Route optimization</PricingFeature>
                <PricingFeature>Breed-based pricing</PricingFeature>
                <PricingFeature>Payment processing</PricingFeature>
                <PricingFeature>White-label booking page</PricingFeature>
                <PricingFeature>Analytics dashboard</PricingFeature>
              </ul>
              <Link
                href="/auth/signin"
                className="block w-full bg-indigo-600 text-white text-center py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              >
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-12 text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to try it?</h2>
            <p className="text-xl text-indigo-100 mb-8">
              See how it works. No commitment required.
            </p>
            <Link
              href="/auth/signin"
              className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-lg"
            >
              Get started free
            </Link>
            <p className="text-sm text-indigo-200 mt-4">Free trial • No credit card required</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <PawPrint className="h-4 w-4 text-white" />
                </div>
                <span className="text-white font-bold">Groomly</span>
              </div>
              <p className="text-sm">
                Booking software for mobile dog groomers.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white">Features</Link></li>
                <li><Link href="#" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/b/demo-grooming" className="hover:text-white">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white">About</Link></li>
                <li><Link href="#" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>&copy; 2026 Groomly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, iconBg, title, description, benefits }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
      <div className={`w-14 h-14 bg-gradient-to-br ${iconBg} rounded-xl flex items-center justify-center mb-4`}>
        <Icon className="h-7 w-7 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 leading-relaxed">{description}</p>
      <ul className="space-y-2">
        {benefits.map((benefit: string, i: number) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            {benefit}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl font-bold text-white">{number}</span>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}

function PricingFeature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
        <Check className="h-3 w-3 text-green-600" />
      </div>
      <span className="text-gray-700">{children}</span>
    </li>
  )
}
