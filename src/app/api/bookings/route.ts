import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
  )
}

export async function POST(request: NextRequest) {
  try {
    const booking = await request.json()
    const supabase = getSupabase()

    // Create the booking
    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          business_id: booking.business_id,
          customer_id: booking.customer_id,
          pet_id: booking.pet_id,
          service_id: booking.service_id,
          scheduled_date: booking.scheduled_date,
          scheduled_time: booking.scheduled_time,
          duration_minutes: booking.duration_minutes,
          total_price_cents: booking.total_price_cents,
          deposit_paid_cents: booking.deposit_paid_cents || 0,
          status: 'pending',
          payment_status: 'pending',
          notes: booking.notes,
        },
      ])
      .select()
      .single()

    if (error) throw error

    // Create customer if new
    if (booking.customer) {
      await supabase
        .from('customers')
        .upsert({
          id: booking.customer_id,
          name: booking.customer.name,
          phone: booking.customer.phone,
          email: booking.customer.email,
          address: booking.customer.address,
        })
    }

    // Create pet if new
    if (booking.pet) {
      await supabase
        .from('pets')
        .upsert({
          id: booking.pet_id,
          customer_id: booking.customer_id,
          name: booking.pet.name,
          breed: booking.pet.breed,
          weight_lbs: booking.pet.weight,
          notes: booking.pet.notes,
        })
    }

    return NextResponse.json({ booking: data })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
