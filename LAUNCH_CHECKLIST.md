# Groomly Launch Checklist

## Pre-Launch Setup

### 1. Supabase Setup
- [ ] Create Supabase project at [supabase.com](https://supabase.com)
- [ ] Run `supabase/schema.sql` in SQL Editor
- [ ] Copy project URL to `.env.local`
- [ ] Copy anon key to `.env.local`
- [ ] Copy service role key to `.env.local`
- [ ] Enable Email Auth in Authentication > Providers
- [ ] (Optional) Configure custom SMTP for branded emails

### 2. Stripe Setup
- [ ] Create Stripe account at [stripe.com](https://stripe.com)
- [ ] Get API keys from Developers > API keys
- [ ] Copy secret key to `.env.local`
- [ ] Copy publishable key to `.env.local`
- [ ] Create webhook endpoint:
  - Endpoint: `https://your-domain.com/api/stripe/webhook`
  - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
- [ ] Copy webhook secret to `.env.local`
- [ ] Test with Stripe CLI locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### 3. Resend (Email) Setup
- [ ] Create Resend account at [resend.com](https://resend.com)
- [ ] Get API key from Settings
- [ ] Copy to `.env.local`
- [ ] Add verified domain (or use onboarding@resend.dev for testing)

### 4. Vercel Deployment
- [ ] Push code to GitHub
- [ ] Create project at [vercel.com](https://vercel.com)
- [ ] Import GitHub repository
- [ ] Add all environment variables in Vercel dashboard
- [ ] Deploy
- [ ] Add custom domain (optional)
- [ ] Configure production URL in `.env.local`

### 5. First Business Onboarding
- [ ] Create your own business in Supabase:
```sql
INSERT INTO businesses (name, slug, owner_email, phone, city, state)
VALUES ('Your Grooming Co', 'your-grooming', 'you@example.com', '555-1234', 'Austin', 'TX');

INSERT INTO business_settings (business_id)
SELECT id FROM businesses WHERE slug = 'your-grooming';

INSERT INTO services (business_id, name, description, base_price_cents, base_duration_minutes)
VALUES
  ((SELECT id FROM businesses WHERE slug = 'your-grooming'), 'Full Groom', 'Complete grooming service', 8500, 90),
  ((SELECT id FROM businesses WHERE slug = 'your-grooming'), 'Bath Only', 'Bath and blow dry', 4500, 45),
  ((SELECT id FROM businesses WHERE slug = 'your-grooming'), 'Nail Trim', 'Nail clipping and filing', 2500, 20);
```
- [ ] Test booking flow at `https://your-domain.com/b/your-grooming`
- [ ] Test dashboard at `https://your-domain.com/dashboard`

## Go-to-Market

### Week 1: Soft Launch
- [ ] Sign up 3-5 beta testers (friends in the industry)
- [ ] Gather feedback on booking flow
- [ ] Fix critical bugs
- [ ] Document common issues

### Week 2-4: Growth
- [ ] Create Google Business Profile
- [ ] Set up Google Ads ($500 credit via Stripe Atlas if eligible)
- [ ] Join Facebook groups for mobile groomers
- [ ] Post on Reddit: r/doggrooming, r/smallbusiness
- [ ] Create demo video for YouTube/TikTok
- [ ] Write launch post on Product Hunt
- [ ] Reach out to grooming schools for partnerships

### Month 2+: Scale
- [ ] Implement referral program (1 month free per referral)
- [ ] Create content marketing (blog posts on grooming tips)
- [ ] Run targeted Facebook/Instagram ads
- [ ] Attend grooming trade shows
- [ ] Partner with pet supply distributors

## Revenue Targets

| Month | Customers | MRR | Focus |
|-------|-----------|-----|-------|
| 1 | 5 | $245 | Beta testers |
| 3 | 25 | $1,225 | Product-market fit |
| 6 | 50 | $2,450 | First ads |
| 12 | 150 | $7,350 | SEO kicking in |
| 24 | 400 | $19,600 | Market presence |

## Support & Maintenance

### Daily
- [ ] Check error logs (Vercel > Functions > Logs)
- [ ] Monitor Stripe dashboard for failed payments
- [ ] Respond to customer support emails

### Weekly
- [ ] Review booking analytics
- [ ] Check for Supabase usage limits
- [ ] Update dependencies (`npm update`)

### Monthly
- [ ] Review churn rate
- [ ] Send customer satisfaction survey
- [ ] Plan feature updates
- [ ] Backup database (Supabase auto-backups)

## Security Checklist

- [ ] Enable RLS on all tables (done in schema.sql)
- [ ] Use service role key only in server-side code
- [ ] Validate all API inputs with Zod
- [ ] Rate limit API endpoints (Vercel KV or custom)
- [ ] Enable Stripe Radar for fraud prevention
- [ ] Set up uptime monitoring (UptimeRobot, free)

## Useful Links

- [Supabase Dashboard](https://app.supabase.com)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Resend Dashboard](https://app.resend.com)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Next.js Documentation](https://nextjs.org/docs)
