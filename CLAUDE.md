# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Landing page for a UGC webinar by Socials agency. Standalone HTML/CSS/JS, deployed on Vercel.

## Repository Structure

```
index.html              — Landing page (13 sections incl. video teaser + tabbed showcase)
css/styles.css          — Mobile-first styles, custom properties, components
js/main.js              — Countdown, sticky header, accordion, form AJAX, lazy video, tab switching
api/subscribe.js        — Vercel serverless function (Ecomail API proxy, skeleton)
vercel.json             — Vercel config (rewrites, cache headers for css/js/images/videos)
images/                 — veronika.png, otakar.jpg, socials-logo.svg
videos/                 — 12 compressed videos + 12 poster JPGs (see Video Structure below)
kontext.md              — Webinar brief (Czech, not tracked in git)
playbook.md             — UGC playbook (Slovak, not tracked in git)
```

### Video Structure (12 videos, 3 brands)

| Brand | Files | Count |
|-------|-------|-------|
| **Natios** (magnézium) | `natios-hook1/2/3.mp4`, `natios-ai1.mp4` | 3 human + 1 AI |
| **Nutworld** (ořechy) | `nutworld-hook1/2/3.mp4`, `nutworld-ai1.mp4`, `nutworld-ai2.mp4` | 3 human + 2 AI |
| **Virexa** (doplňky) | `virexa-hook1/2/3.mp4` | 3 human |

Posters follow naming: `{brand}-poster-{hook1|hook2|hook3|ai1|ai2}.jpg`
All compressed: 720×1280, H.264, CRF 28, no audio, `faststart`. Source originals in `.gitignore`.

## Key Context

- **Agency:** Socials — performance marketing boutique
- **Webinar:** "UGC videa: Kdy UGC reálně vydělává peníze a kdy je to jen drahý obsah"
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

## Technical Notes

- **No framework** — standalone HTML + CSS + vanilla JS
- **Mobile-first** — most traffic from Meta Ads is mobile
- **Hero layout:** On mobile: badge → headline (short, no prefix) → Veronika photo → form. On desktop: 2-column grid with headline+subtitle+form left, photo right.
- **3 registration forms:** hero, mid-page, final CTA — all submit to `/api/subscribe`
- **Ecomail integration:** Skeleton ready, needs `ECOMAIL_API_KEY` + `ECOMAIL_LIST_ID` env vars on Vercel
- **Meta Pixel:** Placeholder in `<head>`, needs real PIXEL_ID
- **Videos:** 12 compressed videos (1.5–6.3 MB each), `preload="none"`, lazy autoplay via IntersectionObserver
- **Video Teaser section:** 6 videos (mix of human + AI) right after hero, horizontal scroll on mobile, 6-col grid on desktop
- **Tabbed Video Showcase:** 3 tabs (Natios/Nutworld/Virexa), tab switch pauses hidden videos and re-observes visible ones
- **AI Avatar badges:** Green outline variant (`.video-card__badge--ai`) to distinguish AI-generated creatives
- **Section backgrounds:** Strict dark/elevated alternation across all 13 sections
- **Performance target:** LCP < 2.5s, total page < 300KB (excl. lazy-loaded videos)

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
