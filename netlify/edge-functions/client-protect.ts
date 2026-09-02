const cookieName = 'she_client_access';

function readCookie(header: string, name: string): string {
  const item = header.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return item ? item.slice(name.length + 1) : '';
}

function base64url(bytes: ArrayBuffer): string {
  const data = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
}

async function isAuthorized(request: Request, code: string): Promise<boolean> {
  const token = readCookie(request.headers.get('cookie') || '', cookieName);
  const [expiresText, signature] = token.split('.');
  const expires = Number(expiresText);
  if (!expiresText || !signature || !Number.isFinite(expires) || expires <= Math.floor(Date.now() / 1000)) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(code), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expected = base64url(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(expiresText)));
  return timingSafeEqual(signature, expected);
}

export default async (request: Request, context: { next: () => Promise<Response> }) => {
  const code = Deno.env.get('CLIENT_PORTAL_CODE') || '';
  if (code && await isAuthorized(request, code)) return context.next();
  const url = new URL(request.url);
  const login = new URL('/client-access/', url.origin);
  login.searchParams.set('next', `${url.pathname}${url.search}`);
  return Response.redirect(login, 302);
};
