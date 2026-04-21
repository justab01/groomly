'use client'

import { useState, useMemo } from 'react'
import { PawPrint, Check, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ServiceConfig {
  name: string
  description: string
  defaultPrice: number
  defaultDuration: number
  selected: boolean
  price: string
  duration: string
}

const DEFAULT_SERVICES: ServiceConfig[] = [
  { name: 'Full Groom', description: 'Bath, haircut, nail trim, ear cleaning', defaultPrice: 85, defaultDuration: 90, selected: true, price: '85', duration: '90' },
  { name: 'Bath & Brush', description: 'Bath and blow dry', defaultPrice: 55, defaultDuration: 60, selected: true, price: '55', duration: '60' },
  { name: 'Nail Trim', description: 'Nail clipping and filing', defaultPrice: 25, defaultDuration: 20, selected: true, price: '25', duration: '20' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slugChecking, setSlugChecking] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const [formData, setFormData] = useState({
    businessName: '',
    slug: '',
    phone: '',
    city: '',
    state: '',
    services: DEFAULT_SERVICES
  })

  // Check slug availability with debounce
  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null)
      return
    }

    setSlugChecking(true)
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('slug')
        .eq('slug', slug)
        .maybeSingle()

      if (error) {
        console.error('Error checking slug:', error)
        setSlugAvailable(null)
      } else {
        setSlugAvailable(!data)
      }
    } catch (err) {
      console.error('Error checking slug:', err)
      setSlugAvailable(null)
    } finally {
      setSlugChecking(false)
    }
  }

  // Handle slug input change with formatting
  const handleSlugChange = (value: string) => {
    const formattedSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
    setFormData({ ...formData, slug: formattedSlug })
    setSlugAvailable(null)
    // Debounce the check
    const timer = setTimeout(() => {
      checkSlugAvailability(formattedSlug)
    }, 500)
    return () => clearTimeout(timer)
  }

  // Update a specific service
  const updateService = (index: number, updates: Partial<ServiceConfig>) => {
    const newServices = [...formData.services]
    newServices[index] = { ...newServices[index], ...updates }
    setFormData({ ...formData, services: newServices })
  }

  // Validate step 1
  const isStep1Valid = () => {
    return (
      formData.businessName.trim() !== '' &&
      formData.slug.trim() !== '' &&
      formData.phone.trim() !== '' &&
      formData.city.trim() !== '' &&
      formData.state.trim() !== '' &&
      slugAvailable === true
    )
  }

  // Validate step 2
  const isStep2Valid = () => {
    return formData.services.some(s => s.selected)
  }

  // Get selected services for summary
  const getSelectedServices = () => {
    return formData.services.filter(s => s.selected)
  }

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        setError('You must be signed in to create a business. Please sign in and try again.')
        setLoading(false)
        return
      }

      // Double-check slug availability
      const { data: existingSlug } = await supabase
        .from('businesses')
        .select('slug')
        .eq('slug', formData.slug)
        .maybeSingle()

      if (existingSlug) {
        setError('This booking page URL is already taken. Please choose a different one.')
        setLoading(false)
        return
      }

      // Create business
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          name: formData.businessName.trim(),
          slug: formData.slug.trim(),
          owner_email: user.email!,
          phone: formData.phone.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          primary_color: '#6366F1' // Default indigo color
        })
        .select()
        .single()

      if (businessError || !business) {
        console.error('Error creating business:', businessError)
        setError(businessError?.message || 'Failed to create business. Please try again.')
        setLoading(false)
        return
      }

      const businessId = business.id

      // Create services for the business
      const servicesToCreate = getSelectedServices().map(service => ({
        business_id: businessId,
        name: service.name,
        description: service.description,
        base_price_cents: parseInt(service.price) * 100, // Convert to cents
        base_duration_minutes: parseInt(service.duration)
      }))

      if (servicesToCreate.length > 0) {
        const { error: servicesError } = await supabase
          .from('services')
          .insert(servicesToCreate)

        if (servicesError) {
          console.error('Error creating services:', servicesError)
          // Continue anyway - services can be added later
        }
      }

      // Create default business settings
      const { error: settingsError } = await supabase
        .from('business_settings')
        .insert({
          business_id: businessId,
          booking_window_days: 30,
          min_advance_booking_hours: 2,
          buffer_between_appointments_minutes: 15,
          working_hours_start: '09:00',
          working_hours_end: '17:00',
          working_days: [1, 2, 3, 4, 5], // Monday to Friday
          deposit_required_cents: 2500,
          deposit_percentage: 25,
          cancellation_policy_hours: 24,
          auto_confirm_bookings: false
        })

      if (settingsError) {
        console.error('Error creating business settings:', settingsError)
        // Continue anyway - settings have defaults
      }

      // Success! Redirect to dashboard
      router.push('/dashboard')

    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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

      {/* Error message */}
      {error && (
        <div className="max-w-xl mx-auto px-4 mb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
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
              <h1 className="text-2xl font-bold text-gray-900">Let&apos;s set up your business</h1>
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
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Paws & Claws Mobile Grooming"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Booking Page URL *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">groomly.com/b/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="your-business"
                  />
                </div>
                {slugChecking && (
                  <p className="text-sm text-gray-500 mt-1">Checking availability...</p>
                )}
                {slugAvailable === true && !slugChecking && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Check className="h-4 w-4" /> URL is available
                  </p>
                )}
                {slugAvailable === false && !slugChecking && (
                  <p className="text-sm text-red-600 mt-1">This URL is already taken</p>
                )}
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
              onClick={() => {
                setError(null)
                setStep(2)
              }}
              disabled={!isStep1Valid()}
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
              <p className="text-gray-600 mt-2">What grooming services do you offer?</p>
            </div>

            <div className="space-y-4">
              {formData.services.map((service, i) => (
                <div key={i} className={`border rounded-xl p-4 transition-colors ${service.selected ? 'border-indigo-300 bg-indigo-50/50' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-500">{service.description}</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={service.selected}
                        onChange={(e) => updateService(i, { selected: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-600">Add</span>
                    </label>
                  </div>
                  {service.selected && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Price ($)</label>
                        <input
                          type="number"
                          value={service.price}
                          onChange={(e) => updateService(i, { price: e.target.value })}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Duration (min)</label>
                        <input
                          type="number"
                          value={service.duration}
                          onChange={(e) => updateService(i, { duration: e.target.value })}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          min="5"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-500 mt-4">
              You can add more services and customize pricing later in your dashboard.
            </p>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setError(null)
                  setStep(1)
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => {
                  setError(null)
                  setStep(3)
                }}
                disabled={!isStep2Valid()}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Summary & Submit */}
      {step === 3 && (
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Ready to go!</h1>
              <p className="text-gray-600 mt-2">Review your setup before we create your account</p>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Business Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Business Name</span>
                  <span className="font-medium text-gray-900">{formData.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Page URL</span>
                  <span className="font-medium text-gray-900">groomly.com/b/{formData.slug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone</span>
                  <span className="font-medium text-gray-900">{formData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium text-gray-900">{formData.city}, {formData.state}</span>
                </div>
              </div>
            </div>

            {/* Services Summary */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Selected Services</h3>
              <div className="space-y-2">
                {getSelectedServices().map((service, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-gray-700">{service.name}</span>
                    <span className="font-medium text-gray-900">${service.price} / {service.duration} min</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-indigo-50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">What happens next:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">You&apos;ll get your custom booking page URL</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Share it on Instagram, your website, everywhere</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Clients book online, you get notified instantly</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Deposits are collected automatically</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setError(null)
                  setStep(2)
                }}
                disabled={loading}
                className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating Business...
                  </>
                ) : (
                  <>
                    Complete Setup <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-center text-gray-500 mt-4">
              You can connect Stripe later. 14-day free trial starts now.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}