const crypto = require('crypto');

const cookieName = 'she_client_access';
const allowedPaths = ['/client-portal/', '/client-onboarding/', '/client-documents/'];

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function safeNext(value) {
  const candidate = String(value || '');
  return allowedPaths.some((prefix) => candidate.startsWith(prefix)) ? candidate : '/client-portal/';
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  const configuredCode = process.env.CLIENT_PORTAL_CODE;
  if (!configuredCode) return { statusCode: 503, body: 'Client access has not been configured.' };

  const form = new URLSearchParams(event.body || '');
  const next = safeNext(form.get('next'));
  if (!safeEqual(form.get('code') || '', configuredCode)) {
    return { statusCode: 303, headers: { Location: `/client-access/?error=1&next=${encodeURIComponent(next)}` }, body: '' };
  }

  const expires = Math.floor(Date.now() / 1000) + (8 * 60 * 60);
  const payload = String(expires);
  const signature = crypto.createHmac('sha256', configuredCode).update(payload).digest('base64url');
  return {
    statusCode: 303,
    headers: {
      Location: next,
      'Set-Cookie': `${cookieName}=${payload}.${signature}; Path=/; Max-Age=28800; HttpOnly; Secure; SameSite=Lax`
    },
    body: ''
  };
};
