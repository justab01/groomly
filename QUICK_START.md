# Groomly - Quick Start Guide

**Get Groomly running in 15 minutes.**

---

## Step 1: Create Supabase Account (3 min)

1. Go to [supabase.com](https://supabase.com)
2. Sign up (free)
3. Create new project:
   - Name: `groomly`
   - Password: (save it!)
   - Region: Closest to you

---

## Step 2: Run Database Setup (5 min)

1. In Supabase dashboard, click **SQL Editor**
2. Click **New Query**
3. Open `supabase/schema.sql` from this project
4. Copy ALL contents
5. Paste into SQL Editor
6. Click **Run** (or Cmd+Enter)
7. Wait for "Success" on all statements

Then run `supabase/seed.sql` the same way (creates demo data).

---

## Step 3: Get Your API Keys (2 min)

1. In Supabase, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 4: Configure Environment (2 min)

1. In project root, copy `.env.example` to `.env.local`
2. Paste your Supabase keys
3. (Optional) Add Stripe/Resend keys later

```bash
cp .env.example .env.local
# Then edit .env.local with your keys
```

---

## Step 5: Install & Run (3 min)

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open **http://localhost:3000**

---

## Test It Out

1. **Landing Page**: http://localhost:3000
   - See the marketing site

2. **Demo Booking**: http://localhost:3000/b/demo-grooming
   - Test the booking flow

3. **Dashboard**: http://localhost:3000/dashboard
   - See route, customers, revenue

4. **Onboarding**: http://localhost:3000/onboarding
   - Test new user signup flow

---

## Deploy to Vercel (when ready)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Push to production
git push
```

---

## Next Steps

1. **Customize branding** - Edit colors, logo in `src/components/`
2. **Add your Stripe key** - Get from [stripe.com](https://stripe.com)
3. **Add your Resend key** - Get from [resend.com](https://resend.com)
4. **Invite beta customers** - Share your booking page URL

---

## Getting Help

- Check `README.md` for full documentation
- Check `docs/` for business plan and go-to-market strategy
- Review Supabase logs: Dashboard → Logs
- Review Vercel logs: Dashboard → Functions

---

## What You Have

✅ Full booking platform for mobile groomers
✅ Customer-facing booking pages
✅ Business dashboard with CRM
✅ Payment processing (Stripe ready)
✅ Email system (Resend ready)
✅ Investor-ready business plan
✅ Go-to-market strategy
✅ Financial projections

**Next:** Get your first 10 beta customers!
