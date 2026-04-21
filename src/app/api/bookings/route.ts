import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
  )
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

async function sendConfirmationEmail(booking: any, customer: any, pet: any, service: any, business: any) {
  if (!customer?.email) return

  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'confirmation',
        to: customer.email,
        subject: `Booking Confirmed - ${formatDate(booking.scheduled_date)}`,
        booking: {
          customer_name: customer.name,
          pet_name: pet?.name,
          scheduled_date: formatDate(booking.scheduled_date),
          scheduled_time: booking.scheduled_time,
          service_name: service?.name || 'Grooming Service',
          total_price_cents: booking.total_price_cents,
          business_name: business?.name || 'Your Groomer',
        },
      }),
    })
  } catch (emailError) {
    console.error('Failed to send confirmation email:', emailError)
  }
}

export async function POST(request: NextRequest) {
  try {
    const booking = await request.json()
    const supabase = getSupabase()

    // Generate IDs for new records
    const customerId = uuidv4()
    const petId = uuidv4()
    const bookingId = uuidv4()

    // Fetch service and business info for email
    const [{ data: service }, { data: business }] = await Promise.all([
      supabase.from('services').select('name').eq('id', booking.service_id).single(),
      supabase.from('businesses').select('name').eq('id', booking.business_id).single(),
    ])

    // Check if customer exists by phone
    let existingCustomerId: string | null = null
    if (booking.customer?.phone) {
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', booking.customer.phone)
        .eq('business_id', booking.business_id)
        .single()

      if (existingCustomer) {
        existingCustomerId = existingCustomer.id
        // Update existing customer
        await supabase
          .from('customers')
          .update({
            name: booking.customer.name,
            email: booking.customer.email || null,
            address: booking.customer.address,
          })
          .eq('id', existingCustomerId)
      }
    }

    // Create new customer if not exists
    if (!existingCustomerId && booking.customer) {
      await supabase
        .from('customers')
        .insert([{
          id: customerId,
          business_id: booking.business_id,
          name: booking.customer.name,
          phone: booking.customer.phone,
          email: booking.customer.email || null,
          address: booking.customer.address,
        }])
    }

    const finalCustomerId = existingCustomerId || customerId

    // Create pet
    if (booking.pet) {
      await supabase
        .from('pets')
        .insert([{
          id: petId,
          customer_id: finalCustomerId,
          name: booking.pet.name,
          breed: booking.pet.breed || null,
          weight_lbs: booking.pet.weight || null,
          notes: booking.pet.notes || null,
        }])
    }

    // Create the booking
    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          id: bookingId,
          business_id: booking.business_id,
          customer_id: finalCustomerId,
          pet_id: petId,
          service_id: booking.service_id,
          scheduled_date: booking.scheduled_date,
          scheduled_time: booking.scheduled_time,
          duration_minutes: booking.duration_minutes,
          total_price_cents: booking.total_price_cents,
          deposit_paid_cents: booking.deposit_paid_cents || 0,
          status: booking.status || 'pending',
          payment_status: booking.payment_status || 'pending',
          notes: booking.notes,
        },
      ])
      .select()
      .single()

    if (error) throw error

    // Send confirmation email
    await sendConfirmationEmail(booking, booking.customer, booking.pet, service, business)

    return NextResponse.json({ booking: data })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}