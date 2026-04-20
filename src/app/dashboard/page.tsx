import Link from 'next/link'
import { Calendar, DollarSign, Users, TrendingUp, Clock, Plus, PawPrint, MapPin, Phone, Mail, ChevronRight, Star, Filter, Download } from 'lucide-react'

export default function DashboardPage() {
  // Mock data - will come from Supabase once connected
  const stats = {
    todayRevenue: 425,
    todayBookings: 5,
    weekRevenue: 2847,
    weekBookings: 28,
    monthRevenue: 11234,
    monthBookings: 127,
    noShowRate: 1.2,
    avgTicket: 88,
  }

  const todayAppointments = [
    { id: 1, time: '9:00 AM', pet: 'Fluffy', breed: 'Golden Retriever', service: 'Full Groom', price: 85, status: 'confirmed', address: '123 Oak St', distance: '2.3 mi' },
    { id: 2, time: '11:00 AM', pet: 'Max', breed: 'Poodle', service: 'Bath & Brush', price: 55, status: 'confirmed', address: '456 Elm St', distance: '1.8 mi' },
    { id: 3, time: '2:00 PM', pet: 'Bella', breed: 'Labrador', service: 'Full Groom', price: 85, status: 'pending', address: '789 Pine St', distance: '3.1 mi' },
    { id: 4, time: '4:00 PM', pet: 'Charlie', breed: 'Beagle', service: 'Nail Trim', price: 25, status: 'confirmed', address: '321 Maple Ave', distance: '1.2 mi' },
    { id: 5, time: '5:30 PM', pet: 'Luna', breed: 'German Shepherd', service: 'De-Shedding', price: 95, status: 'confirmed', address: '654 Cedar Ln', distance: '2.7 mi' },
  ]

  const recentCustomers = [
    { id: 1, name: 'Sarah Johnson', pet: 'Fluffy', phone: '(512) 555-0101', email: 'sarah.j@email.com', lastVisit: 'Today', totalSpent: 510, visits: 6 },
    { id: 2, name: 'Mike Chen', pet: 'Max', phone: '(512) 555-0102', email: 'mike.c@email.com', lastVisit: 'Today', totalSpent: 330, visits: 4 },
    { id: 3, name: 'Emily Davis', pet: 'Bella', phone: '(512) 555-0103', email: 'emily.d@email.com', lastVisit: '2 days ago', totalSpent: 255, visits: 3 },
    { id: 4, name: 'James Wilson', pet: 'Charlie', phone: '(512) 555-0104', email: 'james.w@email.com', lastVisit: '1 week ago', totalSpent: 150, visits: 2 },
    { id: 5, name: 'Lisa Brown', pet: 'Luna', phone: '(512) 555-0105', email: 'lisa.b@email.com', lastVisit: '2 weeks ago', totalSpent: 475, visits: 5 },
  ]

  const upcomingBookings = [
    { id: 1, date: 'Tomorrow', time: '10:00 AM', pet: 'Cooper', owner: 'Tom H.', service: 'Full Groom', price: 85 },
    { id: 2, date: 'Tomorrow', time: '2:00 PM', pet: 'Daisy', owner: 'Anna K.', service: 'Bath Only', price: 45 },
    { id: 3, date: 'Wed, Apr 22', time: '9:00 AM', pet: 'Rocky', owner: 'Dan P.', service: 'De-Shedding', price: 95 },
  ]

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
                <h1 className="text-xl font-bold text-gray-900">Groomly Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back! You have {stats.todayBookings} appointments today.</p>
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
            trend="+12%"
            trendUp={true}
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
            trend="+8%"
            trendUp={true}
          />
          <StatCard
            icon={Clock}
            iconBg="from-orange-500 to-red-500"
            label="No-Show Rate"
            value={`${stats.noShowRate}%`}
            subtext={`${stats.avgTicket} avg ticket`}
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
                  <p className="text-sm text-gray-500">Monday, April 20, 2026</p>
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

              <div className="divide-y divide-gray-100">
                {todayAppointments.map((apt, index) => (
                  <div key={apt.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="text-center min-w-[72px]">
                        <div className="text-lg font-semibold text-gray-900">{apt.time}</div>
                        {index < todayAppointments.length - 1 && (
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
                              <div className="font-semibold text-gray-900">{apt.pet}</div>
                              <div className="text-sm text-gray-500">{apt.breed} • {apt.service}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">${apt.price}</div>
                            <StatusBadge status={apt.status} />
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {apt.address} ({apt.distance})
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <button className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-200 transition-colors">
                            <Phone className="h-3 w-3 inline mr-1" />
                            Call
                          </button>
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

              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-600">
                    <span className="font-semibold text-gray-900">{todayAppointments.length}</span> appointments
                  </div>
                  <div className="text-gray-600">
                    <span className="font-semibold text-gray-900">11.1 mi</span> total driving
                  </div>
                  <div className="font-semibold text-gray-900">
                    ${todayAppointments.reduce((acc, apt) => acc + apt.price, 0)} est. revenue
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Bookings */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Bookings</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{booking.pet} <span className="text-gray-500 font-normal">({booking.owner})</span></div>
                        <div className="text-sm text-gray-500">{booking.date} at {booking.time} • {booking.service}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="font-semibold text-gray-900">${booking.price}</div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
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
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="font-medium text-gray-700">Add new customer</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <PawPrint className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="font-medium text-gray-700">Add service</span>
                </button>
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
                          <div className="text-xs text-gray-500">{customer.pet}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium text-gray-700">{customer.visits}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-gray-500">Last visit: {customer.lastVisit}</span>
                      <span className="font-medium text-gray-900">${customer.totalSpent} total</span>
                    </div>
                  </div>
                ))}
              </div>
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
                    <div className="bg-white rounded-full h-2" style={{ width: '65%' }}></div>
                  </div>
                  <p className="text-xs text-indigo-200 mt-1">65% of $4,500 goal</p>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-indigo-100">Bookings</span>
                    <span className="font-semibold">{stats.weekBookings}</span>
                  </div>
                  <div className="w-full bg-indigo-800 rounded-full h-2">
                    <div className="bg-white rounded-full h-2" style={{ width: '70%' }}></div>
                  </div>
                  <p className="text-xs text-indigo-200 mt-1">70% of 40 booking goal</p>
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
  const styles = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-gray-100 text-gray-700',
  }

  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
      {status}
    </span>
  )
}
