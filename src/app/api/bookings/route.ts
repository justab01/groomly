import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

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

    // Generate IDs for new records
    const customerId = uuidv4()
    const petId = uuidv4()
    const bookingId = uuidv4()

    // Create or find customer
    if (booking.customer) {
      // Check if customer exists by phone
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', booking.customer.phone)
        .eq('business_id', booking.business_id)
        .single()

      if (existingCustomer) {
        // Use existing customer
        await supabase
          .from('customers')
          .update({
            name: booking.customer.name,
            email: booking.customer.email || null,
            address: booking.customer.address,
          })
          .eq('id', existingCustomer.id)
        // Use existing customer ID
        const existingId = existingCustomer.id

        // Create the booking
        const { data, error } = await supabase
          .from('bookings')
          .insert([
            {
              id: bookingId,
              business_id: booking.business_id,
              customer_id: existingId,
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

        // Create pet
        if (booking.pet) {
          await supabase
            .from('pets')
            .insert([{
              id: petId,
              customer_id: existingId,
              name: booking.pet.name,
              breed: booking.pet.breed || null,
              weight_lbs: booking.pet.weight || null,
              notes: booking.pet.notes || null,
            }])
        }

        return NextResponse.json({ booking: data })
      }
    }

    // Create new customer
    if (booking.customer) {
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

    // Create pet
    if (booking.pet) {
      await supabase
        .from('pets')
        .insert([{
          id: petId,
          customer_id: customerId,
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
          customer_id: customerId,
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

    // TODO: Send confirmation email (Sprint 1 task)
    // await sendBookingConfirmationEmail(data, booking.customer, booking.pet)

    return NextResponse.json({ booking: data })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}