'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit, Trash2, PawPrint, Clock, DollarSign } from 'lucide-react'

export default function ServicesPage() {
  const supabase = useMemo(() => createClient(), [])
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingService, setEditingService] = useState<any>(null)

  useEffect(() => {
    fetchServices()
  }, [])

  async function fetchServices() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_email', user.email)
      .single()

    if (!business) return

    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })

    setServices(data || [])
    setLoading(false)
  }

  async function handleSaveService(service: any) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_email', user?.email)
      .single()

    if (!business) return

    if (editingService) {
      await supabase.from('services').update(service).eq('id', editingService.id)
    } else {
      await supabase.from('services').insert([{ ...service, business_id: business.id }])
    }

    fetchServices()
    setShowAddModal(false)
    setEditingService(null)
  }

  async function handleDeleteService(id: string) {
    if (confirm('Are you sure you want to delete this service?')) {
      await supabase.from('services').delete().eq('id', id)
      fetchServices()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Services</h1>
            <p className="text-gray-500 mt-1">Manage your grooming services and pricing</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Service
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <PawPrint className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No services yet</h3>
            <p className="text-gray-500 mt-1">Add your first grooming service to get started</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Service
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-xl p-6 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <PawPrint className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-500">{service.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        ${(service.base_price_cents / 100).toFixed(2)}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {service.base_duration_minutes} min
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingService(service)
                      setShowAddModal(true)
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    className="p-2 hover:bg-red-100 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <ServiceModal
          service={editingService}
          onClose={() => {
            setShowAddModal(false)
            setEditingService(null)
          }}
          onSave={handleSaveService}
        />
      )}
    </div>
  )
}

function ServiceModal({ service, onClose, onSave }: any) {
  const [name, setName] = useState(service?.name || '')
  const [description, setDescription] = useState(service?.description || '')
  const [price, setPrice] = useState((service?.base_price_cents || 8500) / 100)
  const [duration, setDuration] = useState(service?.base_duration_minutes || 60)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name,
      description,
      base_price_cents: Math.round(price * 100),
      base_duration_minutes: duration,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {service ? 'Edit Service' : 'Add Service'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Full Groom"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Complete grooming service including..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (min)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2"
                min="15"
                step="15"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
