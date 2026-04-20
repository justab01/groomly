import Link from 'next/link'
import { PawPrint, Calendar, CreditCard, Mail, Check, ArrowRight, Star, Phone } from 'lucide-react'

export default function DesignOptionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-bold">Groomly Design Options</span>
            </div>
            <p className="text-sm text-gray-500">Choose your favorite style</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Option 1 */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Option 1: Modern Minimal</h2>
            <p className="text-gray-600">Clean, professional, Stripe-inspired design</p>
          </div>
          <div className="border-2 border-gray-200 rounded-2xl overflow-hidden">
            <DesignOption1 />
          </div>
          <div className="mt-4 flex gap-4 justify-center">
            <Link href="/design/option1" className="text-blue-600 hover:underline font-medium">
              View Full Page →
            </Link>
          </div>
        </section>

        {/* Option 2 */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Option 2: Playful & Colorful</h2>
            <p className="text-gray-600">Fun, pet-friendly with gradients and personality</p>
          </div>
          <div className="border-2 border-gray-200 rounded-2xl overflow-hidden">
            <DesignOption2 />
          </div>
          <div className="mt-4 flex gap-4 justify-center">
            <Link href="/design/option2" className="text-blue-600 hover:underline font-medium">
              View Full Page →
            </Link>
          </div>
        </section>

        {/* Option 3 */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Option 3: Bold Professional</h2>
            <p className="text-gray-600">Enterprise SaaS with dark mode aesthetic</p>
          </div>
          <div className="border-2 border-gray-200 rounded-2xl overflow-hidden">
            <DesignOption3 />
          </div>
          <div className="mt-4 flex gap-4 justify-center">
            <Link href="/design/option3" className="text-blue-600 hover:underline font-medium">
              View Full Page →
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

// Option 1: Modern Minimal
function DesignOption1() {
  return (
    <div className="bg-white">
      <div className="py-16 px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-600 mb-6">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Trusted by 500+ groomers
        </div>
        <h1 className="text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
          Booking software for<br />mobile dog groomers
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          The all-in-one platform to manage bookings, payments, and customer communication.
          Start your 14-day free trial today.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
            Start free trial <ArrowRight className="h-4 w-4" />
          </button>
          <button className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            Watch demo
          </button>
        </div>
        <div className="flex items-center justify-center gap-1 mt-8">
          {[1,2,3,4,5].map(i => <Star key={i} className="h-5 w-5 fill-gray-900 text-gray-900" />)}
          <span className="ml-2 text-sm text-gray-600">4.9/5 from 200+ reviews</span>
        </div>
      </div>
      <div className="bg-gray-50 py-12 px-8">
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard1 icon={Calendar} title="Smart Scheduling" desc="Never double-book with intelligent calendar management." />
          <FeatureCard1 icon={CreditCard} title="Secure Payments" desc="Take deposits and reduce no-shows by 80%." />
          <FeatureCard1 icon={Mail} title="Auto Reminders" desc="SMS and email reminders sent automatically." />
        </div>
      </div>
    </div>
  )
}

function FeatureCard1({ icon: Icon, title, desc }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
        <Icon className="h-5 w-5 text-gray-700" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
    </div>
  )
}

// Option 2: Playful & Colorful
function DesignOption2() {
  return (
    <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="py-16 px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-6xl">🐾</div>
          <div className="absolute top-20 right-20 text-6xl">🐕</div>
          <div className="absolute bottom-10 left-1/3 text-6xl">🦴</div>
          <div className="absolute bottom-20 right-1/4 text-6xl">🐩</div>
        </div>
        <div className="relative">
          <div className="text-6xl mb-4">🐕</div>
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Grow Your Grooming Biz
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            The fun, easy way to book appointments, get paid, and keep customers happy!
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2">
              Start Free Trial <ArrowRight className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-1 mt-8">
            {[1,2,3,4,5].map(i => <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />)}
            <span className="ml-2 text-sm text-white font-medium">Loved by 500+ groomers</span>
          </div>
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-sm py-12 px-8">
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard2 icon={Calendar} title="Easy Booking" desc="Customers book 24/7 while you sleep!" />
          <FeatureCard2 icon={CreditCard} title="Get Paid Fast" desc="Secure deposits before you arrive" />
          <FeatureCard2 icon={Phone} title="Auto Reminders" desc="No more no-shows!" />
        </div>
      </div>
    </div>
  )
}

function FeatureCard2({ icon: Icon, title, desc }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 text-center shadow-xl">
      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="h-7 w-7 text-white" />
      </div>
      <h3 className="font-bold text-gray-900 mb-2 text-lg">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  )
}

// Option 3: Bold Professional
function DesignOption3() {
  return (
    <div className="bg-slate-950">
      <div className="py-16 px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-lg text-sm text-indigo-400 mb-6">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
          Enterprise-grade booking platform
        </div>
        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
          The OS for Mobile<br />Grooming Businesses
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          Professional-grade tools for scheduling, payments, and customer management.
          Built for serious business owners.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-500 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/25">
            Start free trial <ArrowRight className="h-4 w-4" />
          </button>
          <button className="bg-slate-800 text-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-slate-700 transition-colors border border-slate-700">
            View pricing
          </button>
        </div>
        <div className="grid grid-cols-3 gap-8 mt-12 max-w-3xl mx-auto pt-8 border-t border-slate-800">
          <div>
            <div className="text-3xl font-bold text-white">500+</div>
            <div className="text-sm text-gray-500 mt-1">Active businesses</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">$50M+</div>
            <div className="text-sm text-gray-500 mt-1">Payments processed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">99.9%</div>
            <div className="text-sm text-gray-500 mt-1">Uptime SLA</div>
          </div>
        </div>
      </div>
      <div className="bg-slate-900 py-12 px-8 border-t border-slate-800">
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard3 icon={Calendar} title="Intelligent Scheduling" desc="AI-powered route optimization and conflict detection." />
          <FeatureCard3 icon={CreditCard} title="Payment Infrastructure" desc="Stripe-powered payments with fraud protection." />
          <FeatureCard3 icon={Mail} title="Automated Comms" desc="Multi-channel notifications with delivery tracking." />
        </div>
      </div>
    </div>
  )
}

function FeatureCard3({ icon: Icon, title, desc }: any) {
  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
      <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
        <Icon className="h-5 w-5 text-indigo-400" />
      </div>
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
    </div>
  )
}
