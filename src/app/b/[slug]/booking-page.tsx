'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, Clock, DollarSign, Check, ChevronRight } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'

interface BookingPageProps {
  business: any
}

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

  const availableTimes = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ]

  const handleSubmit = async () => {
    // Will integrate with API endpoint
    console.log('Booking:', {
      business_id: business.id,
      service: selectedService,
      date: selectedDate,
      time: selectedTime,
      customer: customerInfo,
      pet: petInfo,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {business.logo_url ? (
              <img src={business.logo_url} alt={business.name} className="h-12 w-12" />
            ) : (
              <div
                className="h-12 w-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: business.primary_color }}
              >
                <span className="text-white font-bold text-xl">
                  {business.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{business.name}</h1>
              <p className="text-sm text-gray-500">Mobile Dog Grooming</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Service' },
            { num: 2, label: 'Date & Time' },
            { num: 3, label: 'Your Info' },
            { num: 4, label: 'Confirm' },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= s.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s.num ? <Check className="h-4 w-4" /> : s.num}
              </div>
              <span className={`ml-2 text-sm ${step >= s.num ? 'text-gray-900' : 'text-gray-500'}`}>
                {s.label}
              </span>
              {i < 3 && <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* Step 1: Select Service */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Select a Service</h2>
              <div className="space-y-3">
                {business.services?.map((service: any) => (
                  <div
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service)
                      setStep(2)
                    }}
                    className="border rounded-xl p-4 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${(service.base_price_cents / 100).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">{service.base_duration_minutes} min</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Choose Date & Time</h2>
              <div className="flex justify-center mb-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {availableTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-3 rounded-lg font-medium transition-all ${
                      selectedTime === time
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedTime}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 3: Customer & Pet Info */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Your Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Where should we groom your pet?"
                    required
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Pet Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pet Name *
                      </label>
                      <input
                        type="text"
                        value={petInfo.name}
                        onChange={(e) => setPetInfo({ ...petInfo, name: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Breed
                      </label>
                      <input
                        type="text"
                        value={petInfo.breed}
                        onChange={(e) => setPetInfo({ ...petInfo, breed: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="e.g., Golden Retriever"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight (lbs)
                      </label>
                      <input
                        type="number"
                        value={petInfo.weight}
                        onChange={(e) => setPetInfo({ ...petInfo, weight: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (behavior, medical alerts, etc.)
                    </label>
                    <textarea
                      value={petInfo.notes}
                      onChange={(e) => setPetInfo({ ...petInfo, notes: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                      rows={3}
                      placeholder="Any special instructions..."
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={() => setStep(4)}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Confirm Booking</h2>
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
                    <p className="text-sm text-gray-500">Deposit due: $25.00</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700"
              >
                Book Now - Pay Deposit
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function PawPrint({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C10.9 2 10 2.9 10 4S10.9 6 12 6 14 5.1 14 4 13.1 2 12 2M8 5C6.9 5 6 5.9 6 7S6.9 9 8 9 10 8.1 10 7 9.1 5 8 5M16 5C14.9 5 14 5.9 14 7S14.9 9 16 9 18 8.1 18 7 17.1 5 16 5M7 10C5.34 10 4 11.34 4 13C4 14.08 4.58 15.03 5.44 15.59C4.6 16.49 4 17.67 4 19C4 20.66 5.34 22 7 22C8.04 22 8.95 21.46 9.5 20.69C10.21 21.45 11.24 22 12.5 22C14.25 22 15.71 20.84 16.13 19.19C17.84 18.78 19 17.26 19 15.5C19 14.21 18.34 13.08 17.34 12.41C17.78 11.73 18 10.93 18 10C18 8.34 16.66 7 15 7C14.19 7 13.45 7.32 12.91 7.83C12.59 7.3 12.11 6.86 11.53 6.56C11.17 7.25 10.5 7.83 9.69 8.13C9.27 7.47 8.57 7 7.75 7H7M12 10C12.55 10 13 10.45 13 11S12.55 12 12 12 11 11.55 11 11 11.45 10 12 10M8 11C8.55 11 9 11.45 9 12S8.55 13 8 13 7 12.55 7 12 7.45 11 8 11M16 11C16.55 11 17 11.45 17 12S16.55 13 16 13 15 12.55 15 12 15.45 11 16 11M12.5 13C13.33 13 14 13.67 14 14.5C14 14.83 13.89 15.13 13.71 15.38C13.9 15.75 14 16.16 14 16.5C14 17.88 12.88 19 11.5 19C10.95 19 10.44 18.82 10.03 18.5C9.62 18.82 9.11 19 8.5 19C7.12 19 6 17.88 6 16.5C6 15.12 7.12 14 8.5 14C8.84 14 9.16 14.06 9.47 14.18C9.84 13.43 10.61 12.91 11.5 12.91C11.71 12.91 11.91 12.94 12.11 12.99C12.17 12.99 12.33 13 12.5 13Z" />
    </svg>
  )
}
