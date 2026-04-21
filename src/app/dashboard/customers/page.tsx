'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Users, Search, Filter, Download, Plus, Phone, Mail, Calendar, DollarSign, ChevronRight, Star, MoreVertical, Loader2 } from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string
  notes: string | null
  created_at: string
}

interface Pet {
  id: string
  name: string
  breed: string | null
  customer_id: string
}

interface CustomerStats {
  totalSpent: number
  visits: number
  lastVisit: string | null
  avgTicket: number
  pets: string[]
}

interface CustomerWithStats extends Customer, CustomerStats {}

interface Business {
  id: string
  name: string
  slug: string
}

export default function CustomersPage() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [customers, setCustomers] = useState<CustomerWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'visits' | 'totalSpent' | 'lastVisit'>('lastVisit')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    async function fetchCustomers() {
      const supabase = createClient()

      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          setError('Please sign in to view customers')
          setLoading(false)
          return
        }

        // Fetch business for current user
        const { data: businessData, error: businessError } = await supabase
          .from('businesses')
          .select('id, name, slug')
          .eq('owner_email', user.email)
          .single()

        if (businessError) {
          console.error('Error fetching business:', businessError)
          setError('Failed to load business data')
          setLoading(false)
          return
        }

        if (!businessData) {
          setError('No business found. Please complete onboarding.')
          setLoading(false)
          return
        }

        setBusiness(businessData)
        const businessId = businessData.id

        // Fetch all completed bookings for this business with customer and pet data
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            scheduled_date,
            total_price_cents,
            status,
            customer:customers(id, name, phone, email, notes, created_at),
            pet:pets(id, name, breed)
          `)
          .eq('business_id', businessId)
          .in('status', ['completed', 'confirmed'])
          .order('scheduled_date', { ascending: false })

        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError)
          setError('Failed to load customer data')
          setLoading(false)
          return
        }

        // Aggregate customer data from bookings
        const customerMap = new Map<string, CustomerWithStats>()
        const petMap = new Map<string, Set<string>>() // customer_id -> set of pet names

        ;(bookingsData || []).forEach((booking: any) => {
          if (!booking.customer) return

          const customerId = booking.customer.id
          const existingCustomer = customerMap.get(customerId)
          const totalPrice = booking.total_price_cents || 0

          // Track pets for this customer
          if (booking.pet) {
            if (!petMap.has(customerId)) {
              petMap.set(customerId, new Set())
            }
            petMap.get(customerId)!.add(booking.pet.name)
          }

          if (existingCustomer) {
            existingCustomer.visits += 1
            existingCustomer.totalSpent += totalPrice / 100
            if (booking.scheduled_date && (!existingCustomer.lastVisit || booking.scheduled_date > existingCustomer.lastVisit)) {
              existingCustomer.lastVisit = booking.scheduled_date
            }
          } else {
            customerMap.set(customerId, {
              ...booking.customer,
              totalSpent: totalPrice / 100,
              visits: 1,
              lastVisit: booking.scheduled_date || null,
              avgTicket: 0,
              pets: []
            })
          }
        })

        // Calculate avg ticket and add pets for each customer
        const customersWithStats = Array.from(customerMap.values()).map(customer => {
          const pets = petMap.has(customer.id) ? Array.from(petMap.get(customer.id)!) : []
          return {
            ...customer,
            pets,
            avgTicket: customer.visits > 0 ? Math.round(customer.totalSpent / customer.visits) : 0
          }
        })

        setCustomers(customersWithStats)
      } catch (err) {
        console.error('Error fetching customers:', err)
        setError('Failed to load customers')
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    let result = [...customers]

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(customer =>
        customer.name.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query) ||
        customer.pets.some(pet => pet.toLowerCase().includes(query))
      )
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'visits':
          comparison = a.visits - b.visits
          break
        case 'totalSpent':
          comparison = a.totalSpent - b.totalSpent
          break
        case 'lastVisit':
          const dateA = a.lastVisit ? new Date(a.lastVisit).getTime() : 0
          const dateB = b.lastVisit ? new Date(b.lastVisit).getTime() : 0
          comparison = dateA - dateB
          break
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

    return result
  }, [customers, searchQuery, sortBy, sortOrder])

  // Calculate aggregate stats
  const stats = useMemo(() => {
    const total = customers.length
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)
    const totalVisits = customers.reduce((sum, c) => sum + c.visits, 0)
    const avgLifetimeValue = total > 0 ? Math.round(totalRevenue / total) : 0
    const avgVisits = total > 0 ? (totalVisits / total).toFixed(1) : '0'

    // Count new customers this month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonth = customers.filter(c => new Date(c.created_at) >= startOfMonth).length

    return {
      total,
      thisMonth,
      avgLifetimeValue,
      avgVisits
    }
  }, [customers])

  // Format date for display
  function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Never'
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Toggle sort
  function toggleSort(field: 'name' | 'visits' | 'totalSpent' | 'lastVisit') {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-3">{error}</h1>
          <Link
            href="/dashboard"
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors inline-block"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Empty state
  if (customers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Customers</h1>
                <p className="text-sm text-gray-500">{business?.name}</p>
              </div>
              <Link
                href="/dashboard/customers/new"
                className="bg-gray-900 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Customer
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No customers yet</h2>
            <p className="text-gray-500 mb-6">
              Customers will appear here once they book appointments with your business.
            </p>
            <Link
              href="/dashboard/bookings/new"
              className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create First Booking
            </Link>
          </div>
        </main>
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
              <p className="text-sm text-gray-500">{stats.total} total customers · {stats.thisMonth} new this month</p>
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
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-700">Filter</span>
              </button>
              <button
                onClick={() => toggleSort(sortBy)}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-700">Sort: {sortBy === 'lastVisit' ? 'Last Visit' : sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</span>
                <ChevronRight className={`h-4 w-4 text-gray-600 transition-transform ${sortOrder === 'desc' ? 'rotate-90' : '-rotate-90'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Customers Table */}
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
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p>No customers match your search</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700 flex-shrink-0">
                            {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
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
                          {customer.pets.length > 0 ? (
                            customer.pets.map((pet, i) => (
                              <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                                {pet}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">No pets</span>
                          )}
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
                        <span className="font-semibold text-gray-900">${customer.totalSpent.toFixed(0)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{formatDate(customer.lastVisit)}</span>
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination placeholder - could be enhanced for real pagination */}
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium text-gray-900">1-{filteredCustomers.length}</span> of <span className="font-medium text-gray-900">{customers.length}</span> customers
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled
              >
                Previous
              </button>
              <button
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}