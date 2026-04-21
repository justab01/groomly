'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Loader2, Lock, CreditCard } from 'lucide-react'

// Load Stripe outside of component to avoid recreating on every render
const getStripe = (publishableKey: string) => {
  return loadStripe(publishableKey)
}

interface PaymentFormProps {
  clientSecret: string
  publishableKey: string
  amount: number
  onSuccess: () => void
  onError: (error: string) => void
  onCancel: () => void
}

function PaymentForm({ clientSecret, publishableKey, amount, onSuccess, onError, onCancel }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/booking/success',
        },
        redirect: 'if_required',
      })

      if (error) {
        onError(error.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess()
      } else {
        onError('Payment status unclear. Please try again.')
      }
    } catch (err) {
      onError('An unexpected error occurred')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Deposit Amount</span>
          <span className="text-xl font-bold text-gray-900">${(amount / 100).toFixed(2)}</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          This deposit secures your appointment. The remaining balance is due after the service.
        </p>
      </div>

      <div className="border rounded-xl p-4">
        <PaymentElement
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
          }}
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Lock className="h-3 w-3" />
        <span>Your payment is secure and encrypted</span>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Pay Deposit
            </>
          )}
        </button>
      </div>
    </form>
  )
}

// Wrapper component that provides Stripe context
export function StripePayment({
  clientSecret,
  publishableKey,
  amount,
  onSuccess,
  onError,
  onCancel
}: PaymentFormProps) {
  const stripePromise = getStripe(publishableKey)

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Preparing payment...</span>
      </div>
    )
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#4f46e5',
            borderRadius: '12px',
          }
        }
      }}
    >
      <PaymentForm
        clientSecret={clientSecret}
        publishableKey={publishableKey}
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
        onCancel={onCancel}
      />
    </Elements>
  )
}

export default StripePayment