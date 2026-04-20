import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BookingPage from './booking-page'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function BusinessBookingPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('*, services(*), business_settings(*)')
    .eq('slug', slug)
    .single()

  if (!business) {
    notFound()
  }

  return <BookingPage business={business} />
}
