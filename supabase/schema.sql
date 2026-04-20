-- Groomly Database Schema
-- Mobile Dog Grooming Booking SaaS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Businesses table (your customers - the groomers)
CREATE TABLE businesses (
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
  primary_color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services offered by each business
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_price_cents INTEGER NOT NULL,
  base_duration_minutes INTEGER NOT NULL DEFAULT 60,
  breed_multipliers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers (pet owners booking appointments)
CREATE TABLE customers (
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
);

-- Pets
CREATE TABLE pets (
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
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  pet_id UUID REFERENCES pets(id),
  service_id UUID REFERENCES services(id),
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, completed, cancelled, no_show
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  total_price_cents INTEGER NOT NULL,
  deposit_paid_cents INTEGER DEFAULT 0,
  payment_status TEXT DEFAULT 'pending', -- pending, paid, refunded
  stripe_payment_intent_id TEXT,
  notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business settings / preferences
CREATE TABLE business_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,
  booking_window_days INTEGER DEFAULT 30,
  min_advance_booking_hours INTEGER DEFAULT 2,
  buffer_between_appointments_minutes INTEGER DEFAULT 15,
  working_hours_start TIME DEFAULT '09:00',
  working_hours_end TIME DEFAULT '17:00',
  working_days INTEGER[] DEFAULT '{1,2,3,4,5}', -- 0=Sunday, 1=Monday, etc.
  deposit_required_cents INTEGER DEFAULT 2500,
  deposit_percentage INTEGER DEFAULT 25,
  cancellation_policy_hours INTEGER DEFAULT 24,
  auto_confirm_bookings BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications log
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- confirmation, reminder, follow_up
  channel TEXT NOT NULL, -- sms, email
  recipient TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, sent, failed
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pricing rules (breed/coat based)
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  breed_pattern TEXT, -- regex pattern for breed matching
  weight_min_lbs INTEGER,
  weight_max_lbs INTEGER,
  price_adjustment_cents INTEGER NOT NULL,
  duration_adjustment_minutes INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  booking_id UUID REFERENCES bookings(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_bookings_business_date ON bookings(business_id, scheduled_date);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_services_business ON services(business_id);
CREATE INDEX idx_pets_customer ON pets(customer_id);
CREATE INDEX idx_notifications_status ON notifications(status);

-- RLS Policies (Row Level Security)
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Business policies
CREATE POLICY "Business owners can view their own business"
  ON businesses FOR SELECT
  USING (auth.uid()::TEXT = owner_email);

CREATE POLICY "Business owners can update their own business"
  ON businesses FOR UPDATE
  USING (auth.uid()::TEXT = owner_email);

-- Service policies
CREATE POLICY "Business owners can manage their services"
  ON services FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_email = auth.uid()::TEXT
    )
  );

-- Booking policies
CREATE POLICY "Business owners can view bookings for their business"
  ON bookings FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_email = auth.uid()::TEXT
    )
  );

CREATE POLICY "Business owners can update bookings for their business"
  ON bookings FOR UPDATE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_email = auth.uid()::TEXT
    )
  );

-- Customers: allow businesses to manage their customers
CREATE POLICY "Businesses can manage customers"
  ON customers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN businesses bus ON b.business_id = bus.id
      WHERE b.customer_id = customers.id
      AND bus.owner_email = auth.uid()::TEXT
    )
  );

-- Pets: same as customers
CREATE POLICY "Businesses can manage pets"
  ON pets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN businesses bus ON b.business_id = bus.id
      WHERE b.pet_id = pets.id
      AND bus.owner_email = auth.uid()::TEXT
    )
  );

-- Public booking page access (no auth required for customers)
CREATE POLICY "Public can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_settings_updated_at BEFORE UPDATE ON business_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
