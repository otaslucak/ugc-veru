/**
 * Vercel Serverless Function — /api/subscribe
 * Proxy for Ecomail API subscriber registration.
 *
 * Env variables required on Vercel:
 *   ECOMAIL_API_KEY  — API key from Ecomail account
 *   ECOMAIL_LIST_ID  — Target list ID in Ecomail
 */

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  var body = req.body;

  // Validate input
  if (!body || !body.email || !body.name) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  var email = body.email.trim();
  var name = body.name.trim();
  var utmSource = (body.utm_source || '').trim();
  var utmMedium = (body.utm_medium || '').trim();
  var utmCampaign = (body.utm_campaign || '').trim();

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

  // Call Ecomail API
  try {
    var ecomailUrl = 'https://api2.ecomailapp.cz/lists/' + listId + '/subscribe';

    var response = await fetch(ecomailUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'key': apiKey
      },
      body: JSON.stringify({
        subscriber_data: {
          email: email,
          name: name,
          source: 'ugc-webinar-lp',
          tags: ['ugc-webinar-2026'],
          custom_fields: {
            UTM_SOURCE: utmSource,
            UTM_MEDIUM: utmMedium,
            UTM_CAMPAIGN: utmCampaign
          }
        },
        trigger_autoresponders: true,
        update_existing: true,
        skip_confirmation: true
      })
    });

    if (!response.ok) {
      var errorText = await response.text();
      console.error('Ecomail API error:', response.status, errorText);
      return res.status(502).json({ error: 'Registration service error.' });
    }

    return res.status(200).json({
      ok: true,
      message: 'Successfully registered.'
    });
  } catch (err) {
    console.error('Ecomail API request failed:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
