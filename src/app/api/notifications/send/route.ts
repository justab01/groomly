import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 're_test')
}

export async function POST(request: NextRequest) {
  try {
    const { type, to, subject, booking } = await request.json()
    const resend = getResend()

    let html = ''

    switch (type) {
      case 'confirmation':
        html = getConfirmationEmailHtml(booking)
        break
      case 'reminder':
        html = getReminderEmailHtml(booking)
        break
      case 'followup':
        html = getFollowUpEmailHtml(booking)
        break
      default:
        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: process.env.NEXT_PUBLIC_APP_URL?.replace('https://', 'noreply@') || 'Groomly <noreply@groomly.com>',
      to: [to],
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Notification error:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}

function getConfirmationEmailHtml(booking: any) {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1e40af;">Booking Confirmed! 🐾</h1>
      <p>Hi ${booking.customer_name},</p>
      <p>Your grooming appointment for <strong>${booking.pet_name}</strong> has been confirmed!</p>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Date:</strong> ${booking.scheduled_date}</p>
        <p><strong>Time:</strong> ${booking.scheduled_time}</p>
        <p><strong>Service:</strong> ${booking.service_name}</p>
        <p><strong>Total:</strong> $${(booking.total_price_cents / 100).toFixed(2)}</p>
      </div>

      <p>We'll send you a reminder 24 hours before your appointment.</p>
      <p>Questions? Reply to this email or call us.</p>

      <p style="color: #6b7280; font-size: 14px;">
        See you soon!<br>
        ${booking.business_name}
      </p>
    </div>
  `
}

function getReminderEmailHtml(booking: any) {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1e40af;">Reminder: Appointment Tomorrow! 🐕</h1>
      <p>Hi ${booking.customer_name},</p>
      <p>This is a friendly reminder about ${booking.pet_name}'s grooming appointment tomorrow.</p>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Date:</strong> ${booking.scheduled_date}</p>
        <p><strong>Time:</strong> ${booking.scheduled_time}</p>
        <p><strong>Service:</strong> ${booking.service_name}</p>
      </div>

      <p>Please make sure ${booking.pet_name} has had a chance to go potty before we arrive!</p>

      <p style="color: #6b7280; font-size: 14px;">
        ${booking.business_name}
      </p>
    </div>
  `
}

function getFollowUpEmailHtml(booking: any) {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1e40af;">How did we do? 🐾</h1>
      <p>Hi ${booking.customer_name},</p>
      <p>Thanks for choosing us for ${booking.pet_name}'s grooming needs!</p>
      <p>We'd love to hear how we did. Reply to this email with any feedback.</p>

      <p style="color: #6b7280; font-size: 14px;">
        ${booking.business_name}
      </p>
    </div>
  `
}
