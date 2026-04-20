# Quick Start Guide

Get Groomly running in 15 minutes.

## Step 1: Create Accounts (5 min)

1. **Supabase** - [supabase.com/new](https://supabase.com/new)
   - Free tier includes everything you need
   - Note your project URL and keys

2. **Stripe** - [stripe.com/register](https://stripe.com/register)
   - Free to start, 2.9% + 30¢ per transaction
   - Get API keys from Developers section

3. **Resend** - [resend.com/signup](https://resend.com/signup)
   - Free: 100 emails/day, 3,000/month
   - Get API key from Settings

## Step 2: Configure Environment (2 min)

```bash
cd groomly
cp .env.example .env.local
```

Edit `.env.local`:

```bash
# Supabase - from Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Stripe - from Developers > API keys
STRIPE_SECRET_KEY=sk_test_xxx...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx...
STRIPE_WEBHOOK_SECRET=whsec_xxx...

# Resend - from Settings
RESEND_API_KEY=re_xxx...

# Your app URL (update after deploying)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Set Up Database (3 min)

1. Go to Supabase SQL Editor
2. Copy entire contents of `supabase/schema.sql`
3. Click "Run"
4. Done! All tables, policies, and triggers created.

## Step 4: Run Locally (1 min)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 5: Create Your First Business (2 min)

In Supabase SQL Editor:

```sql
-- Create your business
INSERT INTO businesses (name, slug, owner_email, phone, city, state, primary_color)
VALUES ('Mobile Dog Grooming by You', 'your-business', 'you@example.com', '555-123-4567', 'Austin', 'TX', '#3B82F6');

-- Add business settings
INSERT INTO business_settings (business_id)
SELECT id FROM businesses WHERE slug = 'your-business';

-- Add services
INSERT INTO services (business_id, name, description, base_price_cents, base_duration_minutes)
VALUES
  ((SELECT id FROM businesses WHERE slug = 'your-business'), 'Full Groom', 'Complete grooming: bath, haircut, nail trim, ear cleaning', 8500, 90),
  ((SELECT id FROM businesses WHERE slug = 'your-business'), 'Bath & Brush', 'Bath, blow dry, and brush out', 5500, 60),
  ((SELECT id FROM businesses WHERE slug = 'your-business'), 'Nail Trim', 'Nail clipping and filing', 2500, 20),
  ((SELECT id FROM businesses WHERE slug = 'your-business'), 'De-Shedding', 'Special treatment to reduce shedding', 6500, 75);
```

## Step 6: Test the Booking Flow

1. Visit: `http://localhost:3000/b/your-business`
2. Select a service
3. Pick date/time
4. Enter customer info
5. Complete booking

## Step 7: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

1. Follow prompts to link/create project
2. Add environment variables when prompted
3. Deploy completes automatically

Your production URL: `https://groomly-xxx.vercel.app`

## Next Steps

- See `LAUNCH_CHECKLIST.md` for go-to-market strategy
- Customize branding in `app/page.tsx`
- Add your logo to `public/`
- Set up Stripe webhooks for production

## Troubleshooting

**"Invalid API key"**: Double-check environment variables, ensure no extra spaces

**"Relation does not exist"**: Run the schema.sql in Supabase

**Booking page 404**: Check the business slug exists in database

**Stripe errors**: Verify webhook secret is correct, test mode keys start with `sk_test_`

## Getting Help

- Check `README.md` for full documentation
- Review Supabase logs: [app.supabase.com](https://app.supabase.com) > Logs
- Review Vercel logs: [vercel.com](https://vercel.com) > Your Project > Functions
