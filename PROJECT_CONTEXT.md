# Project Context: AIF Superprofile Funnel

## 1. Overview & Objective
This project (`aif-superprofile-funnel`) is an isolated replica of the live AI Influencer Workshop funnel (`aifworkshop.prateekmayani.com`).
The goal is to test alternate messaging and copy variations while keeping the production funnel 100% untouched and active in parallel.

- **Target Domain**: `live.prateekmayani.com`
- **Hosted On**: Cloudflare Workers / Nitro
- **Git Repository**: `git@github.com:uprisestudio10-ctrl/aif-superprofile-funnel.git` (branch `main`)
- **Auto-Commit Rule**: After completing tasks, stage, commit, and push directly:
  `git add -A && git commit -m "<message>" && git push origin main`

---

## 2. Key Differences from Production Funnel
1. **Checkout / Payment Gateway**:
   - Production uses: Razorpay modal & internal checkout route (`/checkout`).
   - This Funnel uses: **Superprofile** checkout.
   - All CTA buttons should route directly to the Superprofile checkout URL, appending tracking parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `fbclid`).
2. **Meta Tracking (Pixel & CAPI)**:
   - Dedicated Meta Pixel ID specifically for this test funnel / Superprofile.
   - Independent Meta CAPI configuration.
3. **n8n Automation & Workflows**:
   - Active n8n Instance: `https://prateek.n8n.preetamsoni.com/`
   - Use dedicated webhooks (e.g. `/webhook/aif-superprofile-leads`) and workflows so production Google Sheets (`AIF Workshop`) and production leads are never overwritten or affected.

---

## 3. Tech Stack & Architecture
- Framework: TanStack Start / React / Vite
- Deployment Target: Cloudflare Workers via Nitro
- All images and assets are self-hosted locally in `src/assets/` and `public/assets/` (no Lovable proxy dependencies).
- Build command: `bun run build` or `npm run build`
