'use client'

import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock, DollarSign, Check, ChevronRight, Loader2, XCircle, CreditCard, Lock } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import StripePayment from '@/components/payment/stripe-payment-form'

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
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Payment state
  const [depositAmount, setDepositAmount] = useState(2500) // Default $25
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentSucceeded, setPaymentSucceeded] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)

  const availableTimes = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ]

  // Fetch deposit amount from business settings
  useEffect(() => {
    async function fetchDepositAmount() {
      if (business?.id) {
        try {
          const response = await fetch(`/api/business-settings?businessId=${business.id}`)
          if (response.ok) {
            const data = await response.json()
            if (data?.deposit_amount_cents) {
              setDepositAmount(data.deposit_amount_cents)
            }
          }
        } catch (err) {
          // Use default deposit amount
          console.log('Using default deposit amount')
        }
      }
    }
    fetchDepositAmount()
  }, [business?.id])

  // Create payment intent when moving to payment step
  useEffect(() => {
    async function createPaymentIntent() {
      if (step === 4 && !clientSecret && selectedService) {
        setLoading(true)
        try {
          const response = await fetch('/api/stripe/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: depositAmount,
              bookingId: 'pending',
              businessId: business.id,
            }),
          })

          const data = await response.json()
          if (data.clientSecret) {
            setClientSecret(data.clientSecret)
          } else {
            setError('Failed to initialize payment. Please try again.')
          }
        } catch (err) {
          setError('Payment setup failed. Please try again.')
        } finally {
          setLoading(false)
        }
      }
    }
    createPaymentIntent()
  }, [step, clientSecret, selectedService, depositAmount, business.id])

  // Create booking after successful payment
  const handlePaymentSuccess = async () => {
    setPaymentSucceeded(true)
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: business.id,
          service_id: selectedService.id,
          scheduled_date: format(selectedDate!, 'yyyy-MM-dd'),
          scheduled_time: selectedTime,
          duration_minutes: selectedService.base_duration_minutes,
          total_price_cents: selectedService.base_price_cents,
          deposit_paid_cents: depositAmount,
          payment_status: 'paid',
          status: 'confirmed',
          customer: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
            address: customerInfo.address,
          },
          pet: {
            name: petInfo.name,
            breed: petInfo.breed || '',
            weight: petInfo.weight ? parseInt(petInfo.weight) : 0,
            notes: petInfo.notes || '',
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to create booking')
      }

      const data = await response.json()
      setBookingId(data.booking?.id)
      setStep(5) // Move to confirmation step
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking')
      // Payment succeeded but booking failed - show warning
      setStep(5)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentError = (errorMsg: string) => {
    setError(errorMsg)
    setPaymentSucceeded(false)
  }

  const steps = [
    { num: 1, label: 'Service' },
    { num: 2, label: 'Date & Time' },
    { num: 3, label: 'Your Info' },
    { num: 4, label: 'Payment' },
    { num: 5, label: 'Done' },
  ]

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
                style={{ backgroundColor: business.primary_color || '#4f46e5' }}
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
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= s.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s.num ? <Check className="h-4 w-4" /> : s.num}
              </div>
              <span className={`ml-2 text-sm hidden sm:block ${step >= s.num ? 'text-gray-900' : 'text-gray-500'}`}>
                {s.label}
              </span>
              {i < 4 && <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />}
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
                  disabled={(date) => date < new Date()}
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
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedTime}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
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
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!customerInfo.name || !customerInfo.phone || !customerInfo.address || !petInfo.name}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Secure Your Appointment</h2>
              <p className="text-gray-600 mb-4">
                A ${(depositAmount / 100).toFixed(2)} deposit is required to confirm your booking.
                The remaining balance is due after the service.
              </p>

              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{format(selectedDate!, 'EEEE, MMMM d, yyyy')}</p>
                    <p className="text-sm text-gray-500">{selectedTime} • {selectedService?.base_duration_minutes} min</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{selectedService?.name}</p>
                    <p className="text-sm text-gray-500">for {petInfo.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Total: ${(selectedService?.base_price_cents / 100).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Deposit: ${(depositAmount / 100).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Payment Failed</p>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {loading && !clientSecret ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Preparing payment...</span>
                </div>
              ) : clientSecret && (
                <StripePayment
                  clientSecret={clientSecret}
                  publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'}
                  amount={depositAmount}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onCancel={() => setStep(3)}
                />
              )}
            </div>
          )}

          {/* Step 5: Confirmation */}
          {step === 5 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600 mb-6">
                Thank you, {customerInfo.name}! Your appointment has been scheduled.
              </p>
              <div className="bg-gray-50 rounded-xl p-4 text-left max-w-sm mx-auto space-y-3">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{format(selectedDate!, 'EEEE, MMMM d, yyyy')}</p>
                    <p className="text-sm text-gray-500">{selectedTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{selectedService?.name}</p>
                    <p className="text-sm text-gray-500">for {petInfo.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Total: ${(selectedService?.base_price_cents / 100).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Deposit paid: ${(depositAmount / 100).toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-6">
                A confirmation email will be sent to {customerInfo.email || 'your email'}.
              </p>
              {error && (
                <p className="text-sm text-amber-600 mt-2">
                  Note: {error}. Your payment was processed - please contact us if you don't receive confirmation.
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}