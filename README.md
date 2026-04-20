# Groomly

**Booking software for mobile dog groomers.**

The all-in-one platform to manage bookings, payments, and customer communication—built specifically for mobile grooming businesses, not salons.

---

## Quick Links

- [Live Demo](https://groomly-demo.vercel.app)
- [Landing Page](https://groomly-demo.vercel.app/b/demo-grooming)
- [Dashboard](https://groomly-demo.vercel.app/dashboard)

---

## What is Groomly?

Groomly is a B2B SaaS platform that helps mobile dog groomers:
- Accept online bookings 24/7
- Collect deposits to reduce no-shows
- Manage their customer database (CRM)
- Optimize their daily routes
- Process payments securely

**Target Customer:** Mobile dog grooming business owners (solo operators or 2-5 van operations)

**Revenue Model:** $39/month per business, unlimited everything

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend | Supabase (PostgreSQL + Auth) |
| Payments | Stripe |
| Email | Resend |
| Hosting | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account (free tier works)
- Stripe account (test mode OK)
- Resend account (optional, for email)

### Installation

```bash
# Clone the repo
git clone <your-repo-url> groomly
cd groomly

# Install dependencies
npm install

# Copy env file
cp .env.example .env.local

# Edit .env.local with your keys
```

### Environment Variables

```env
# Supabase (from Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (from Developers > API Keys)
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Resend (from Settings > API Keys)
RESEND_API_KEY=re_xxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Set Up Database

1. Go to Supabase SQL Editor
2. Run the SQL from `supabase/schema.sql`
3. Run the seed data from `supabase/seed.sql`

### Run Locally

```bash
npm run dev
```

Open http://localhost:3000

---

## Project Structure

```
groomly/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (marketing)         # Landing page
│   │   ├── auth/               # Sign in / Sign up
│   │   ├── dashboard/          # Business owner dashboard
│   │   ├── b/[slug]/           # Public booking pages
│   │   └── api/                # API routes
│   ├── components/             # Reusable UI components
│   └── lib/                    # Utilities, Supabase client
├── supabase/
│   ├── schema.sql              # Database schema
│   └── seed.sql                # Demo data
├── public/                     # Static assets
├── scripts/
│   └── setup-supabase.js       # One-click setup script
├── docs/
│   ├── BUSINESS_PLAN.md        # Full business plan
│   ├── GO_TO_MARKET.md         # Marketing strategy
│   └── INVESTOR_DECK.md        # Pitch deck outline
└── .env.local                  # Environment variables
```

---

## Features

### For Business Owners

- **Dashboard** - See today's route, revenue, upcoming bookings
- **Customer CRM** - Track clients, pets, booking history, lifetime value
- **Services** - Manage services, pricing, breed-based rules
- **Settings** - Configure hours, booking rules, branding

### For Customers (Pet Owners)

- **Online Booking** - Book 24/7 from any device
- **Service Selection** - Clear descriptions and pricing
- **Pet Profiles** - Save pet info for faster booking
- **Payment** - Secure deposit via Stripe

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Push to deploy
git push
```

### Custom Domain

1. Buy domain (Namecheap, GoDaddy, etc.)
2. Add in Vercel: Settings → Domains
3. Update DNS records as instructed

---

## Business Metrics

### Unit Economics (at 50 customers)

| Metric | Value |
|--------|-------|
| MRR | $1,950 |
| COGS | ~$100 (Supabase, Vercel, Resend) |
| Gross Margin | 95% |
| CAC (est.) | $150 |
| LTV (est.) | $1,400 |
| LTV:CAC | 9:1 |

### Path to $20K MRR

| Month | Customers | MRR | Focus |
|-------|-----------|-----|-------|
| 1-3 | 0-25 | $0-$975 | Product-market fit |
| 4-6 | 25-100 | $975-$3,900 | First ads, content |
| 7-12 | 100-300 | $3,900-$11,700 | SEO, referrals |
| 13-18 | 300-500 | $11,700-$19,500 | Scale ads, partnerships |

---

## Competitive Landscape

| Competitor | Price | Weakness |
|------------|-------|----------|
| Booksy | $30-80/mo | Shows competitors to clients |
| Fresha | Commission | Marketplace model |
| Square Appointments | $0-69/mo | Generic, not mobile-focused |
| MoeGo | $49-150/mo | Direct competitor |
| **Groomly** | **$39/mo** | **Built for mobile, honest pricing** |

---

## Next Steps

1. **Launch MVP** - Get first 10 paying customers
2. **Collect Feedback** - Iterate based on real usage
3. **Content Marketing** - Blog, SEO, social proof
4. **Paid Ads** - Google/FB targeting mobile groomers
5. **Partnerships** - Grooming schools, suppliers

---

## License

MIT

---

## Contact

Built for mobile dog groomers, by someone who understands the business.

Questions? Reach out at <your-email>@groomly.com
