'use client'

import { Calendar, DollarSign, Users, Clock, Plus, PawPrint } from 'lucide-react'
import Link from 'next/link'

interface DashboardViewProps {
  business: any
  bookings: any[]
  monthlyRevenue: number
  monthlyBookings: number
}

export default function DashboardView({
  business,
  bookings,
  monthlyRevenue,
  monthlyBookings,
}: DashboardViewProps) {
  const stats = [
    {
      name: 'Monthly Revenue',
      value: `$${(monthlyRevenue / 100).toFixed(2)}`,
      icon: DollarSign,
      change: '+12.5%',
      changeType: 'positive',
    },
    {
      name: "Today's Bookings",
      value: bookings.length.toString(),
      icon: Calendar,
      change: bookings.length > 0 ? 'Active day' : 'No bookings',
      changeType: 'neutral',
    },
    {
      name: 'Total Customers',
      value: '24',
      icon: Users,
      change: '+3 this week',
      changeType: 'positive',
    },
    {
      name: 'Services Offered',
      value: business?.services?.length || 0,
      icon: PawPrint,
      change: 'Manage in settings',
      changeType: 'neutral',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {business?.name || 'Your Business'}
              </h1>
              <p className="text-sm text-gray-500">Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/bookings/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Booking
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
          </div>
          <div className="divide-y">
            {bookings.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No bookings scheduled for today</p>
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                  <div className="text-center min-w-[80px]">
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(`2000-01-01T${booking.scheduled_time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </p>
                    <p className="text-sm text-gray-500">{booking.duration_minutes} min</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{booking.pet?.name}</p>
                    <p className="text-sm text-gray-500">
                      {booking.service?.name} • {booking.customer?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ${(booking.total_price_cents / 100).toFixed(2)}
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/dashboard/services"
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-gray-900 mb-2">Manage Services</h3>
            <p className="text-sm text-gray-500">Add, edit, or remove services and pricing</p>
          </Link>
          <Link
            href="/dashboard/customers"
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-gray-900 mb-2">Customer Database</h3>
            <p className="text-sm text-gray-500">View and manage customer records</p>
          </Link>
          <Link
            href="/dashboard/settings"
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-gray-900 mb-2">Business Settings</h3>
            <p className="text-sm text-gray-500">Configure hours, booking rules, and more</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
