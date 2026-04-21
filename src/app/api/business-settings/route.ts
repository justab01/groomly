import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
  )
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const businessId = searchParams.get('businessId')

  if (!businessId) {
    return NextResponse.json({ error: 'Business ID required' }, { status: 400 })
  }

  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('business_settings')
    .select('*')
    .eq('business_id', businessId)
    .single()

  if (error) {
    // Return defaults if no settings exist
    return NextResponse.json({
      deposit_amount_cents: 2500,
      working_hours_start: '09:00',
      working_hours_end: '17:00',
    })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { business_id, ...settings } = body

  if (!business_id) {
    return NextResponse.json({ error: 'Business ID required' }, { status: 400 })
  }

  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('business_settings')
    .upsert({
      business_id,
      ...settings,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }

  return NextResponse.json(data)
}