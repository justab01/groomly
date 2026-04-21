import { z } from 'zod'

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number is required').max(20),
  address: z.string().min(1, 'Address is required').max(200),
})

export const petSchema = z.object({
  name: z.string().min(1, 'Pet name is required').max(50),
  breed: z.string().max(50).optional(),
  weight: z.number().min(1).max(500).optional(),
  notes: z.string().max(500).optional(),
})

export const bookingSchema = z.object({
  business_id: z.string().uuid(),
  service_id: z.string().uuid(),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  scheduled_time: z.string().regex(/^\d{1,2}:\d{2}\s?(AM|PM)$/i, 'Invalid time format'),
  duration_minutes: z.number().min(15).max(480),
  total_price_cents: z.number().min(0),
  customer: customerSchema,
  pet: petSchema,
})

export const businessSchema = z.object({
  name: z.string().min(1, 'Business name is required').max(100),
  slug: z.string()
    .min(3, 'Booking URL must be at least 3 characters')
    .max(30, 'Booking URL must be at most 30 characters')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed'),
  phone: z.string().min(10, 'Phone number is required'),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().length(2, 'State is required'),
})

export const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required').max(100),
  description: z.string().max(500).optional(),
  base_price_cents: z.number().min(100, 'Price must be at least $1'),
  base_duration_minutes: z.number().min(15, 'Duration must be at least 15 minutes').max(480),
})

export type CustomerInput = z.infer<typeof customerSchema>
export type PetInput = z.infer<typeof petSchema>
export type BookingInput = z.infer<typeof bookingSchema>
export type BusinessInput = z.infer<typeof businessSchema>
export type ServiceInput = z.infer<typeof serviceSchema>