'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Calendar, DollarSign, Users, TrendingUp, Clock, Plus, PawPrint, MapPin, Phone, Mail, ChevronRight, Star, Filter, Download, Loader2 } from 'lucide-react'

interface Business {
  id: string
  name: string
  slug: string
  owner_email: string
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  logo_url: string | null
  primary_color: string
}

interface Service {
  id: string
  name: string
  base_price_cents: number
}

interface Customer {
  id: string
  name: string
  phone: string
  email: string | null
}

interface Pet {
  id: string
  name: string
  breed: string | null
}

interface BookingWithDetails {
  id: string
  scheduled_date: string
  scheduled_time: string
  status: string
  total_price_cents: number
  duration_minutes: number
  notes: string | null
  service: Service
  customer: Customer
  pet: Pet
}

interface RecentCustomer {
  id: string
  name: string
  phone: string
  email: string | null
  pet_name: string
  last_visit: string
  total_spent: number
  visit_count: number
}

interface Stats {
  todayRevenue: number
  todayBookings: number
  weekRevenue: number
  weekBookings: number
  monthRevenue: number
  monthBookings: number
  noShowRate: number
  avgTicket: number
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  label: string
  value: string
  trend?: string
  trendUp?: boolean
  subtext?: string
}

interface RecentBookingData {
  id: string
  scheduled_date: string
  total_price_cents: number
  status: string
  customer: { id: string; name: string; phone: string; email: string | null }
  pet: { id: string; name: string } | null
}

export default function DashboardPage() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [todayBookings, setTodayBookings] = useState<BookingWithDetails[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<BookingWithDetails[]>([])
  const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      const supabase = createClient()

      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          setError('Please sign in to view your dashboard')
          setLoading(false)
          return
        }

        // Fetch business for current user
        const { data: businessData, error: businessError } = await supabase
          .from('businesses')
          .select('*')
          .eq('owner_email', user.email)
          .single()

        if (businessError) {
          console.error('Error fetching business:', businessError)
          setError('Failed to load business data. Please try again.')
          setLoading(false)
          return
        }
        if (!businessData) {
          // No business found - will show onboarding state
          setLoading(false)
          return
        }

        setBusiness(businessData)
        const businessId = businessData.id

        // Get today's date
        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]

        // Calculate date ranges
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)

        const monthAgo = new Date(today)
        monthAgo.setDate(monthAgo.getDate() - 30)

        const weekAhead = new Date(today)
        weekAhead.setDate(weekAhead.getDate() + 7)

        // Fetch today's bookings with joins
        const { data: todayBookingsData } = await supabase
          .from('bookings')
          .select(`
            id,
            scheduled_date,
            scheduled_time,
            status,
            total_price_cents,
            duration_minutes,
            notes,
            service:services(id, name, base_price_cents),
            customer:customers(id, name, phone, email),
            pet:pets(id, name, breed)
          `)
          .eq('business_id', businessId)
          .eq('scheduled_date', todayStr)
          .in('status', ['pending', 'confirmed'])
          .order('scheduled_time', { ascending: true })

        setTodayBookings((todayBookingsData || []) as unknown as BookingWithDetails[])

        // Fetch upcoming bookings (next 7 days, excluding today)
        const { data: upcomingBookingsData } = await supabase
          .from('bookings')
          .select(`
            id,
            scheduled_date,
            scheduled_time,
            status,
            total_price_cents,
            duration_minutes,
            notes,
            service:services(id, name, base_price_cents),
            customer:customers(id, name, phone, email),
            pet:pets(id, name, breed)
          `)
          .eq('business_id', businessId)
          .gt('scheduled_date', todayStr)
          .lte('scheduled_date', weekAhead.toISOString().split('T')[0])
          .in('status', ['pending', 'confirmed'])
          .order('scheduled_date', { ascending: true })
          .order('scheduled_time', { ascending: true })
          .limit(10)

        setUpcomingBookings((upcomingBookingsData || []) as unknown as BookingWithDetails[])

        // Fetch stats
        // Today's revenue and bookings
        const { data: todayStats } = await supabase
          .from('bookings')
          .select('total_price_cents, status')
          .eq('business_id', businessId)
          .eq('scheduled_date', todayStr)

        // Week stats
        const { data: weekStats } = await supabase
          .from('bookings')
          .select('total_price_cents, status')
          .eq('business_id', businessId)
          .gte('scheduled_date', weekAgo.toISOString().split('T')[0])
          .lte('scheduled_date', todayStr)

        // Month stats
        const { data: monthStats } = await supabase
          .from('bookings')
          .select('total_price_cents, status')
          .eq('business_id', businessId)
          .gte('scheduled_date', monthAgo.toISOString().split('T')[0])
          .lte('scheduled_date', todayStr)

        // Calculate stats
        const todayCompleted = (todayStats || []).filter(b => b.status === 'completed')
        const weekCompleted = (weekStats || []).filter(b => b.status === 'completed')
        const monthCompleted = (monthStats || []).filter(b => b.status === 'completed')
        const monthNoShows = (monthStats || []).filter(b => b.status === 'no_show')

        const calculatedStats: Stats = {
          todayRevenue: todayCompleted.reduce((sum, b) => sum + (b.total_price_cents || 0), 0) / 100,
          todayBookings: (todayStats || []).filter(b => ['pending', 'confirmed', 'completed'].includes(b.status)).length,
          weekRevenue: weekCompleted.reduce((sum, b) => sum + (b.total_price_cents || 0), 0) / 100,
          weekBookings: (weekStats || []).filter(b => ['pending', 'confirmed', 'completed'].includes(b.status)).length,
          monthRevenue: monthCompleted.reduce((sum, b) => sum + (b.total_price_cents || 0), 0) / 100,
          monthBookings: (monthStats || []).filter(b => ['pending', 'confirmed', 'completed'].includes(b.status)).length,
          noShowRate: monthCompleted.length > 0
            ? Math.round((monthNoShows.length / (monthCompleted.length + monthNoShows.length)) * 100 * 10) / 10
            : 0,
          avgTicket: monthCompleted.length > 0
            ? Math.round(monthCompleted.reduce((sum, b) => sum + (b.total_price_cents || 0), 0) / 100 / monthCompleted.length)
            : 0
        }

        setStats(calculatedStats)

        // Fetch recent customers with their booking history
        const { data: recentBookings } = await supabase
          .from('bookings')
          .select(`
            id,
            scheduled_date,
            total_price_cents,
            status,
            customer:customers(id, name, phone, email),
            pet:pets(id, name)
          `)
          .eq('business_id', businessId)
          .in('status', ['completed', 'confirmed'])
          .order('scheduled_date', { ascending: false })
          .limit(50)

        // Aggregate customer data
        const customerMap = new Map<string, RecentCustomer>()
        ;(recentBookings as unknown as RecentBookingData[] || []).forEach((booking) => {
          if (!booking.customer) return
          const customerId = booking.customer.id
          const existing = customerMap.get(customerId)

          if (existing) {
            existing.visit_count += 1
            existing.total_spent += (booking.total_price_cents || 0) / 100
            if (booking.scheduled_date > existing.last_visit) {
              existing.last_visit = booking.scheduled_date
            }
          } else {
            customerMap.set(customerId, {
              id: customerId,
              name: booking.customer.name,
              phone: booking.customer.phone,
              email: booking.customer.email,
              pet_name: booking.pet?.name || 'Unknown',
              last_visit: booking.scheduled_date,
              total_spent: (booking.total_price_cents || 0) / 100,
              visit_count: 1
            })
          }
        })

        // Sort by last visit and take top 5
        const sortedCustomers = Array.from(customerMap.values())
          .sort((a, b) => new Date(b.last_visit).getTime() - new Date(a.last_visit).getTime())
          .slice(0, 5)

        setRecentCustomers(sortedCustomers)

      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Format time for display
  function formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number)
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
  }

  // Format date for display
  function formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.getTime() === today.getTime()) {
      return 'Today'
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }
  }

  // Format relative date for last visit
  function formatRelativeDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const diffTime = today.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 14) return '1 week ago'
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // No business found - show onboarding prompt
  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <PawPrint className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Groomly!</h1>
          <p className="text-gray-600 mb-6">
            You don't have a business set up yet. Let's get you started with your mobile grooming business.
          </p>
          <Link
            href="/onboarding"
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Set Up Your Business
          </Link>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/auth/login"
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Sign In
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
                  Welcome back! You have {stats?.todayBookings || 0} appointments today.
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
            value={`$${stats?.todayRevenue || 0}`}
            subtext={`${stats?.todayBookings || 0} bookings`}
          />
          <StatCard
            icon={Calendar}
            iconBg="from-blue-500 to-cyan-500"
            label="This Week"
            value={`$${(stats?.weekRevenue || 0).toLocaleString()}`}
            subtext={`${stats?.weekBookings || 0} bookings`}
          />
          <StatCard
            icon={TrendingUp}
            iconBg="from-purple-500 to-pink-500"
            label="This Month"
            value={`$${(stats?.monthRevenue || 0).toLocaleString()}`}
            subtext={`${stats?.monthBookings || 0} bookings`}
          />
          <StatCard
            icon={Clock}
            iconBg="from-orange-500 to-red-500"
            label="No-Show Rate"
            value={`${stats?.noShowRate || 0}%`}
            subtext={`$${stats?.avgTicket || 0} avg ticket`}
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
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Filter className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Download className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {todayBookings.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No appointments scheduled for today</p>
                  <Link
                    href="/dashboard/bookings/new"
                    className="text-indigo-600 hover:underline text-sm mt-2 inline-block"
                  >
                    Add your first booking
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {todayBookings.map((apt, index) => (
                    <div key={apt.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="text-center min-w-[72px]">
                          <div className="text-lg font-semibold text-gray-900">
                            {formatTime(apt.scheduled_time)}
                          </div>
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
                                <div className="font-semibold text-gray-900">{apt.pet.name}</div>
                                <div className="text-sm text-gray-500">
                                  {apt.pet.breed || 'Unknown breed'} • {apt.service.name}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">
                                ${(apt.total_price_cents / 100).toFixed(0)}
                              </div>
                              <StatusBadge status={apt.status} />
                            </div>
                          </div>

                          <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {apt.customer.name}
                            </div>
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            <a
                              href={`tel:${apt.customer.phone}`}
                              className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-200 transition-colors"
                            >
                              <Phone className="h-3 w-3 inline mr-1" />
                              Call
                            </a>
                            {apt.customer.email && (
                              <a
                                href={`mailto:${apt.customer.email}`}
                                className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-200 transition-colors"
                              >
                                <Mail className="h-3 w-3 inline mr-1" />
                                Message
                              </a>
                            )}
                            <Link
                              href={`/dashboard/bookings/${apt.id}`}
                              className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors"
                            >
                              View Details
                            </Link>
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
                    <div className="text-gray-600">
                      {todayBookings.reduce((sum, b) => sum + b.duration_minutes, 0)} min total
                    </div>
                    <div className="font-semibold text-gray-900">
                      ${(todayBookings.reduce((sum, b) => sum + b.total_price_cents, 0) / 100).toFixed(0)} est. revenue
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
                <div className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No upcoming bookings scheduled</p>
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
                            {booking.pet.name} <span className="text-gray-500 font-normal">({booking.customer.name})</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(booking.scheduled_date)} at {formatTime(booking.scheduled_time)} • {booking.service.name}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="font-semibold text-gray-900">${(booking.total_price_cents / 100).toFixed(0)}</div>
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
                <Link
                  href="/dashboard/bookings/new"
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Plus className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span className="font-medium text-gray-700">Create manual booking</span>
                </Link>
                <Link
                  href="/dashboard/customers/new"
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="font-medium text-gray-700">Add new customer</span>
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

            {/* Recent Customers - CRM View */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Recent Customers</h3>
                <Link href="/dashboard/customers" className="text-sm text-indigo-600 hover:underline font-medium">
                  View all
                </Link>
              </div>
              {recentCustomers.length === 0 ? (
                <div className="p-6 text-center">
                  <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No customers yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentCustomers.map((customer) => (
                    <div key={customer.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{customer.name}</div>
                            <div className="text-xs text-gray-500">{customer.pet_name}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium text-gray-700">{customer.visit_count}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-gray-500">Last visit: {formatRelativeDate(customer.last_visit)}</span>
                        <span className="font-medium text-gray-900">${customer.total_spent.toFixed(0)} total</span>
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
                    <span className="font-semibold">${stats?.weekRevenue || 0}</span>
                  </div>
                  <div className="w-full bg-indigo-800 rounded-full h-2">
                    <div className="bg-white rounded-full h-2" style={{ width: `${Math.min(((stats?.weekRevenue || 0) / 4500) * 100, 100)}%` }}></div>
                  </div>
                  <p className="text-xs text-indigo-200 mt-1">{Math.round(((stats?.weekRevenue || 0) / 4500) * 100)}% of $4,500 goal</p>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-indigo-100">Bookings</span>
                    <span className="font-semibold">{stats?.weekBookings || 0}</span>
                  </div>
                  <div className="w-full bg-indigo-800 rounded-full h-2">
                    <div className="bg-white rounded-full h-2" style={{ width: `${Math.min(((stats?.weekBookings || 0) / 40) * 100, 100)}%` }}></div>
                  </div>
                  <p className="text-xs text-indigo-200 mt-1">{Math.round(((stats?.weekBookings || 0) / 40) * 100)}% of 40 booking goal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ icon: Icon, iconBg, label, value, trend, trendUp, subtext }: StatCardProps) {
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

  const labels: Record<string, string> = {
    confirmed: 'Confirmed',
    pending: 'Pending',
    cancelled: 'Cancelled',
    completed: 'Completed',
    no_show: 'No Show',
  }

  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  )
}