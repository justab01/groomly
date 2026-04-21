# Groomly Full Build Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Groomly from 72% complete to a fully functional, sale-ready SaaS that rivals Booksy.

**Architecture:** Next.js 16 App Router with Supabase (PostgreSQL + Auth), Stripe payments, Resend emails. Client-side uses React Query for caching, Supabase client for real-time updates. Server-side API routes handle webhooks and privileged operations.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS 4, Supabase (PostgreSQL + Auth), Stripe, Resend, React Hook Form, Zod, Lucide Icons

---

## File Structure Map

```
src/
├── app/
│   ├── page.tsx                    # Landing page (95% done)
│   ├── layout.tsx                  # Root layout
│   ├── auth/signin/page.tsx        # Auth page (100% done)
│   ├── dashboard/
│   │   ├── page.tsx                # Main dashboard - NEEDS DB WIRE
│   │   ├── customers/page.tsx      # CRM - NEEDS DB WIRE
│   │   └── services/page.tsx       # Services CRUD (100% done)
│   ├── onboarding/page.tsx         # Onboarding - NEEDS BUSINESS CREATION
│   ├── b/[slug]/
│   │   ├── page.tsx                # Booking page router (100% done)
│   │   └── booking-page.tsx        # Booking flow - NEEDS API INTEGRATION
│   ├── api/
│   │   ├── bookings/route.ts       # Booking API (needs notification trigger)
│   │   ├── notifications/send/route.ts  # Email API (100% done)
│   │   └── stripe/                 # Stripe routes (100% done)
│   ├── terms/page.tsx              # NEW: Terms of Service
│   ├── privacy/page.tsx            # NEW: Privacy Policy
│   └── legal/page.tsx              # NEW: Legal hub
├── components/
│   ├── ui/
│   │   ├── button.tsx              # NEW: Reusable button
│   │   ├── card.tsx                # NEW: Reusable card
│   │   ├── input.tsx               # NEW: Form input
│   │   ├── modal.tsx               # NEW: Modal component
│   │   ├── skeleton.tsx            # NEW: Loading skeleton
│   │   └── calendar.tsx            # (exists)
│   └── brand/
│       └── logo.tsx                # NEW: Logo component
└── lib/
    ├── supabase/
    │   ├── client.ts               # Browser client (exists)
    │   ├── server.ts               # Server client (exists)
    │   └── middleware.ts           # Auth middleware (exists)
    ├── utils.ts                    # Utilities (exists)
    ├── validations.ts              # NEW: Zod schemas
    └── constants.ts                # NEW: App constants
public/
├── logo.svg                        # NEW: Brand logo
└── favicon.ico                    # NEW: Custom favicon
```

---

## PHASE 1: Foundation (Environment & Data Wiring)

### Task 1.1: Environment Configuration

**Files:**
- Create: `.env.example`
- Create: `.env.local` (gitignored, for user to fill)

- [ ] **Step 1: Create .env.example file**

Create `/Users/abrahamsadiq/groomly/.env.example`:

```env
# Supabase (get from: supabase.com/dashboard/project/YOUR_PROJECT/settings/api)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Stripe (get from: dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Resend (get from: resend.com/api-keys)
RESEND_API_KEY=re_xxx

# App URL (change for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 2: Create placeholder .env.local**

Create `/Users/abrahamsadiq/groomly/.env.local`:

```env
# Supabase - UPDATE THESE WITH YOUR KEYS
NEXT_PUBLIC_SUPABASE_URL=https://omhvhjcxuwacaitjtqml.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=PLACEHOLDER_GET_FROM_SUPABASE
SUPABASE_SERVICE_ROLE_KEY=PLACEHOLDER_GET_FROM_SUPABASE

# Stripe Test Mode
STRIPE_SECRET_KEY=sk_test_PLACEHOLDER
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_PLACEHOLDER
STRIPE_WEBHOOK_SECRET=whsec_PLACEHOLDER

# Resend
RESEND_API_KEY=re_PLACEHOLDER

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 3: Update Supabase client fallbacks**

Modify `/Users/abrahamsadiq/groomly/src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || url === 'https://dummy.supabase.co') {
    console.warn('Supabase environment variables not configured. Using demo mode.')
  }

  return createBrowserClient(
    url || 'https://dummy.supabase.co',
    key || 'dummy-key'
  )
}
```

- [ ] **Step 4: Commit environment setup**

```bash
cd /Users/abrahamsadiq/groomly
git add .env.example src/lib/supabase/client.ts
git commit -m "feat: add environment configuration"
```

---

### Task 1.2: Wire Dashboard to Real Data

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Add Supabase imports and hooks**

Modify `/Users/abrahamsadiq/groomly/src/app/dashboard/page.tsx` - replace the entire file:

```tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Calendar, DollarSign, Users, TrendingUp, Clock, Plus, PawPrint, MapPin, Phone, Mail, ChevronRight, Star, Filter, Download } from 'lucide-react'

interface Booking {
  id: string
  scheduled_date: string
  scheduled_time: string
  duration_minutes: number
  total_price_cents: number
  status: string
  notes: string | null
  service: { name: string }
  customer: { name: string; phone: string; address: string }
  pet: { name: string; breed: string | null }
}

interface Customer {
  id: string
  name: string
  phone: string
  email: string | null
  pets: { name: string }[]
  bookings: { total_price_cents: number }[]
}

interface Business {
  id: string
  name: string
  slug: string
}

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), [])
  const [business, setBusiness] = useState<Business | null>(null)
  const [todayBookings, setTodayBookings] = useState<Booking[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([])
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    todayRevenue: 0,
    todayBookings: 0,
    weekRevenue: 0,
    weekBookings: 0,
    monthRevenue: 0,
    monthBookings: 0,
    noShowRate: 0,
    avgTicket: 0,
  })

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Get business
      const { data: businessData } = await supabase
        .from('businesses')
        .select('id, name, slug')
        .eq('owner_email', user.email)
        .single()

      if (!businessData) {
        setLoading(false)
        return
      }

      setBusiness(businessData)

      // Get today's date
      const today = new Date().toISOString().split('T')[0]
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      // Fetch today's bookings
      const { data: todayData } = await supabase
        .from('bookings')
        .select(`
          id,
          scheduled_date,
          scheduled_time,
          duration_minutes,
          total_price_cents,
          status,
          notes,
          service:services(name),
          customer:customers(name, phone, address),
          pet:pets(name, breed)
        `)
        .eq('business_id', businessData.id)
        .eq('scheduled_date', today)
        .order('scheduled_time', { ascending: true })

      setTodayBookings((todayData || []) as unknown as Booking[])

      // Fetch upcoming bookings (next 7 days, excluding today)
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const { data: upcomingData } = await supabase
        .from('bookings')
        .select(`
          id,
          scheduled_date,
          scheduled_time,
          duration_minutes,
          total_price_cents,
          status,
          service:services(name),
          customer:customers(name),
          pet:pets(name)
        `)
        .eq('business_id', businessData.id)
        .gte('scheduled_date', tomorrow)
        .lte('scheduled_date', nextWeek)
        .order('scheduled_date', { ascending: true })
        .limit(10)

      setUpcomingBookings((upcomingData || []) as unknown as Booking[])

      // Fetch recent customers with their booking stats
      const { data: customersData } = await supabase
        .from('customers')
        .select(`
          id,
          name,
          phone,
          email,
          pets:pets(name),
          bookings:bookings(total_price_cents)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentCustomers((customersData || []) as unknown as Customer[])

      // Calculate stats
      const { data: weekBookings } = await supabase
        .from('bookings')
        .select('total_price_cents, status')
        .eq('business_id', businessData.id)
        .gte('scheduled_date', weekAgo)

      const { data: monthBookings } = await supabase
        .from('bookings')
        .select('total_price_cents, status')
        .eq('business_id', businessData.id)
        .gte('scheduled_date', monthAgo)

      const todayRevenue = (todayData || []).reduce((sum: number, b: any) => sum + (b.total_price_cents || 0), 0)
      const weekRevenue = (weekBookings || []).reduce((sum: number, b: any) => sum + (b.total_price_cents || 0), 0)
      const monthRevenue = (monthBookings || []).reduce((sum: number, b: any) => sum + (b.total_price_cents || 0), 0)
      const monthCount = (monthBookings || []).length
      const noShows = (monthBookings || []).filter((b: any) => b.status === 'no_show').length
      const noShowRate = monthCount > 0 ? ((noShows / monthCount) * 100).toFixed(1) : '0'

      setStats({
        todayRevenue: todayRevenue / 100,
        todayBookings: (todayData || []).length,
        weekRevenue: weekRevenue / 100,
        weekBookings: (weekBookings || []).length,
        monthRevenue: monthRevenue / 100,
        monthBookings: monthCount,
        noShowRate: parseFloat(noShowRate as unknown as string),
        avgTicket: monthCount > 0 ? Math.round(monthRevenue / 100 / monthCount) : 0,
      })

      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <PawPrint className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No business found</h1>
          <p className="text-gray-600 mb-6">Create your business to get started.</p>
          <Link
            href="/onboarding"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
          >
            Set up your business
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <PawPrint className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{business.name}</h1>
                <p className="text-sm text-gray-500">
                  {stats.todayBookings > 0 
                    ? `You have ${stats.todayBookings} appointments today.`
                    : 'No appointments today'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/bookings/new"
                className="bg-gray-900 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Booking</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={DollarSign}
            iconBg="from-green-500 to-emerald-500"
            label="Today's Revenue"
            value={`$${stats.todayRevenue}`}
            trend={stats.todayRevenue > 0 ? '+vs yesterday' : undefined}
            trendUp={stats.todayRevenue > 0}
          />
          <StatCard
            icon={Calendar}
            iconBg="from-blue-500 to-cyan-500"
            label="Today's Bookings"
            value={stats.todayBookings.toString()}
            subtext={`${stats.weekBookings} this week`}
          />
          <StatCard
            icon={TrendingUp}
            iconBg="from-purple-500 to-pink-500"
            label="This Month"
            value={`$${stats.monthRevenue.toLocaleString()}`}
            subtext={`${stats.monthBookings} bookings`}
          />
          <StatCard
            icon={Clock}
            iconBg="from-orange-500 to-red-500"
            label="No-Show Rate"
            value={`${stats.noShowRate}%`}
            subtext={`$${stats.avgTicket} avg ticket`}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column - Today's Route */}
          <div className="lg:col-span-2 space-y-8">
            {/* Today's Schedule */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Today's Route</h2>
                  <p className="text-sm text-gray-500">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {todayBookings.length === 0 ? (
                <div className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No appointments today</h3>
                  <p className="text-gray-500 mt-1">Enjoy your free time or add a manual booking</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {todayBookings.map((apt, index) => (
                    <div key={apt.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="text-center min-w-[72px]">
                          <div className="text-lg font-semibold text-gray-900">{apt.scheduled_time}</div>
                          {index < todayBookings.length - 1 && (
                            <div className="w-0.5 h-12 bg-gray-200 mx-auto mt-2"></div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                                <PawPrint className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{apt.pet?.name || 'Unknown'}</div>
                                <div className="text-sm text-gray-500">
                                  {apt.pet?.breed || 'Mixed'} • {apt.service?.name || 'Service'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">${(apt.total_price_cents / 100).toFixed(2)}</div>
                              <StatusBadge status={apt.status} />
                            </div>
                          </div>

                          <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {apt.customer?.address || 'No address'}
                            </div>
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            <a 
                              href={`tel:${apt.customer?.phone}`} 
                              className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-200 transition-colors"
                            >
                              <Phone className="h-3 w-3 inline mr-1" />
                              Call
                            </a>
                            <button className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-200 transition-colors">
                              <Mail className="h-3 w-3 inline mr-1" />
                              Message
                            </button>
                            <button className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors">
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {todayBookings.length > 0 && (
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-600">
                      <span className="font-semibold text-gray-900">{todayBookings.length}</span> appointments
                    </div>
                    <div className="font-semibold text-gray-900">
                      ${todayBookings.reduce((acc, apt) => acc + apt.total_price_cents / 100, 0).toFixed(2)} est. revenue
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Upcoming Bookings */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Bookings</h2>
              </div>
              {upcomingBookings.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No upcoming bookings in the next week
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {booking.pet?.name || 'Pet'} <span className="text-gray-500 font-normal">({booking.customer?.name || 'Customer'})</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(booking.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {booking.scheduled_time} • {booking.service?.name || 'Service'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="font-semibold text-gray-900">${(booking.total_price_cents / 100).toFixed(2)}</div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Plus className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span className="font-medium text-gray-700">Create manual booking</span>
                </button>
                <Link 
                  href="/dashboard/customers" 
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="font-medium text-gray-700">View customers</span>
                </Link>
                <Link 
                  href="/dashboard/services" 
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <PawPrint className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="font-medium text-gray-700">Manage services</span>
                </Link>
              </div>
            </div>

            {/* Recent Customers */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Recent Customers</h3>
                <Link href="/dashboard/customers" className="text-sm text-indigo-600 hover:underline font-medium">
                  View all
                </Link>
              </div>
              {recentCustomers.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No customers yet
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentCustomers.slice(0, 4).map((customer) => (
                    <div key={customer.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{customer.name}</div>
                            <div className="text-xs text-gray-500">
                              {customer.pets?.map((p: any) => p.name).join(', ') || 'No pets'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium text-gray-700">{customer.bookings?.length || 0}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          ${customer.bookings?.reduce((sum: number, b: any) => sum + (b.total_price_cents || 0), 0) / 100 || 0} total
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Performance Insights */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="font-semibold mb-4">This Week's Performance</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-indigo-100">Revenue</span>
                    <span className="font-semibold">${stats.weekRevenue}</span>
                  </div>
                  <div className="w-full bg-indigo-800 rounded-full h-2">
                    <div className="bg-white rounded-full h-2" style={{ width: `${Math.min((stats.weekRevenue / 4500) * 100, 100)}%` }}></div>
                  </div>
                  <p className="text-xs text-indigo-200 mt-1">{Math.round((stats.weekRevenue / 4500) * 100)}% of $4,500 goal</p>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-indigo-100">Bookings</span>
                    <span className="font-semibold">{stats.weekBookings}</span>
                  </div>
                  <div className="w-full bg-indigo-800 rounded-full h-2">
                    <div className="bg-white rounded-full h-2" style={{ width: `${Math.min((stats.weekBookings / 40) * 100, 100)}%` }}></div>
                  </div>
                  <p className="text-xs text-indigo-200 mt-1">{Math.round((stats.weekBookings / 40) * 100)}% of 40 booking goal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ icon: Icon, iconBg, label, value, trend, trendUp, subtext }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 bg-gradient-to-br ${iconBg} rounded-lg flex items-center justify-center`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {trend && (
          <div className={`text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
      {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-gray-100 text-gray-700',
    no_show: 'bg-red-100 text-red-700',
  }

  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.pending}`}>
      {status.replace('_', ' ')}
    </span>
  )
}
```

- [ ] **Step 2: Test dashboard loads**

```bash
cd /Users/abrahamsadiq/groomly
npm run dev
```

Open http://localhost:3000/dashboard and verify:
- Loading state shows
- Empty state shows if no business
- Data loads if business exists

- [ ] **Step 3: Commit dashboard wiring**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: wire dashboard to real Supabase data"
```

---

### Task 1.3: Wire Customers Page to Real Data

**Files:**
- Modify: `src/app/dashboard/customers/page.tsx`

- [ ] **Step 1: Replace mock data with Supabase queries**

Modify `/Users/abrahamsadiq/groomly/src/app/dashboard/customers/page.tsx` - replace the entire file:

```tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Users, Search, Filter, Download, Plus, Phone, Mail, Calendar, DollarSign, ChevronRight, Star, MoreVertical } from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string
  pets: { name: string }[]
  total_spent: number
  visits: number
  last_visit: string | null
  avg_ticket: number
  notes: string | null
}

export default function CustomersPage() {
  const supabase = useMemo(() => createClient(), [])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    avgLifetimeValue: 0,
    avgVisits: 0,
  })

  useEffect(() => {
    loadCustomers()
  }, [])

  async function loadCustomers() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_email', user.email)
        .single()

      if (!business) {
        setLoading(false)
        return
      }

      // Get all customers who have booked with this business
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          total_price_cents,
          scheduled_date,
          created_at,
          customer:customers(
            id,
            name,
            email,
            phone,
            notes,
            pets:pets(name)
          )
        `)
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })

      // Aggregate customer data
      const customerMap = new Map<string, Customer>()
      const now = new Date()
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

      let thisMonthCount = 0

      ;(bookingsData || []).forEach((booking: any) => {
        if (!booking.customer) return

        const customerId = booking.customer.id
        const existing = customerMap.get(customerId)

        if (existing) {
          existing.total_spent += booking.total_price_cents || 0
          existing.visits += 1
          if (booking.scheduled_date && (!existing.last_visit || booking.scheduled_date > existing.last_visit)) {
            existing.last_visit = booking.scheduled_date
          }
        } else {
          customerMap.set(customerId, {
            id: customerId,
            name: booking.customer.name,
            email: booking.customer.email,
            phone: booking.customer.phone,
            pets: booking.customer.pets || [],
            total_spent: booking.total_price_cents || 0,
            visits: 1,
            last_visit: booking.scheduled_date,
            avg_ticket: 0,
            notes: booking.customer.notes,
          })

          if (new Date(booking.created_at) > monthAgo) {
            thisMonthCount++
          }
        }
      })

      // Calculate avg ticket for each customer
      const customersList = Array.from(customerMap.values()).map(c => ({
        ...c,
        avg_ticket: c.visits > 0 ? Math.round(c.total_spent / 100 / c.visits) : 0,
      }))

      // Sort by total spent
      customersList.sort((a, b) => b.total_spent - a.total_spent)

      setCustomers(customersList)
      setStats({
        total: customersList.length,
        thisMonth: thisMonthCount,
        avgLifetimeValue: customersList.length > 0 
          ? Math.round(customersList.reduce((sum, c) => sum + c.total_spent, 0) / customersList.length / 100)
          : 0,
        avgVisits: customersList.length > 0
          ? Math.round(customersList.reduce((sum, c) => sum + c.visits, 0) / customersList.length * 10) / 10
          : 0,
      })
      setLoading(false)
    } catch (error) {
      console.error('Error loading customers:', error)
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.pets.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Customers</h1>
              <p className="text-sm text-gray-500">{stats.total} total customers • {stats.thisMonth} new this month</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                <Download className="h-4 w-4 text-gray-600" />
              </button>
              <Link
                href="/dashboard/customers/new"
                className="bg-gray-900 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Customer
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Customers</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">${stats.avgLifetimeValue}</div>
            <div className="text-sm text-gray-600">Avg Lifetime Value</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.avgVisits}</div>
            <div className="text-sm text-gray-600">Avg Visits/Customer</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.thisMonth}</div>
            <div className="text-sm text-gray-600">New This Month</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or pet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Customers Table */}
        {filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No customers yet</h3>
            <p className="text-gray-500 mt-1">Customers will appear here after their first booking</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-4">Customer</th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-4">Pets</th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-4">Contact</th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-4">Visits</th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-4">Total Spent</th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-4">Last Visit</th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-4">Avg Ticket</th>
                    <th className="text-right text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700 flex-shrink-0">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{customer.name}</div>
                            {customer.notes && (
                              <div className="text-xs text-gray-500 truncate max-w-[200px]">{customer.notes}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {customer.pets.map((pet, i) => (
                            <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                              {pet.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            {customer.phone}
                          </div>
                          {customer.email && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <Mail className="h-3.5 w-3.5 text-gray-400" />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{customer.visits}</span>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < Math.min(customer.visits, 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">${(customer.total_spent / 100).toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {customer.last_visit 
                            ? new Date(customer.last_visit).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : 'Never'
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">${customer.avgTicket}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/customers/${customer.id}`}
                            className="text-sm text-indigo-600 hover:underline font-medium"
                          >
                            View
                          </Link>
                          <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                            <MoreVertical className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium text-gray-900">{filteredCustomers.length}</span> customers
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Commit customers page wiring**

```bash
git add src/app/dashboard/customers/page.tsx
git commit -m "feat: wire customers page to real Supabase data"
```

---

### Task 1.4: Complete Onboarding Flow

**Files:**
- Modify: `src/app/onboarding/page.tsx`

- [ ] **Step 1: Add business creation logic**

Modify `/Users/abrahamsadiq/groomly/src/app/onboarding/page.tsx` - replace the `handleSubmit` function and add imports:

```tsx
'use client'

import { useState } from 'react'
import { PawPrint, Check, ArrowRight, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    businessName: '',
    slug: '',
    phone: '',
    city: '',
    state: '',
    services: [
      { name: 'Full Groom', description: 'Complete grooming including bath, haircut, nail trim, and ear cleaning', price: 85, duration: 90, selected: true },
      { name: 'Bath & Brush', description: 'Bath and blow dry with brushing', price: 55, duration: 60, selected: true },
      { name: 'Nail Trim', description: 'Nail clipping and filing', price: 25, duration: 20, selected: false },
    ]
  })

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('You must be signed in to create a business')
      }

      // Check if slug is available
      const { data: existingSlug } = await supabase
        .from('businesses')
        .select('slug')
        .eq('slug', formData.slug)
        .single()

      if (existingSlug) {
        throw new Error('This booking page URL is already taken. Please choose another.')
      }

      // Create business
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert([{
          name: formData.businessName,
          slug: formData.slug,
          owner_email: user.email,
          phone: formData.phone,
          city: formData.city,
          state: formData.state,
        }])
        .select()
        .single()

      if (businessError) throw businessError

      // Create services
      const selectedServices = formData.services.filter(s => s.selected)
      if (selectedServices.length > 0) {
        const { error: servicesError } = await supabase
          .from('services')
          .insert(selectedServices.map(s => ({
            business_id: business.id,
            name: s.name,
            description: s.description,
            base_price_cents: s.price * 100,
            base_duration_minutes: s.duration,
          })))

        if (servicesError) throw servicesError
      }

      // Create default business settings
      const { error: settingsError } = await supabase
        .from('business_settings')
        .insert([{
          business_id: business.id,
        }])

      if (settingsError) throw settingsError

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Error creating business:', err)
      setError(err.message || 'Failed to create business. Please try again.')
      setLoading(false)
    }
  }

  // ... rest of the component stays the same, just add error display
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Progress */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-4 mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= s
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s ? <Check className="h-5 w-5" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-16 h-1 mx-4 ${step > s ? 'bg-indigo-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="max-w-xl mx-auto px-4 mb-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      )}

      {/* Step 1: Business Info */}
      {step === 1 && (
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PawPrint className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Let's set up your business</h1>
              <p className="text-gray-600 mt-2">Tell us about your mobile grooming business</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => {
                    const name = e.target.value
                    setFormData({ 
                      ...formData, 
                      businessName: name,
                      slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30)
                    })
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Paws & Claws Mobile Grooming"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Booking Page URL
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">groomly.com/b/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="your-business"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Austin"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select state</option>
                  <option value="AL">Alabama</option>
                  <option value="AK">Alaska</option>
                  <option value="AZ">Arizona</option>
                  <option value="AR">Arkansas</option>
                  <option value="CA">California</option>
                  <option value="CO">Colorado</option>
                  <option value="CT">Connecticut</option>
                  <option value="DE">Delaware</option>
                  <option value="FL">Florida</option>
                  <option value="GA">Georgia</option>
                  <option value="HI">Hawaii</option>
                  <option value="ID">Idaho</option>
                  <option value="IL">Illinois</option>
                  <option value="IN">Indiana</option>
                  <option value="IA">Iowa</option>
                  <option value="KS">Kansas</option>
                  <option value="KY">Kentucky</option>
                  <option value="LA">Louisiana</option>
                  <option value="ME">Maine</option>
                  <option value="MD">Maryland</option>
                  <option value="MA">Massachusetts</option>
                  <option value="MI">Michigan</option>
                  <option value="MN">Minnesota</option>
                  <option value="MS">Mississippi</option>
                  <option value="MO">Missouri</option>
                  <option value="MT">Montana</option>
                  <option value="NE">Nebraska</option>
                  <option value="NV">Nevada</option>
                  <option value="NH">New Hampshire</option>
                  <option value="NJ">New Jersey</option>
                  <option value="NM">New Mexico</option>
                  <option value="NY">New York</option>
                  <option value="NC">North Carolina</option>
                  <option value="ND">North Dakota</option>
                  <option value="OH">Ohio</option>
                  <option value="OK">Oklahoma</option>
                  <option value="OR">Oregon</option>
                  <option value="PA">Pennsylvania</option>
                  <option value="RI">Rhode Island</option>
                  <option value="SC">South Carolina</option>
                  <option value="SD">South Dakota</option>
                  <option value="TN">Tennessee</option>
                  <option value="TX">Texas</option>
                  <option value="UT">Utah</option>
                  <option value="VT">Vermont</option>
                  <option value="VA">Virginia</option>
                  <option value="WA">Washington</option>
                  <option value="WV">West Virginia</option>
                  <option value="WI">Wisconsin</option>
                  <option value="WY">Wyoming</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!formData.businessName || !formData.phone || !formData.city || !formData.state || !formData.slug}
              className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Services */}
      {step === 2 && (
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Add your services</h1>
              <p className="text-gray-600 mt-2">Select the grooming services you offer</p>
            </div>

            <div className="space-y-4">
              {formData.services.map((service, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-500">{service.description}</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={service.selected}
                        onChange={(e) => {
                          const updated = [...formData.services]
                          updated[i].selected = e.target.checked
                          setFormData({ ...formData, services: updated })
                        }}
                        className="w-4 h-4 text-indigo-600 rounded" 
                      />
                      <span className="text-sm text-gray-600">Add</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Price ($)</label>
                      <input 
                        type="number" 
                        value={service.price}
                        onChange={(e) => {
                          const updated = [...formData.services]
                          updated[i].price = parseInt(e.target.value) || 0
                          setFormData({ ...formData, services: updated })
                        }}
                        className="w-full border rounded-lg px-3 py-2 text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Duration (min)</label>
                      <input 
                        type="number" 
                        value={service.duration}
                        onChange={(e) => {
                          const updated = [...formData.services]
                          updated[i].duration = parseInt(e.target.value) || 60
                          setFormData({ ...formData, services: updated })
                        }}
                        className="w-full border rounded-lg px-3 py-2 text-sm" 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.services.some(s => s.selected)}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Continue <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Complete */}
      {step === 3 && (
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Almost done!</h1>
              <p className="text-gray-600 mt-2">Review and create your business</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Summary:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    <strong>Business:</strong> {formData.businessName}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    <strong>Booking page:</strong> groomly.com/b/{formData.slug}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    <strong>Services:</strong> {formData.services.filter(s => s.selected).map(s => s.name).join(', ')}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    <strong>Location:</strong> {formData.city}, {formData.state}
                  </span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating your business...
                </>
              ) : (
                <>
                  Create Business <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            <p className="text-xs text-center text-gray-500 mt-4">
              You can connect Stripe later. 14-day free trial starts now.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit onboarding completion**

```bash
git add src/app/onboarding/page.tsx
git commit -m "feat: complete onboarding with business creation"
```

---

### Task 1.5: Wire Booking Flow to API

**Files:**
- Modify: `src/app/b/[slug]/booking-page.tsx`

- [ ] **Step 1: Add API integration to booking flow**

Modify `/Users/abrahamsadiq/groomly/src/app/b/[slug]/booking-page.tsx` - update the `handleSubmit` function:

```tsx
// Add these imports at the top
import { useState } from 'react'
import { Calendar as CalendarIcon, Clock, DollarSign, Check, ChevronRight, Loader2, PawPrint } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'

// ... existing interfaces ...

export default function BookingPage({ business }: BookingPageProps) {
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  })
  const [petInfo, setPetInfo] = useState({
    name: '',
    breed: '',
    weight: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get available times from business settings or use defaults
  const availableTimes = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ]

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      setError('Please complete all required fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const bookingData = {
        business_id: business.id,
        service_id: selectedService.id,
        scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
        scheduled_time: selectedTime,
        duration_minutes: selectedService.base_duration_minutes,
        total_price_cents: selectedService.base_price_cents,
        customer: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
        },
        pet: {
          name: petInfo.name,
          breed: petInfo.breed,
          weight: petInfo.weight ? parseInt(petInfo.weight) : null,
          notes: petInfo.notes,
        },
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        throw new Error('Failed to create booking. Please try again.')
      }

      setSuccess(true)
    } catch (err: any) {
      console.error('Booking error:', err)
      setError(err.message || 'Failed to create booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Update Step 4 to show success state
  // Replace the Step 4 section with:
  // ... (see full implementation below)
```

- [ ] **Step 2: Add success and error states to Step 4**

Update Step 4 in the booking page to handle states:

```tsx
{/* Step 4: Confirmation */}
{step === 4 && (
  <div>
    {success ? (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600 mb-6">
          We've sent a confirmation to {customerInfo.email || customerInfo.phone}
        </p>
        <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
          <div className="flex items-center gap-3 mb-3">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="font-medium">{format(selectedDate!, 'EEEE, MMMM d, yyyy')}</p>
              <p className="text-sm text-gray-500">{selectedTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PawPrint className="h-5 w-5 text-gray-400" />
            <div>
              <p className="font-medium">{selectedService?.name}</p>
              <p className="text-sm text-gray-500">{petInfo.name} • ${(selectedService?.base_price_cents / 100).toFixed(2)}</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          {business.name} will contact you to confirm the appointment.
        </p>
      </div>
    ) : (
      <>
        <h2 className="text-xl font-bold mb-4">Confirm Booking</h2>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="font-medium">{format(selectedDate!, 'EEEE, MMMM d, yyyy')}</p>
              <p className="text-sm text-gray-500">{selectedTime} • {selectedService?.base_duration_minutes} min</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PawPrint className="h-5 w-5 text-gray-400" />
            <div>
              <p className="font-medium">{selectedService?.name}</p>
              <p className="text-sm text-gray-500">${(selectedService?.base_price_cents / 100).toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-gray-400" />
            <div>
              <p className="font-medium">{petInfo.name}</p>
              <p className="text-sm text-gray-500">{petInfo.breed} {petInfo.weight && `• ${petInfo.weight} lbs`}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-gray-400" />
            <div>
              <p className="font-medium">Total: ${(selectedService?.base_price_cents / 100).toFixed(2)}</p>
              <p className="text-sm text-gray-500">Deposit: $25.00 (will be collected at confirmation)</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating booking...
            </>
          ) : (
            'Book Now'
          )}
        </button>
      </>
    )}
  </div>
)}
```

- [ ] **Step 3: Commit booking flow integration**

```bash
git add src/app/b/[slug]/booking-page.tsx
git commit -m "feat: wire booking flow to API"
```

---

## PHASE 2: Legal Pages

### Task 2.1: Terms of Service Page

**Files:**
- Create: `src/app/terms/page.tsx`

- [ ] **Step 1: Create Terms of Service page**

Create `/Users/abrahamsadiq/groomly/src/app/terms/page.tsx`:

```tsx
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
            By accessing or using Groomly ("the Service"), you agree to be bound by these Terms of Service. 
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
            Groomly is provided "as is" without warranties of any kind. We are not liable for any indirect, 
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
```

- [ ] **Step 2: Commit Terms page**

```bash
git add src/app/terms/page.tsx
git commit -m "feat: add Terms of Service page"
```

---

### Task 2.2: Privacy Policy Page

**Files:**
- Create: `src/app/privacy/page.tsx`

- [ ] **Step 1: Create Privacy Policy page**

Create `/Users/abrahamsadiq/groomly/src/app/privacy/page.tsx`:

```tsx
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

          <h2>9. Children's Privacy</h2>
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
```

- [ ] **Step 2: Commit Privacy page**

```bash
git add src/app/privacy/page.tsx
git commit -m "feat: add Privacy Policy page"
```

---

### Task 2.3: Update Footer Links

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Update landing page footer with real links**

Find the footer section in `/Users/abrahamsadiq/groomly/src/app/page.tsx` (around line 318-328) and update:

```tsx
<div>
  <h4 className="text-white font-semibold mb-3">Company</h4>
  <ul className="space-y-2 text-sm">
    <li><Link href="#" className="hover:text-white">About</Link></li>
    <li><Link href="mailto:hello@groomly.com" className="hover:text-white">Contact</Link></li>
  </ul>
</div>
<div>
  <h4 className="text-white font-semibold mb-3">Legal</h4>
  <ul className="space-y-2 text-sm">
    <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
    <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
  </ul>
</div>
```

- [ ] **Step 2: Commit footer update**

```bash
git add src/app/page.tsx
git commit -m "fix: update footer links to legal pages"
```

---

## PHASE 3: UI Polish & Branding

### Task 3.1: Create Logo Component

**Files:**
- Create: `src/components/brand/logo.tsx`

- [ ] **Step 1: Create reusable Logo component**

Create `/Users/abrahamsadiq/groomly/src/components/brand/logo.tsx`:

```tsx
import { PawPrint } from 'lucide-react'
import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  linkToHome?: boolean
  className?: string
}

export function Logo({ size = 'md', showText = true, linkToHome = false, className = '' }: LogoProps) {
  const sizes = {
    sm: { icon: 'h-6 w-6', text: 'text-lg' },
    md: { icon: 'h-8 w-8', text: 'text-xl' },
    lg: { icon: 'h-10 w-10', text: 'text-2xl' },
  }

  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizes[size].icon} bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center`}>
        <PawPrint className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'} text-white`} />
      </div>
      {showText && (
        <span className={`${sizes[size].text} font-bold text-gray-900`}>Groomly</span>
      )}
    </div>
  )

  if (linkToHome) {
    return <Link href="/">{content}</Link>
  }

  return content
}
```

- [ ] **Step 2: Commit Logo component**

```bash
git add src/components/brand/logo.tsx
git commit -m "feat: add Logo component"
```

---

### Task 3.2: Add Loading Skeletons

**Files:**
- Create: `src/components/ui/skeleton.tsx`

- [ ] **Step 1: Create Skeleton component**

Create `/Users/abrahamsadiq/groomly/src/components/ui/skeleton.tsx`:

```tsx
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse rounded-md bg-gray-200', className)} />
  )
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-4">
            <Skeleton className="h-96 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function TableRowSkeleton({ columns = 6 }: { columns?: number }) {
  return (
    <tr className="border-b">
      {[...Array(columns)].map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}
```

- [ ] **Step 2: Add cn utility if not exists**

Check `/Users/abrahamsadiq/groomly/src/lib/utils.ts` and ensure `cn` function exists:

```tsx
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 3: Commit skeletons**

```bash
git add src/components/ui/skeleton.tsx src/lib/utils.ts
git commit -m "feat: add loading skeleton components"
```

---

### Task 3.3: Add Form Validation

**Files:**
- Create: `src/lib/validations.ts`

- [ ] **Step 1: Create Zod validation schemas**

Create `/Users/abrahamsadiq/groomly/src/lib/validations.ts`:

```tsx
import { z } from 'zod'

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number is required').max(20),
  address: z.string().min(1, 'Address is required').max(200),
})

export const petSchema = z.object({
  name: z.string().min(1, 'Pet name is required').max(50),
  breed: z.string().max(50).optional(),
  weight: z.number().min(1).max(500).optional(),
  notes: z.string().max(500).optional(),
})

export const bookingSchema = z.object({
  business_id: z.string().uuid(),
  service_id: z.string().uuid(),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  scheduled_time: z.string().regex(/^\d{1,2}:\d{2}\s?(AM|PM)$/i, 'Invalid time format'),
  duration_minutes: z.number().min(15).max(480),
  total_price_cents: z.number().min(0),
  customer: customerSchema,
  pet: petSchema,
})

export const businessSchema = z.object({
  name: z.string().min(1, 'Business name is required').max(100),
  slug: z.string()
    .min(3, 'Booking URL must be at least 3 characters')
    .max(30, 'Booking URL must be at most 30 characters')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed'),
  phone: z.string().min(10, 'Phone number is required'),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().length(2, 'State is required'),
})

export const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required').max(100),
  description: z.string().max(500).optional(),
  base_price_cents: z.number().min(100, 'Price must be at least $1'),
  base_duration_minutes: z.number().min(15, 'Duration must be at least 15 minutes').max(480),
})

export type CustomerInput = z.infer<typeof customerSchema>
export type PetInput = z.infer<typeof petSchema>
export type BookingInput = z.infer<typeof bookingSchema>
export type BusinessInput = z.infer<typeof businessSchema>
export type ServiceInput = z.infer<typeof serviceSchema>
```

- [ ] **Step 2: Commit validation schemas**

```bash
git add src/lib/validations.ts
git commit -m "feat: add Zod validation schemas"
```

---

## Summary

This plan covers:

**Phase 1: Foundation**
- ✅ Environment configuration (.env.example)
- ✅ Dashboard wired to real Supabase
- ✅ Customers page wired to real Supabase
- ✅ Onboarding creates business in DB
- ✅ Booking flow calls API

**Phase 2: Legal**
- ✅ Terms of Service page
- ✅ Privacy Policy page
- ✅ Footer links updated

**Phase 3: UI & Validation**
- ✅ Logo component
- ✅ Loading skeletons
- ✅ Zod validation schemas

**Remaining work** (requires paid services or additional time):
- Stripe Elements integration (needs Stripe test keys)
- SMS via Twilio (needs Twilio account)
- Email automation triggers (needs Resend key)
- Route optimization algorithm
- Breed-based pricing UI
- Analytics dashboard
- Demo video

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-20-full-build.md`.**