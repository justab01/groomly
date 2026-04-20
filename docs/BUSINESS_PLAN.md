# Groomly Business Plan

## Executive Summary

**Company:** Groomly Inc.

**Mission:** Empower mobile dog groomers with professional-grade tools to grow their businesses.

**Product:** B2B SaaS booking and business management platform built specifically for mobile dog groomers.

**Ask:** Seeking $150K pre-seed to reach 500 customers and $20K MRR within 18 months.

---

## Problem

Mobile dog groomers run their businesses with:
- Google Calendar (no deposit protection)
- Text messages (manual reminders)
- Venmo/Cash (no automatic receipts)
- Spreadsheets (lost customer data)

**Result:**
- 10-15% no-show rates
- Double-bookings
- Hours wasted on admin weekly
- Lost customer relationships

---

## Solution

Groomly provides:
1. **Online Booking** - 24/7 self-service with deposit collection
2. **Route Management** - Optimized daily schedules
3. **Customer CRM** - Complete pet profiles and booking history
4. **Payment Processing** - Secure, automatic receipts
5. **Automated Reminders** - SMS/email to reduce no-shows

**Outcome:**
- 80%+ reduction in no-shows
- 10+ hours/week saved on admin
- Professional customer experience
- Scalable business operations

---

## Market

### TAM (Total Addressable Market)
- **12,000+** mobile pet grooming businesses in the US
- **$480K/month** potential MRR at $39/mo
- **$5.76M/year** revenue potential (US only)

### SAM (Serviceable Addressable Market)
- **3,000** mobile groomers actively seeking software
- **$117K/month** realistic target
- **$1.4M/year** achievable revenue

### SOM (Serviceable Obtainable Market)
- **500 customers** in 18 months
- **$19,500 MRR**
- **$234K/year** initial target

---

## Business Model

### Revenue
- **$39/month** - Pro plan (unlimited everything)
- **$390/year** - Annual (2 months free)
- **Payment processing** - 2.9% + 30¢ (passed through)

### Unit Economics

| Metric | Value |
|--------|-------|
| ARPU | $39/month |
| Gross Margin | 95% |
| CAC (paid ads) | $150 |
| CAC (organic) | $50 |
| Blended CAC | $100 |
| Churn (est.) | 3%/month |
| Lifetime | 33 months |
| LTV | $1,287 |
| LTV:CAC | 12:1 |

### Costs (at 50 customers)

| Expense | Monthly |
|---------|---------|
| Supabase | $25 |
| Vercel Pro | $20 |
| Resend | $15 |
| Stripe fees | ~$50 |
| **Total COGS** | **~$110** |

**Gross Profit:** $1,840/month at $1,950 revenue

---

## Go-to-Market Strategy

### Phase 1: Foundation (Months 1-3)
- Launch MVP with core features
- Recruit 10 beta customers (free/discounted)
- Collect testimonials and case studies
- Iterate based on feedback

### Phase 2: Organic Growth (Months 4-9)
- SEO content (blog: "mobile grooming tips")
- Social media (Instagram, TikTok, Facebook groups)
- YouTube tutorials (grooming business advice)
- Podcast appearances (pet industry shows)
- Target: 100 customers, $3,900 MRR

### Phase 3: Paid Acquisition (Months 10-18)
- Google Ads (keywords: "mobile grooming software")
- Facebook/Instagram ads (target: groomers)
- Industry partnerships (grooming schools, suppliers)
- Trade show presence (GroomExpo, etc.)
- Target: 500 customers, $20K MRR

---

## Competitive Moat

1. **Niche Focus** - Built for mobile groomers only, not salons
2. **Route Optimization** - Proprietary algorithm for van-based scheduling
3. **Breed-Based Pricing** - Industry-specific pricing rules
4. **Customer Ownership** - No marketplace, groomers own their clients
5. **Modern UX** - Clean design vs. dated competitors

---

## Financial Projections

| Year | Customers | MRR | ARR | Gross Profit |
|------|-----------|-----|-----|--------------|
| 1 | 200 | $7,800 | $93,600 | $88,920 |
| 2 | 500 | $19,500 | $234,000 | $222,300 |
| 3 | 1,200 | $46,800 | $561,600 | $533,520 |

### Exit Scenarios

| Scenario | Multiple | Valuation |
|----------|----------|-----------|
| Conservative | 3x ARR | $1.7M |
| Base | 5x ARR | $2.8M |
| Optimistic | 8x ARR | $4.5M |

**Potential Acquirers:** Fresha, Booksy, Square, Mindbody

---

## Use of Funds

| Category | Amount | % |
|----------|--------|---|
| Product Development | $60K | 40% |
| Marketing & Sales | $60K | 40% |
| Operations | $20K | 13% |
| Legal/Admin | $10K | 7% |
| **Total** | **$150K** | **100%** |

### Runway: 18 months to $20K MRR

---

## Team

**Founder:** [Your Name]
- Background: [Your experience]
- Why this: [Your story/connection to the problem]

**Advisors:**
- [Industry advisor - grooming school owner]
- [SaaS advisor - previous exit]
- [Marketing advisor - performance marketing expert]

---

## Milestones

### 6 Months
- [ ] 50 paying customers
- [ ] $2K MRR
- [ ] 5 case studies
- [ ] Product-market fit validated

### 12 Months
- [ ] 200 customers
- [ ] $8K MRR
- [ ] Positive unit economics
- [ ] First hire (customer success)

### 18 Months
- [ ] 500 customers
- [ ] $20K MRR
- [ ] Series A ready
- [ ] Team of 4-5

---

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Competitor price war | Focus on value, not price; superior UX |
| Slow customer acquisition | Double down on content/SEO; partnerships |
| Churn higher than expected | Improve onboarding; proactive support |
| Platform risk (Supabase) | Abstract database layer; plan migration path |

---

## Appendix

### Customer Personas

**Solo Sarah**
- Solo mobile groomer
- 20-30 bookings/week
- Uses Google Calendar + Venmo
- Pain: No-shows, admin overload
- Willing to pay: $39/mo

**Mike's Mobile Spa**
- 3 vans, 5 employees
- 100+ bookings/week
- Uses Square + spreadsheets
- Pain: Scaling operations, consistency
- Willing to pay: $99/mo (multi-van)

### Technical Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Next.js   │────▶│  Supabase   │────▶│   Stripe    │
│   Frontend  │     │  (Postgres) │     │  Payments   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│    Vercel   │     │   Resend    │
│   Hosting   │     │    Email    │
└─────────────┘     └─────────────┘
```
