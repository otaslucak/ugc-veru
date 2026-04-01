/**
 * Vercel Serverless Function — /api/subscribe
 * Proxy for Ecomail API subscriber registration + CRM webhook.
 *
 * Env variables required on Vercel:
 *   ECOMAIL_API_KEY    — API key from Ecomail account
 *   ECOMAIL_LIST_ID    — Target list ID in Ecomail
 *   CRM_WEBHOOK_URL    — Supabase Edge Function URL for prospect webhook (optional)
 *   CRM_WEBHOOK_TOKEN  — Bearer token for CRM webhook (optional)
 */

/* ------------------------------------------------------------------
   Rate limiting — in-memory, per warm serverless instance
   Max 5 requests per IP per 10 minutes
   ------------------------------------------------------------------ */
var rateLimitMap = new Map();
var RATE_LIMIT_MAX = 5;
var RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function isRateLimited(ip) {
  var now = Date.now();
  var entry = rateLimitMap.get(ip);

  if (!entry) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return false;
  }

  // Window expired — reset
  if (now - entry.start > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

function cleanupStaleEntries() {
  var now = Date.now();
  rateLimitMap.forEach(function (entry, ip) {
    if (now - entry.start > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(ip);
    }
  });
}

/* ------------------------------------------------------------------
   Allowed origins for CORS
   ------------------------------------------------------------------ */
var ALLOWED_ORIGINS = [
  'https://ugc.socials.cz',
  'https://ugc-veru.vercel.app'
];

// Allow localhost only in development
if (process.env.NODE_ENV !== 'production') {
  ALLOWED_ORIGINS.push('http://localhost:3000');
}

/* ------------------------------------------------------------------
   CRM webhook — fire-and-forget, never blocks the response
   ------------------------------------------------------------------ */
async function sendToCrm(fullName, email, utmSource, utmMedium, utmCampaign, source) {
  var url = process.env.CRM_WEBHOOK_URL;
  var token = process.env.CRM_WEBHOOK_TOKEN;

  if (!url || !token) {
    console.log('CRM webhook skipped: missing env vars');
    return;
  }

  var isPlaybookGate = source === 'playbook-gate';

  var payload = JSON.stringify({
    name: fullName,
    email: email,
    phone: '',
    company: '',
    interaction_type: isPlaybookGate ? 'playbook_download' : 'webinar_registration',
    interaction_title: 'UGC',
    metadata: {
      source: isPlaybookGate ? 'playbook-gate' : 'landing-page',
      utm_source: utmSource || undefined,
      utm_medium: utmMedium || undefined,
      utm_campaign: utmCampaign || undefined
    }
  });

  try {
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 5000);

    var r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: payload,
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!r.ok) {
      var t = await r.text();
      console.error('CRM webhook error:', r.status, t);
    } else {
      console.log('CRM webhook sent:', email);
    }
  } catch (err) {
    console.error('CRM webhook failed:', err.name === 'AbortError' ? 'timeout (5s)' : err);
  }
}

module.exports = async function handler(req, res) {
  // --- CORS headers (before anything else) ---
  var origin = req.headers.origin || '';
  var isAllowed = ALLOWED_ORIGINS.indexOf(origin) !== -1;

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  // --- Handle preflight ---
  if (req.method === 'OPTIONS') {
    return res.status(isAllowed ? 200 : 403).end();
  }

  // --- Only allow POST ---
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // --- Rate limiting ---
  // Cleanup stale rate-limit entries per request
  cleanupStaleEntries();

  var ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
           req.headers['x-real-ip'] ||
           req.socket.remoteAddress || 'unknown';

  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  var body = req.body;

  // Validate required fields
  if (!body || !body.email || !body.name) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  var email = body.email.trim();
  var name = body.name.trim();

  // --- Input length validation ---
  if (name.length > 200) {
    return res.status(400).json({ error: 'Name is too long (max 200 characters).' });
  }
  if (email.length > 254) {
    return res.status(400).json({ error: 'Email is too long (max 254 characters).' });
  }

  var utmSource = (body.utm_source || '').trim();
  var utmMedium = (body.utm_medium || '').trim();
  var utmCampaign = (body.utm_campaign || '').trim();

  if (utmSource.length > 500 || utmMedium.length > 500 || utmCampaign.length > 500) {
    return res.status(400).json({ error: 'UTM parameter too long (max 500 characters).' });
  }

  // Source field — distinguishes playbook gate from webinar registration
  var source = (body.source || '').trim();

  // Anti-bot: reject submissions faster than 2 seconds (silent reject)
  var ts = parseInt(body._ts, 10);
  if (!ts || (Date.now() - ts) < 2000) {
    return res.status(200).json({ ok: true, message: 'Successfully registered.' });
  }

  var nameParts = name.split(/\s+/);
  var firstName = nameParts[0] || '';
  var surname = nameParts.slice(1).join(' ') || '';

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  var apiKey = process.env.ECOMAIL_API_KEY;
  var listId = process.env.ECOMAIL_LIST_ID;

  // Check env configuration
  if (!apiKey || !listId) {
    console.error('Missing ECOMAIL_API_KEY or ECOMAIL_LIST_ID env variables');
    // In development/skeleton mode, return success so the form works
    return res.status(200).json({
      ok: true,
      message: 'Registration received (Ecomail not configured yet).'
    });
  }

  // Playbook gate uses different tag and disables autoresponders
  var isPlaybookGate = source === 'playbook-gate';

  // Call Ecomail API (with 1 retry on transient failure)
  var ecomailUrl = 'https://api2.ecomailapp.cz/lists/' + listId + '/subscribe';
  var ecomailBody = JSON.stringify({
    subscriber_data: {
      email: email,
      name: firstName,
      surname: surname,
      source: isPlaybookGate ? 'ugc-playbook-gate' : 'ugc-webinar-lp',
      tags: [isPlaybookGate ? 'ugc-playbook-organic' : 'ugc-webinar-2026'],
      custom_fields: {
        UTM_SOURCE: utmSource,
        UTM_MEDIUM: utmMedium,
        UTM_CAMPAIGN: utmCampaign
      }
    },
    trigger_autoresponders: !isPlaybookGate,
    update_existing: true,
    skip_confirmation: true
  });

  var maxAttempts = 2;

  for (var attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      var response = await fetch(ecomailUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'key': apiKey
        },
        body: ecomailBody
      });

      if (response.ok) {
        // Send to CRM webhook (awaited with 5s timeout, failure won't affect response)
        await sendToCrm(name, email, utmSource, utmMedium, utmCampaign, source);

        return res.status(200).json({
          ok: true,
          message: 'Successfully registered.'
        });
      }

      var errorText = await response.text();
      console.error('Ecomail API error (attempt ' + attempt + '):', response.status, errorText);

      // Don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        return res.status(502).json({ error: 'Registration service error.' });
      }
    } catch (err) {
      console.error('Ecomail API request failed (attempt ' + attempt + '):', err);
    }

    // Wait 1s before retry (only if not last attempt)
    if (attempt < maxAttempts) {
      await new Promise(function (resolve) { setTimeout(resolve, 1000); });
    }
  }

  return res.status(502).json({ error: 'Registration service temporarily unavailable.' });
};
