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
.env.example            — Env var documentation (ECOMAIL_API_KEY, ECOMAIL_LIST_ID)
robots.txt              — Crawler directives (allow /, disallow /api/)
fonts/                  — Self-hosted Work Sans woff2 (latin + latin-ext)
images/                 — veronika.png, jarda.jpg, socials-logo.svg, og-image.jpg + WebP variants + responsive sizes
videos/                 — 12 compressed videos + 12 poster JPGs (see Video Structure below)
favicon.svg             — SVG favicon (green dot on dark bg)
favicon.ico             — ICO fallback (32×32)
apple-touch-icon.png    — Apple touch icon (180×180)
kontext.md              — Webinar brief (Czech, not tracked in git)
playbook.md             — UGC playbook source (Slovak, not tracked in git)
playbook.html           — UGC Playbook — styled HTML page (Czech), dark theme, Socials branding, print-ready
playbook-cz.md          — Czech Markdown export of playbook (for download / LLM use)
audio/                  — ugc-podcast.m4a (~50 MB, NotebookLM-generated podcast)
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
- **Deploy:** Vercel — https://ugc.socials.cz (alias: ugc-veru.vercel.app)
- **GitHub:** https://github.com/otaslucak/ugc-veru

### Speakers
- **Veronika Styková** — UGC tvůrkyně & Meta Ads specialistka (hlavní speaker, foto v hero)
- **Jaroslav Bobák** — Meta Ads specialista, projektový manažer zaměřený na škálování, moderátor webináře

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
6. Speakers (elevated) — Veronika + Jaroslav Bobák
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
- **Meta Pixel:** Active (ID `2287597364836978`). **Blocked until marketing consent** via Cookiebot (`type="text/plain" data-cookieconsent="marketing"`). Events: `PageView` on both pages, `Lead` on form submit (main.js), `CompleteRegistration` on thank-you page only when `sessionStorage('ugc-registered')` is verified (prevents bot/direct-access inflation). On `dekujeme.html`, `CompleteRegistration` also listens for `CookiebotOnAccept` event (fallback for delayed consent).
- **Cookiebot:** Consent banner on both pages. CBID `28189135-a400-4497-86e8-4fcba007c3e5` (shared domain group with `www.socials.cz`). `data-blockingmode="auto"`. Configured in [Cookiebot Manager](https://manage.cookiebot.com). Banner language auto-detected from `<html lang="cs">`.
- **GDPR:** All "Ochrana osobních údajů" links point to `https://www.socials.cz/gdpr`
- **Videos:** 12 compressed videos (2–6.3 MB each), `preload="none"`, lazy autoplay via IntersectionObserver
- **Video Teaser:** 6 videos (mix human + AI) right after hero, horizontal scroll on mobile, 6-col grid on desktop
- **Tabbed Video Showcase:** 3 tabs (Natios/Nutworld/Virexa), tab switch pauses hidden videos and re-observes visible ones via hoisted `videoObserver`
- **AI Avatar badges:** Green outline variant (`.video-card__badge--ai`) to distinguish AI-generated creatives
- **Playbook Cover:** CSS-only mockup (`.playbook-cover`) with green header, TOC preview, Socials branding
- **Social Proof:** 28 recenzí linked to [Shoptet profil](https://partneri.shoptet.cz/profesionalove/socials-advertising/), real testimonial from teenwear.eu
- **Cache strategy:** CSS/JS use `?v=N` query params for cache-busting; `max-age=3600, must-revalidate`. Images/videos/fonts/audio use long-lived `immutable` cache.
- **UGC Playbook (`/playbook`):** Standalone HTML page in Czech, dark Socials theme (#040404 bg, #94e700 accents, Google Fonts Work Sans). Content translated from Slovak `playbook.md`. Sections: Intro, Strategy (A), Execution (B) with 15-step checklist, Brief Template, Outreach Templates, Pricing Guide, Conclusion. `noindex, nofollow`. Print stylesheet switches to light theme for PDF export. Uses Google Fonts (allowed in CSP via `fonts.googleapis.com` + `fonts.gstatic.com`). Rewrite `/playbook` → `/playbook.html` in vercel.json. Placeholder `{{PLAYBOOK_URL}}` in email templates should point to `https://ugc.socials.cz/playbook`. Features: final CTA section "Potřebujete s tím pomoci?" (link to socials.cz), 3 soft inline CTAs throughout, CSS-only infographics (process flow, video structure flow, outreach funnel, benchmark bars), copy-to-clipboard on Brief Template + Outreach Messages (plain text output, cloned DOM to strip buttons/indentation). Bonus tips use `.bonus-section` (large wrapper with green gradient border, star badge, glow) and `.callout--bonus` (smaller variant) for visually distinct exclusive styling. Anglicism "Outreach je game of volume" replaced with "Oslovování tvůrců je hra s čísly" + explanatory paragraph. Mobile-responsive (≤600px breakpoint): `overflow-x: hidden` on `html`+`body` to prevent horizontal scroll (`.cover::before` 600px pseudo-element was overflowing), `.cover` has `overflow: hidden` for containment. Reduced paddings on all components, TOC links are `<a>` anchors with `scroll-behavior: smooth`, intro cards "A — Strategická část" / "B — Exekuční část" are clickable `.card--link` elements navigating to `#kdy-ugc` / `#checklist`. Tracking: Cookiebot consent banner, Meta Pixel (`2287597364836978`, marketing consent — PageView, ViewContent on scroll 50%/100%, Contact on final CTA), GA4 (`G-239XYDWJXB`, statistics consent — page_view, scroll_depth 50/100%, copy_content, cta_click, toc_navigation). CSP updated for `googletagmanager.com` + `google-analytics.com` domains. Tools section (`.playbook-tools`) above TOC: two cards side-by-side (stacked on mobile) — Markdown download (`playbook-cz.md`, `Content-Disposition: attachment`) and NotebookLM audio podcast (`audio/ugc-podcast.m4a`, `<audio>` player with `preload="metadata"` for faster playback start). GA4 `file_download` event on Markdown download.
- **Riverside link:** `https://riverside.com/studio/socials-advertisings-studio?t=3a938320e33f7df4b5d4` — **gated** behind sessionStorage on thank-you page (hidden until verified registration), also in Google Calendar details and `.ics` file.
- **Thank-you page (`/dekujeme`):** Post-registration redirect (300ms delay for Pixel). Animated checkmark (CSS-only), date badge. Riverside button + calendar links are hidden by default (`#thankyou-gated`), shown only when `sessionStorage('ugc-registered')` or `sessionStorage('ugc-registered-time')` (24h window) is present. `CompleteRegistration` Pixel fires only once (first visit), subsequent refreshes within 24h show gated content without re-firing. Direct access without registration shows fallback message (`#thankyou-noauth`) with link back to LP. 3 resource cards (YouTube, Podcast, Natima case study). `noindex, nofollow`.
- **Calendar integration:** Google Calendar via URL params, Apple/Outlook via static `webinar.ics` file. Vercel serves `.ics` with `Content-Type: text/calendar`.
- **Form flow:** Submit → timestamp anti-bot check (< 2s = silent reject) → honeypot check → Ecomail API (with UTM data, 1 retry on 5xx/network error) → Lead Pixel event → set `sessionStorage('ugc-registered')` → 300ms delay → redirect to `/dekujeme` → verify sessionStorage → show gated content + CompleteRegistration Pixel → set `ugc-registered-time` timestamp (24h persistence)
- **Favicon:** SVG (scalable, green dot on dark bg), ICO fallback (32×32), apple-touch-icon (180×180). Both HTML pages reference all three.
- **SEO basics:** `<link rel="canonical">` set to `https://ugc.socials.cz/`, `og:url` set, `og:image` set to `images/og-image.jpg` (1200×630), `twitter:card` summary_large_image. Event schema (JSON-LD) with webinar metadata (date, speakers, free offer). `robots.txt` allows `/`, disallows `/api/`.
- **Fonts:** Self-hosted Work Sans (variable font, wght 400–800) in `fonts/` directory. Two woff2 files: latin + latin-ext (for Czech characters). Preloaded in both HTML pages. No external Google Fonts requests.
- **Images:** Hero + speaker images use `<picture>` elements with WebP sources and original PNG/JPG fallback. Responsive `srcset` with mobile-optimized sizes (560w hero, 720w speakers). Original full-size images kept as fallback.
- **Accessibility:** `:focus-visible` styles on all interactive elements (buttons, inputs, tabs, FAQ, links) — green outline (`var(--c-primary)`) with `outline-offset: 2px` (inputs use `-2px` inset). Playbook TOC text contrast fixed to WCAG AA (4.7:1). Skip-to-content link on both pages. All 18 `<video>` elements have `aria-label` attributes. Print stylesheet hides videos, CTAs, sticky elements.
- **Performance target:** LCP < 2.5s, total page < 300KB (excl. lazy-loaded videos)

## Security

- **Rate limiting:** In-memory per-IP tracking in `api/subscribe.js`. Max 5 requests per 10 minutes per IP. Returns `429`. Per-request cleanup of stale entries (`cleanupStaleEntries()`). Note: resets on cold start (serverless limitation).
- **CORS:** `Access-Control-Allow-Origin` restricted to `https://ugc.socials.cz`, `https://ugc-veru.vercel.app`, and `http://localhost:3000`. No wildcard.
- **OPTIONS handling:** CORS headers set and preflight handled before POST method check in `api/subscribe.js`.
- **Input validation:** Backend rejects name > 200 chars, email > 254 chars, UTM fields > 500 chars each (400). HTML inputs have `maxlength="100"` (name) and `maxlength="254"` (email).
- **Anti-bot (4 layers):** (1) Honeypot field `website` — hidden, bots fill it → silent reject (client-side). (2) Timestamp field `_ts` — set to `Date.now()` on page load, submissions under 2 seconds are silently rejected (client-side). (3) Server-side `_ts` validation — `_ts` is sent in POST body, backend rejects if missing or < 2s with fake 200 success (silent reject). (4) Rate limiting on backend.
- **IP detection:** `x-forwarded-for` → `x-real-ip` → `socket.remoteAddress` fallback chain.
- **Thank-you page gate:** Riverside link + calendar links hidden by default on `/dekujeme`. Shown only when `sessionStorage('ugc-registered')` or `sessionStorage('ugc-registered-time')` within 24h is present. Prevents casual/direct URL access and bot pixel inflation.
- **Ecomail retry:** Single retry with 1s delay on 5xx/network errors. No retry on 4xx client errors.
- **Security headers (vercel.json):** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `Strict-Transport-Security: max-age=63072000; includeSubDomains`, `Content-Security-Policy` (script/style/font-src `'self'` only + Cookiebot domains `consent.cookiebot.com`, `consentcdn.cookiebot.com`; `style-src` also allows `https://fonts.googleapis.com`; `font-src` also allows `https://fonts.gstatic.com` (for playbook page Google Fonts); `frame-src` allows `consentcdn.cookiebot.com` for consent iframe; `img-src` allows `imgsct.cookiebot.com`; `unsafe-inline` for Meta Pixel + sessionStorage check) — applied globally via `/(.*) ` rule.

## Completed Setup

- **Ecomail autoresponder:** Configured in Ecomail dashboard (Automatizace → trigger: Přidání do seznamu → akce: Odeslat email). Greeting by name, date/time, Riverside link button, calendar links. Condition: tag `ugc-webinar-2026`. Tested and working.
- **Ecomail segment:** "UGC webinář 2026" — filter by tag `ugc-webinar-2026` in Hlavní seznam. Used for all 5 email campaigns.
- **White logo for emails:** `images/socials-logo-white.png` — converted from `socials loga/Socials-full-white.svg` (400px wide PNG, white text on transparent bg). SVG source files in `socials loga/` directory (not tracked in git).

## Email Sequence (Ecomail)

5 HTML email templates in `emails/` directory — warm-up sequence to increase show-up rate.

```
emails/
  01-speakers.html      — T-14 (25.3.) Představení speakerů
  02-teaser.html        — T-7  (1.4.)  Content teaser — 3 body
  03-reminder.html      — T-2  (6.4.)  Playbook intro + kalendář + podcast CTA
  04-den-d.html         — T-1h (8.4. 9:00) Den D — Riverside link
  05-followup.html      — T+1  (9.4.)  Follow-up — Playbook + Typeform feedback + resources
```

- **Format:** Table-based HTML email, inline CSS, mobile responsive (`@media max-width: 620px`)
- **Design:** Dark theme (`#040404` bg, `#111111` content), green CTA (`#94e700`), `border-radius: 16px`
- **Font:** Google Fonts `Work Sans` import + fallback `Arial, Helvetica, sans-serif`
- **Personalization:** `*|VOKATIV|*` (Ecomail merge tag — jméno v 5. pádu)
- **Unsubscribe:** `*|UNSUB|*` in footer (Ecomail format)
- **Logo:** `socials-logo-white.png` (PNG, white on transparent, converted from `Socials-full-white.svg`)
- **UTM:** `utm_source=ecomail&utm_medium=email&utm_campaign=ugc-webinar-seq-{1-5}`
- **Tone:** **Vykání** (formal Czech "you") in all emails
- **Delivery:** All 5 emails as **scheduled campaigns** (not workflow) — segment `ugc-webinar-2026` in Hlavní seznam
- **Placeholders:** `{{TYPEFORM_URL}}` — to be filled after webinar (Typeform feedback survey)
- **Speaker photos:** Email 01 includes `veronika.png` + `jarda.jpg` (absolute URLs from `ugc.socials.cz`)
- **Scheduled:** 01→25.3. 8:00, 02→1.4. 8:00, 03→6.4. 8:00, 04→8.4. 9:00, 05→TBD (9.4.)
- **Email 01 specifics:** CTA → EcoBamboo case study (`socials.cz/pripadove-studie/ecobamboo`). Teaser text: 22 dní, 3. nejprodávanější produkt, spolupráce s agenturou DudeUp na UGC videích.
- **Email 02 specifics:** CTA → Natima case study (`socials.cz/pripadove-studie/natima`). Teaser: 6 přístupů ke kreativám, #2 = UGC jako stěžejní varianta reklamy.
- **Email 03 specifics:** Intro leads with 30 stránkový UGC Playbook (strategický + exekuční dokument, checklist, briefy, ceník, insighty). Mentions AI format (ChatGPT/Claude/Gemini) + audio verze. Bonus section removed (duplicated intro). CTA → 100. díl Socials podcastu „Co funguje v Meta Ads v roce 2026?" (Radka Hrejsková + Jarda Bobák), link na Spotify Podcasters.
- **Email 05 specifics:** One email for entire segment (no attendee/non-attendee split). No recording. Primary CTA = Playbook page (`/playbook` — read online, Markdown export, audio version). Secondary CTA = Typeform feedback (outlined button in card, progress bar, "max. 2 minuty"). Resources section (YouTube, Podcast, Case study).
- **Calendar links:** Emails 01–03 include calendar buttons (Google Calendar + Apple/Outlook .ics) at bottom of content area. Email 01 centered, emails 02–03 left-aligned. Mobile: stacked full-width (`.calendar-btn`).

## Broadcast Emails (Ecomail)

2 broadcast emails in `emails/` directory — invitation for main list subscribers who haven't registered for the webinar.

```
emails/
  broadcast-invite.html   — 4 UGC tipy + bonus mention + CTA registrace
  broadcast-playbook.html — Playbook jako hlavní lákadlo (3 formáty: PDF, MD, podcast)
```

- **Target:** Hlavní seznam, EXCLUDING segment "UGC webinář 2026" (already registered)
- **Broadcast 1 (`broadcast-invite`):** Value-first — 4 data-driven UGC tips (retention benchmarks, variant testing, briefs, UGC as system), 30stránkový Playbook bonus mention (AI formát + audio), CTA to ugc.socials.cz. UTM: `ugc-webinar-broadcast`. Scheduled: 24.3. via Ecomail segment "Bez webinářového tagu" (tag `ugc-webinar-2026` neobsahuje).
- **Broadcast 2 (`broadcast-playbook`):** Playbook-focused — same segment as broadcast 1 (celý hlavní seznam bez tagu). Playbook contents checklist, 3 format box (PDF, Markdown for AI tools, podcast audio), CTA to register. UTM: `ugc-webinar-broadcast-2`. Scheduled: 26.–27.3. via Ecomail segment "Bez webinářového tagu".
- **Same design system** as sequence emails (dark theme, green CTA, `*|VOKATIV|*`, vykání, table-based)

## Remaining TODO

- **Persistent rate limiting (Vercel KV):** In-memory map resets on cold start. Consider Vercel KV for production-grade persistence.

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
