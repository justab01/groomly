-- Demo data for Groomly

-- Create demo business
INSERT INTO businesses (name, slug, owner_email, phone, city, state, primary_color)
VALUES ('Demo Mobile Grooming', 'demo-grooming', 'demo@groomly.com', '555-123-4567', 'Austin', 'TX', '#6366F1')
ON CONFLICT (slug) DO NOTHING;

-- Create services for demo business
INSERT INTO services (business_id, name, description, base_price_cents, base_duration_minutes)
SELECT
  b.id,
  service_data.name,
  service_data.description,
  service_data.base_price_cents,
  service_data.base_duration_minutes
FROM businesses b
CROSS JOIN (
  VALUES
    ('Full Groom', 'Complete grooming: bath, haircut, nail trim, ear cleaning', 8500, 90),
    ('Bath & Brush', 'Bath, blow dry, and brush out', 5500, 60),
    ('Nail Trim', 'Nail clipping and filing', 2500, 20),
    ('De-Shedding', 'Special treatment to reduce shedding', 7500, 75)
) AS service_data(name, description, base_price_cents, base_duration_minutes)
WHERE b.slug = 'demo-grooming'
ON CONFLICT DO NOTHING;

-- Create business settings
INSERT INTO business_settings (business_id, booking_window_days, buffer_between_appointments_minutes, deposit_required_cents)
SELECT
  id,
  30,
  15,
  2500
FROM businesses
WHERE slug = 'demo-grooming'
ON CONFLICT (business_id) DO NOTHING;

-- Create demo customers
INSERT INTO customers (name, email, phone, city, state) VALUES
  ('Sarah Johnson', 'sarah.j@email.com', '555-0101', 'Austin', 'TX'),
  ('Mike Chen', 'mike.c@email.com', '555-0102', 'Austin', 'TX'),
  ('Emily Davis', 'emily.d@email.com', '555-0103', 'Round Rock', 'TX'),
  ('James Wilson', 'james.w@email.com', '555-0104', 'Cedar Park', 'TX'),
  ('Lisa Brown', 'lisa.b@email.com', '555-0105', 'Austin', 'TX')
ON CONFLICT DO NOTHING;

-- Create demo pets
INSERT INTO pets (customer_id, name, breed, weight_lbs)
SELECT
  c.id,
  pet_data.name,
  pet_data.breed,
  pet_data.weight_lbs
FROM customers c
CROSS JOIN (
  VALUES
    ('Fluffy', 'Golden Retriever', 65),
    ('Max', 'Poodle', 45),
    ('Bella', 'Labrador', 70),
    ('Charlie', 'Beagle', 25),
    ('Luna', 'German Shepherd', 75)
) AS pet_data(name, breed, weight_lbs)
WHERE c.email IN ('sarah.j@email.com', 'mike.c@email.com', 'emily.d@email.com', 'james.w@email.com', 'lisa.b@email.com')
ON CONFLICT DO NOTHING;
