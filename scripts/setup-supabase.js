const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setup() {
  console.log('Setting up Groomly database...\n');

  // Create tables
  const tables = [
    `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,

    `CREATE TABLE businesses (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      owner_email TEXT NOT NULL,
      stripe_account_id TEXT,
      stripe_customer_id TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip_code TEXT,
      logo_url TEXT,
      primary_color TEXT DEFAULT '#6366F1',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    `CREATE TABLE services (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      base_price_cents INTEGER NOT NULL,
      base_duration_minutes INTEGER NOT NULL DEFAULT 60,
      breed_multipliers JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    `CREATE TABLE customers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email TEXT,
      phone TEXT NOT NULL,
      name TEXT NOT NULL,
      address TEXT,
      city TEXT,
      state TEXT,
      zip_code TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    `CREATE TABLE pets (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      breed TEXT,
      weight_lbs INTEGER,
      age_years INTEGER,
      notes TEXT,
      behavior_flags TEXT[],
      medical_alerts TEXT[],
      photo_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    `CREATE TABLE bookings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
      customer_id UUID REFERENCES customers(id),
      pet_id UUID REFERENCES pets(id),
      service_id UUID REFERENCES services(id),
      status TEXT NOT NULL DEFAULT 'pending',
      scheduled_date DATE NOT NULL,
      scheduled_time TIME NOT NULL,
      duration_minutes INTEGER NOT NULL,
      total_price_cents INTEGER NOT NULL,
      deposit_paid_cents INTEGER DEFAULT 0,
      payment_status TEXT DEFAULT 'pending',
      stripe_payment_intent_id TEXT,
      notes TEXT,
      cancellation_reason TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    `CREATE TABLE business_settings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      business_id UUID UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,
      booking_window_days INTEGER DEFAULT 30,
      min_advance_booking_hours INTEGER DEFAULT 2,
      buffer_between_appointments_minutes INTEGER DEFAULT 15,
      working_hours_start TIME DEFAULT '09:00',
      working_hours_end TIME DEFAULT '17:00',
      working_days INTEGER[] DEFAULT '{1,2,3,4,5}',
      deposit_required_cents INTEGER DEFAULT 2500,
      deposit_percentage INTEGER DEFAULT 25,
      cancellation_policy_hours INTEGER DEFAULT 24,
      auto_confirm_bookings BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    `CREATE TABLE notifications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      channel TEXT NOT NULL,
      recipient TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      sent_at TIMESTAMPTZ,
      error_message TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    `CREATE TABLE pricing_rules (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
      service_id UUID REFERENCES services(id) ON DELETE CASCADE,
      breed_pattern TEXT,
      weight_min_lbs INTEGER,
      weight_max_lbs INTEGER,
      price_adjustment_cents INTEGER NOT NULL,
      duration_adjustment_minutes INTEGER DEFAULT 0,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`
  ];

  for (const sql of tables) {
    console.log('Creating table...');
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
      console.log(`  Note: ${error.message}`);
    } else {
      console.log('  ✓ Done');
    }
  }

  // Create demo business
  console.log('\nCreating demo business...');
  const { data: business, error } = await supabase
    .from('businesses')
    .insert([{
      name: 'Demo Mobile Grooming',
      slug: 'demo-grooming',
      owner_email: 'demo@groomly.com',
      phone: '555-123-4567',
      city: 'Austin',
      state: 'TX',
      primary_color: '#6366F1'
    }])
    .select()
    .single();

  if (error) {
    console.log(`  Error: ${error.message}`);
  } else {
    console.log('  ✓ Business created');

    // Create services
    const { error: servicesError } = await supabase
      .from('services')
      .insert([
        { business_id: business.id, name: 'Full Groom', description: 'Complete grooming: bath, haircut, nail trim, ear cleaning', base_price_cents: 8500, base_duration_minutes: 90 },
        { business_id: business.id, name: 'Bath & Brush', description: 'Bath, blow dry, and brush out', base_price_cents: 5500, base_duration_minutes: 60 },
        { business_id: business.id, name: 'Nail Trim', description: 'Nail clipping and filing', base_price_cents: 2500, base_duration_minutes: 20 },
        { business_id: business.id, name: 'De-Shedding', description: 'Special treatment to reduce shedding', base_price_cents: 7500, base_duration_minutes: 75 }
      ]);

    if (servicesError) {
      console.log(`  Services error: ${servicesError.message}`);
    } else {
      console.log('  ✓ Services created');
    }

    // Create business settings
    await supabase.from('business_settings').insert([{ business_id: business.id }]);
  }

  console.log('\n✅ Setup complete!');
  console.log('\nYour demo booking page: http://localhost:3000/b/demo-grooming');
}

setup().catch(console.error);
