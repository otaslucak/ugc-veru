# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Landing page for a UGC webinar by Socials agency. Standalone HTML/CSS/JS, deployed on Vercel.

## Repository Structure

```
index.html              — Landing page (13 sections incl. video teaser + tabbed showcase)
dekujeme.html           — Thank-you page (post-registration confirmation + resources)
css/styles.css          — Mobile-first styles, custom properties, components
js/main.js              — Countdown, sticky header, accordion, form AJAX, lazy video, tab switching, anti-bot, sessionStorage gate
api/subscribe.js        — Vercel serverless function (Ecomail API proxy, rate limiting, CORS, input validation)
vercel.json             — Vercel config (rewrites, cache headers, security headers)
webinar.ics             — iCalendar file for Apple/Outlook calendar import
robots.txt              — Crawler directives (allow /, disallow /api/)
images/                 — veronika.png, otakar.jpg, socials-logo.svg
videos/                 — 12 compressed videos + 12 poster JPGs (see Video Structure below)
kontext.md              — Webinar brief (Czech, not tracked in git)
playbook.md             — UGC playbook (Slovak, not tracked in git)
```

### Video Structure (12 videos, 3 brands)

| Brand | Files | Count | Note |
|-------|-------|-------|------|
| **Natios** (magnézium) | `natios-hook1/2/3.mp4`, `natios-ai1.mp4` | 3 human + 1 AI | Hook videos are **SK (Slovak)** versions |
| **Nutworld** (ořechy) | `nutworld-hook1/2/3.mp4`, `nutworld-ai1.mp4`, `nutworld-ai2.mp4` | 3 human + 2 AI | |
| **Virexa** (doplňky) | `virexa-hook1/2/3.mp4` | 3 human | |

Posters follow naming: `{brand}-poster-{hook1|hook2|hook3|ai1|ai2}.jpg`
All compressed: 720×1280, H.264, CRF 28, no audio, `faststart`. Source originals in `.gitignore`.

## Key Context

- **Agency:** Socials — performance marketing boutique
- **Webinar:** "UGC: Kdy zvyšuje výkon kampaní a kdy je to jen drahý obsah?"
- **Date:** Wednesday 8.4.2026, 10:00
- **Platform:** Riverside
- **Target audience:** Performance marketers, CMOs, e-shop owners (100k+ CZK/month paid social)
- **Language:** All LP copy is in **Czech** (not Slovak)
- **Deploy:** Vercel — https://ugc-veru.vercel.app
- **GitHub:** https://github.com/otaslucak/ugc-veru

### Business Goal
- Acquire new clients for Socials agency
- Position Socials as go-to agency for UGC creatives (human + AI avatars)
- Bonus/lead magnet: UGC Playbook for attendees who watch until the end

## Section Order (13 sections)

1. Hero (dark) — headline, photo, registration form
2. Video Teaser (elevated) — 6 compact videos, horizontal scroll mobile, 6-col desktop
3. Pain Points (dark) — 5 pain cards
4. Takeaways (elevated) — 5 numbered items
5. Personas (dark) — 3 target audience cards
6. Speakers (elevated) — Veronika + Otakar
7. Video Showcase (dark) — **tabbed**: Natios (4) | Nutworld (5) | Virexa (3)
8. Mid CTA (elevated) — registration form 2/3
9. Bonus (dark) — UGC Playbook with CSS cover mockup
10. Social Proof (elevated) — stats + testimonial (Shoptet link)
11. FAQ (dark) — accordion
12. Final CTA (elevated) — countdown + registration form 3/3
13. Footer

Background alternates strictly: dark → elevated → dark → ...

## Technical Notes

- **No framework** — standalone HTML + CSS + vanilla JS
- **Mobile-first** — most traffic from Meta Ads is mobile
- **Hero layout:** On mobile: badge → headline (short, no prefix) → Veronika photo → form. On desktop: 2-column grid with headline+subtitle+form left, photo right.
- **3 registration forms:** hero, mid-page, final CTA — all submit to `/api/subscribe`. Placeholder "Jméno a příjmení" — backend splits into `name` + `surname`.
- **Ecomail integration:** Fully wired. `api/subscribe.js` calls Ecomail `/lists/{id}/subscribe` with `skip_confirmation`, `trigger_autoresponders`, `update_existing`. Full name is split on whitespace: first word → `name`, rest → `surname`. Contacts land in "Hlavní seznam" with tag `ugc-webinar-2026`. UTM params (`utm_source`, `utm_medium`, `utm_campaign`) parsed from URL and stored as custom fields (`UTM_SOURCE`, `UTM_MEDIUM`, `UTM_CAMPAIGN`). Requires `ECOMAIL_API_KEY` + `ECOMAIL_LIST_ID` env vars on Vercel (already set). Falls back to skeleton success response when env vars are missing (local dev).
- **Meta Pixel:** Active (ID `2287597364836978`). Events: `PageView` on both pages, `Lead` on form submit (main.js), `CompleteRegistration` on thank-you page only when `sessionStorage('ugc-registered')` is verified (prevents bot/direct-access inflation)
- **GDPR:** All "Ochrana osobních údajů" links point to `https://www.socials.cz/gdpr`
- **Videos:** 12 compressed videos (2–6.3 MB each), `preload="none"`, lazy autoplay via IntersectionObserver
- **Video Teaser:** 6 videos (mix human + AI) right after hero, horizontal scroll on mobile, 6-col grid on desktop
- **Tabbed Video Showcase:** 3 tabs (Natios/Nutworld/Virexa), tab switch pauses hidden videos and re-observes visible ones via hoisted `videoObserver`
- **AI Avatar badges:** Green outline variant (`.video-card__badge--ai`) to distinguish AI-generated creatives
- **Playbook Cover:** CSS-only mockup (`.playbook-cover`) with green header, TOC preview, Socials branding
- **Social Proof:** 28 recenzí linked to [Shoptet profil](https://partneri.shoptet.cz/profesionalove/socials-advertising/), real testimonial from teenwear.eu
- **Cache strategy:** CSS/JS use `?v=N` query params for cache-busting; `max-age=3600, must-revalidate`. Images/videos use long-lived `immutable` cache.
- **Riverside link:** `https://riverside.com/studio/socials-advertisings-studio?t=3a938320e33f7df4b5d4` — **gated** behind sessionStorage on thank-you page (hidden until verified registration), also in Google Calendar details and `.ics` file.
- **Thank-you page (`/dekujeme`):** Post-registration redirect (300ms delay for Pixel). Animated checkmark (CSS-only), date badge. Riverside button + calendar links are hidden by default (`#thankyou-gated`), shown only when `sessionStorage('ugc-registered')` is present. Direct access without registration shows fallback message (`#thankyou-noauth`) with link back to LP. 3 resource cards (YouTube, Podcast, Natima case study). `noindex, nofollow`.
- **Calendar integration:** Google Calendar via URL params, Apple/Outlook via static `webinar.ics` file. Vercel serves `.ics` with `Content-Type: text/calendar`.
- **Form flow:** Submit → timestamp anti-bot check (< 2s = silent reject) → honeypot check → Ecomail API (with UTM data) → Lead Pixel event → set `sessionStorage('ugc-registered')` → 300ms delay → redirect to `/dekujeme` → verify sessionStorage → show gated content + CompleteRegistration Pixel → remove sessionStorage flag
- **SEO basics:** `<link rel="canonical">` set to `https://ugc-veru.vercel.app/`, `og:url` set, Event schema (JSON-LD) with webinar metadata (date, speakers, free offer). No og:image currently — add `images/og-image.jpg` (1200×630) and restore og:image + twitter:card meta tags when ready. `robots.txt` allows `/`, disallows `/api/`.
- **Performance target:** LCP < 2.5s, total page < 300KB (excl. lazy-loaded videos)

## Security

- **Rate limiting:** In-memory per-IP tracking in `api/subscribe.js`. Max 5 requests per 10 minutes per IP. Returns `429`. Periodic cleanup prevents memory leaks. Note: resets on cold start (serverless limitation).
- **CORS:** `Access-Control-Allow-Origin` restricted to `https://ugc-veru.vercel.app` and `http://localhost:3000`. No wildcard.
- **OPTIONS handling:** CORS headers set and preflight handled before POST method check in `api/subscribe.js`.
- **Input validation:** Backend rejects name > 200 chars, email > 254 chars, UTM fields > 500 chars each (400). HTML inputs have `maxlength="100"` (name) and `maxlength="254"` (email).
- **Anti-bot (3 layers):** (1) Honeypot field `website` — hidden, bots fill it → silent reject. (2) Timestamp field `_ts` — set to `Date.now()` on page load, submissions under 2 seconds are silently rejected. (3) Rate limiting on backend.
- **Thank-you page gate:** Riverside link + calendar links hidden by default on `/dekujeme`. Shown only when `sessionStorage('ugc-registered')` is present (set on successful form submit). Prevents casual/direct URL access and bot pixel inflation.
- **Security headers (vercel.json):** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()` — applied globally via `/(.*) ` rule.

## Completed Setup

- **Ecomail autoresponder:** Configured in Ecomail dashboard (Automatizace → trigger: Přidání do seznamu → akce: Odeslat email). Greeting by name, date/time, Riverside link button, calendar links. Condition: tag `ugc-webinar-2026`. Tested and working.

## Content Guidelines

- Data-first, no fluff — every claim backed by real campaign numbers
- Senior-level tone: direct, pragmatic, no marketing clichés
- No generic "what is UGC" content — audience already knows the basics
- No sales pitch for Socials services — webinar stands on its own as value

## Brand Guidelines

### Colors
- **Primary:** #94e700 (green) — buttons/CTAs
- **Primary Light:** #b4ee4c
- **Primary Dark:** #76b800
- **Background (dark):** #040404
- **Foreground:** #f2f2f2, muted: #b2b2b2

### Typography
- **Font:** Work Sans (400, 600, 800)
- **Headings:** Weight 800, ALL CAPS, tight letter spacing
- **Body:** Weight 400, 1rem, 130% line height

### Border Radius
- Large: 16px / Medium: 12px / Small: 8px
