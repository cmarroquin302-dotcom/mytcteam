# myTCteam — Setup Guide

## Stack
- **Next.js 15** (App Router, TypeScript)
- **Supabase** — PostgreSQL database + Auth
- **Stripe** — Payments (test mode only until you go live)
- **Tailwind CSS** — Styling
- **Vercel** — Hosting

---

## Step 1 — Install dependencies

```bash
cd mytcteam
npm install
```

---

## Step 2 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Once the project is ready, go to **Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`
3. In your Supabase project, open the **SQL Editor** and paste + run the entire contents of `supabase/schema.sql`. This creates all tables, policies, triggers, and views.

---

## Step 3 — Set up environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ⚠️  TEST KEYS ONLY — do not use sk_live_ until ready to go live
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_APP_URL=http://localhost:3000

# Your email — grants admin access
ADMIN_EMAILS=you@yourdomain.com
```

---

## Step 4 — Set up Stripe (test mode)

⚠️ **All Stripe config below is for TEST mode only.**

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) and make sure you're in **Test mode** (toggle in the top-right).
2. Go to **Developers → API keys** and copy the test Publishable Key and Secret Key into `.env.local`.
3. To receive webhook events locally:
   - Install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
   - Run: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   - Copy the webhook signing secret it prints → `STRIPE_WEBHOOK_SECRET`
4. For production (Vercel):
   - In Stripe Dashboard → **Webhooks**, add endpoint `https://your-domain.com/api/webhooks/stripe`
   - Add the events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`
   - Copy the signing secret → `STRIPE_WEBHOOK_SECRET` in Vercel env vars

**🛑 Do not replace test keys with live keys until you have explicitly decided to go live.**

---

## Step 5 — Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Step 6 — Create your admin account

1. Go to [http://localhost:3000/sign-up](http://localhost:3000/sign-up) and create an account using the email in `ADMIN_EMAILS`.
2. Access the admin dashboard at [http://localhost:3000/admin](http://localhost:3000/admin).

---

## Step 7 — Deploy to Vercel

1. Push the repo to GitHub.
2. Import the project in [vercel.com](https://vercel.com).
3. Add all the environment variables from `.env.local` to Vercel (Settings → Environment Variables).
4. Set `NEXT_PUBLIC_APP_URL` to your production domain (e.g. `https://mytcteam.com`).
5. Deploy.

---

## Monthly subscription deal counter reset

The Supabase function `reset_monthly_deal_counts()` resets `deals_used_this_month` to 0 for all subscription clients.

To run it automatically on the 1st of each month, set up a **Supabase Edge Function** or a cron job that calls:

```sql
select reset_monthly_deal_counts();
```

You can also set this up via [Supabase's pg_cron extension](https://supabase.com/docs/guides/database/extensions/pg_cron):

```sql
select cron.schedule('reset-monthly-deals', '0 0 1 * *', 'select reset_monthly_deal_counts();');
```

---

## File structure

```
app/
  page.tsx                    → Homepage (public)
  (marketing)/                → Public marketing pages
    how-it-works/
    pricing/
    contact/
  (auth)/                     → Sign in / sign up
    sign-in/
    sign-up/
  (client)/                   → Client portal (requires auth)
    dashboard/
      page.tsx                → Client overview
      deals/
        page.tsx              → Deal list
        [id]/page.tsx         → Deal detail
      new-deal/page.tsx       → Submit new file
      billing/page.tsx        → Payment history
  (admin)/                    → Admin dashboard (requires admin flag)
    admin/
      page.tsx                → Admin overview
      clients/page.tsx        → All clients
      deals/
        page.tsx              → All deals (filterable)
        [id]/page.tsx         → Deal detail + management
        new/page.tsx          → Open deal for a client
      calendar/page.tsx       → 🔑 Deadline calendar (most critical view)
      settings/page.tsx       → Closing fee, reminder config
  api/
    deals/checklist/init/     → Populates default checklist on deal creation
    billing/
      subscribe/              → Stripe subscription checkout redirect
      retainer/               → Stripe retainer checkout (per-deal)
    webhooks/stripe/          → Stripe webhook handler

lib/
  supabase/client.ts          → Browser Supabase client
  supabase/server.ts          → Server Supabase client
  stripe.ts                   → Stripe helpers (TEST MODE)
  constants.ts                → Default checklist, fee amounts
  utils.ts                    → Date/currency formatters

supabase/
  schema.sql                  → Full database schema — run in Supabase SQL Editor

types/index.ts                → All TypeScript types
```
