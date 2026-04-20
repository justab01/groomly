import Link from 'next/link'
import { Users, Search, Filter, Download, Plus, Phone, Mail, Calendar, DollarSign, ChevronRight, Star, MoreVertical } from 'lucide-react'

export default function CustomersPage() {
  // Mock data - will come from Supabase
  const customers = [
    { id: 1, name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '(512) 555-0101', pets: ['Fluffy', 'Buddy'], totalSpent: 510, visits: 6, lastVisit: '2026-04-20', avgTicket: 85, notes: 'Prefers morning appointments' },
    { id: 2, name: 'Mike Chen', email: 'mike.c@email.com', phone: '(512) 555-0102', pets: ['Max'], totalSpent: 330, visits: 4, lastVisit: '2026-04-20', avgTicket: 82, notes: '' },
    { id: 3, name: 'Emily Davis', email: 'emily.d@email.com', phone: '(512) 555-0103', pets: ['Bella', 'Charlie', 'Luna'], totalSpent: 255, visits: 3, lastVisit: '2026-04-18', avgTicket: 85, notes: 'Has 3 dogs, books bundle' },
    { id: 4, name: 'James Wilson', email: 'james.w@email.com', phone: '(512) 555-0104', pets: ['Charlie'], totalSpent: 150, visits: 2, lastVisit: '2026-04-13', avgTicket: 75, notes: '' },
    { id: 5, name: 'Lisa Brown', email: 'lisa.b@email.com', phone: '(512) 555-0105', pets: ['Luna'], totalSpent: 475, visits: 5, lastVisit: '2026-04-06', avgTicket: 95, notes: 'German Shepherd - de-shedding specialist' },
    { id: 6, name: 'Tom Harris', email: 'tom.h@email.com', phone: '(512) 555-0106', pets: ['Cooper'], totalSpent: 255, visits: 3, lastVisit: '2026-04-01', avgTicket: 85, notes: '' },
    { id: 7, name: 'Anna Kim', email: 'anna.k@email.com', phone: '(512) 555-0107', pets: ['Daisy'], totalSpent: 180, visits: 4, lastVisit: '2026-03-28', avgTicket: 45, notes: 'Budget-conscious, bath only' },
    { id: 8, name: 'Dan Parker', email: 'dan.p@email.com', phone: '(512) 555-0108', pets: ['Rocky'], totalSpent: 380, visits: 4, lastVisit: '2026-03-25', avgTicket: 95, notes: 'Large breed specialist needed' },
    { id: 9, name: 'Rachel Green', email: 'rachel.g@email.com', phone: '(512) 555-0109', pets: ['Pepper'], totalSpent: 170, visits: 2, lastVisit: '2026-03-20', avgTicket: 85, notes: '' },
    { id: 10, name: 'Chris Martin', email: 'chris.m@email.com', phone: '(512) 555-0110', pets: ['Zeus'], totalSpent: 540, visits: 6, lastVisit: '2026-03-15', avgTicket: 90, notes: 'VIP customer' },
  ]

  const stats = {
    total: 247,
    thisMonth: 28,
    avgLifetimeValue: 312,
    avgVisits: 3.8,
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
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-700">Filter</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="font-medium text-gray-700">Sort by</span>
                <ChevronRight className="h-4 w-4 text-gray-600 rotate-90" />
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
                {customers.map((customer) => (
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
                            {pet}
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
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          {customer.email}
                        </div>
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
                      <span className="font-semibold text-gray-900">${customer.totalSpent}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{new Date(customer.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
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
              Showing <span className="font-medium text-gray-900">1-10</span> of <span className="font-medium text-gray-900">{stats.total}</span> customers
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
