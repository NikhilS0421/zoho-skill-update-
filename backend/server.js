const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Resend } = require('resend');
const { randomInt, randomBytes, createHash, timingSafeEqual } = require('node:crypto');
require('dotenv').config();
const { getAccessToken } = require('./zohoService');
const { EDITABLE_FIELDS, validateUpdates } = require('./validation');

const OTP_TTL = 10 * 60 * 1000;
const SESSION_TTL = 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const digest = value => createHash('sha256').update(value).digest();
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalizeEmail = email => typeof email === 'string' ? email.trim().toLowerCase() : '';

function createApp({ http = axios, mailer, tokenProvider = getAccessToken, now = Date.now, env = process.env } = {}) {
  const app = express();
  mailer = mailer || new Resend(env.RESEND_API_KEY);
  const otps = new Map();
  const sessions = new Map();
  const limits = new Map();
  // Set only when deployed behind a known number of trusted reverse proxies.
  if (env.TRUST_PROXY_HOPS) app.set('trust proxy', Number(env.TRUST_PROXY_HOPS));
  const origins = (env.FRONTEND_ORIGINS || '').split(',').map(v => v.trim()).filter(Boolean);
  app.use(cors({ origin: origins.length ? origins : true }));
  app.use(express.json({ limit: '64kb' }));
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    const time = now();
    for (const store of [otps, sessions, limits]) {
      for (const [key, value] of store) if (value.expiresAt <= time) store.delete(key);
    }
    next();
  });
  function consumeLimit(key, max, window) {
    let entry = limits.get(key);
    if (!entry) {
      entry = { count: 0, expiresAt: now() + window };
      limits.set(key, entry);
    }
    if (entry.count >= max) return false;
    entry.count++;
    return true;
  }
  app.get('/', (req, res) => res.json({ message: 'Backend is running' }));

  app.post('/send-otp', async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Enter a valid email address.' });
    }
    if (!consumeLimit(`send-ip:${req.ip}`, 20, HOUR) ||
        !consumeLimit(`send-minute:${email}`, 1, 60000) ||
        !consumeLimit(`send-hour:${email}`, 5, HOUR)) {
      return res.status(429).json({ success: false, error: 'Too many requests. Please wait before requesting another code.' });
    }
    const otp = String(randomInt(100000, 1000000));
    const entry = { hash: digest(otp), expiresAt: now() + OTP_TTL, attempts: 0, verifying: false };
    otps.set(email, entry);
    try {
      const { error } = await mailer.emails.send({
        from: 'Skill Portal <otp@support.datacouch.io>', to: email,
        subject: 'Your OTP Verification Code',
        html: `<p>Your Instructor Skill Update verification code is:</p><h2>${otp}</h2><p>Expires in 10 minutes and can be used once.</p>`,
      });
      if (error) throw new Error('Email delivery failed');
      res.json({ success: true });
    } catch {
      if (otps.get(email) === entry) otps.delete(email);
      res.status(502).json({ success: false, error: 'Could not send the verification code. Please try again later.' });
    }
  });

  app.post('/contact', async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const otp = typeof req.body?.otp === 'string' ? req.body.otp : '';
    if (!consumeLimit(`verify-ip:${req.ip}`, 50, HOUR)) {
      return res.status(429).json({ success: false, error: 'Too many verification attempts. Try again later.' });
    }
    const entry = otps.get(email);
    if (!entry || entry.verifying || entry.attempts >= 5) {
      return res.status(401).json({ success: false, error: 'Invalid or expired code. Request a new code.' });
    }
    entry.attempts++;
    if (!/^\d{6}$/.test(otp) || !timingSafeEqual(entry.hash, digest(otp))) {
      if (entry.attempts >= 5) otps.delete(email);
      return res.status(401).json({ success: false, error: 'Invalid or expired code.' });
    }
    entry.verifying = true;
    try {
      const token = await tokenProvider();
      const response = await http.get('https://www.zohoapis.com/crm/v2/Contacts/search', {
        params: { email }, headers: { Authorization: `Zoho-oauthtoken ${token}` }, timeout: 15000,
      });
      const contact = response.data?.data?.find(c => normalizeEmail(c.Email) === email);
      if (!contact?.id) {
        if (otps.get(email) === entry) otps.delete(email);
        return res.status(404).json({ success: false, error: 'No contact found for this email.' });
      }
      if (otps.get(email) !== entry || entry.expiresAt <= now()) {
        return res.status(401).json({ success: false, error: 'Code expired or was replaced. Request a new code.' });
      }
      otps.delete(email);
      const sessionToken = randomBytes(32).toString('hex');
      sessions.set(digest(sessionToken).toString('hex'), { contactId: String(contact.id), email, expiresAt: now() + SESSION_TTL });
      const data = Object.fromEntries(['id', 'Email', ...EDITABLE_FIELDS].filter(key => Object.hasOwn(contact, key)).map(key => [key, contact[key]]));
      res.json({ success: true, data, sessionToken, expiresIn: SESSION_TTL / 1000 });
    } catch (err) {
      entry.verifying = false;
      console.error('Contact fetch failed:', err.response?.status || err.message);
      res.status(502).json({ success: false, error: 'Could not load your profile. Please retry the code.' });
    }
  });

  app.put('/contact', async (req, res) => {
    const bearer = /^Bearer ([a-f0-9]{64})$/.exec(req.get('Authorization') || '');
    const session = bearer && sessions.get(digest(bearer[1]).toString('hex'));
    if (!session || session.expiresAt <= now()) return res.status(401).json({ success: false, error: 'Session expired. Verify your email again.' });
    const { id, data } = req.body || {};
    if (typeof id !== 'string' || id !== session.contactId) return res.status(403).json({ success: false, error: 'You can only update your own profile.' });
    const error = validateUpdates(data);
    if (error) return res.status(400).json({ success: false, error });
    try {
      const token = await tokenProvider();
      const response = await http.put('https://www.zohoapis.com/crm/v2/Contacts',
        { data: [{ ...data, id: session.contactId }] },
        { headers: { Authorization: `Zoho-oauthtoken ${token}` }, timeout: 15000 });
      const result = response.data?.data?.[0];
      if (result?.status !== 'success') {
        return res.status(400).json({ success: false, error: result?.message || 'CRM did not confirm the update.' });
      }
      if (env.ADMIN_EMAIL) {
        // Notification identity comes from the verified session, never request metadata.
        mailer.emails.send({ from: 'Skill Portal <otp@support.datacouch.io>', to: env.ADMIN_EMAIL,
          subject: 'Instructor profile updated', html: `<p>${escapeHtml(session.email)} updated their instructor profile.</p>`,
        }).then(({ error }) => { if (error) console.error('Admin notification failed'); }).catch(() => console.error('Admin notification failed'));
      }
      res.json({ success: true });
    } catch (err) {
      console.error('Contact update failed:', err.response?.status || err.message);
      res.status(502).json({ success: false, error: 'Could not save your profile. Please try again.' });
    }
  });
  app.use((err, req, res, next) => {
    res.status(err.status === 413 ? 413 : 400).json({ success: false, error: 'Invalid request body.' });
  });
  return app;
}
if (require.main === module) {
  const port = process.env.PORT || 9000;
  createApp().listen(port, () => console.log(`Server is active on port ${port}`));
}
module.exports = { createApp };
