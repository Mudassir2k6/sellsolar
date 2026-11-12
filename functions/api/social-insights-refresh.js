/**
 * Cloudflare Pages Function: POST /api/social-insights-refresh
 *
 * Powers the "Run cron now" button in Admin -> Social Insights.
 * It starts the same GitHub Actions workflow that runs every night at 1:00 AM PKT
 * (.github/workflows/daily-social-insights-update.yml) so the hashtag files get rebuilt and deployed.
 *
 * Security:
 *  - The caller must send a valid Supabase access token (Authorization: Bearer <token>).
 *  - The token's e-mail must be in the admin allow-list (defaults below + optional env
 *    SOCIAL_INSIGHTS_ADMIN_EMAILS="a@x.com,b@y.com").
 *  - The GitHub token never reaches the browser. Set it as a Cloudflare Pages secret:
 *      GITHUB_DISPATCH_TOKEN  (fine-grained PAT, repo access: Mudassir2k6/sellsolar,
 *                              permission "Actions: Read and write")
 */

const SUPABASE_URL = 'https://zgfycrnmivfybbclflwf.supabase.co';
// Public anon key (already shipped in the client bundle).
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZnljcm5taXZmeWJiY2xmbHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNjMzNDQsImV4cCI6MjEwMzczOTM0NH0.30oiwuVIdIjaMMZGyobVqZk8HA18vVIhq2jN6jFgyao';

const REPO = 'Mudassir2k6/sellsolar';
const WORKFLOW_FILE = 'daily-social-insights-update.yml';
const DEFAULT_ADMIN_EMAILS = ['mudassir2k6@gmail.com', 'admin@sellsolar.pk'];
const COUNTRY_RE = /^(ALL|[A-Z]{2})$/;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

async function getVerifiedEmail(token) {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const user = await res.json();
    return String(user?.email || '').toLowerCase() || null;
  } catch {
    return null;
  }
}

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token) return json({ error: 'unauthorized', message: 'Please sign in as admin first.' }, 401);

  const email = await getVerifiedEmail(token);
  if (!email) return json({ error: 'unauthorized', message: 'Session expired. Sign in again.' }, 401);

  const admins = [
    ...DEFAULT_ADMIN_EMAILS,
    ...String(env.SOCIAL_INSIGHTS_ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  ];
  if (!admins.includes(email)) return json({ error: 'forbidden', message: 'Admin access required.' }, 403);

  const ghToken = env.GITHUB_DISPATCH_TOKEN;
  if (!ghToken) {
    return json(
      {
        error: 'not_configured',
        message: 'GITHUB_DISPATCH_TOKEN is not set in Cloudflare Pages. Use the GitHub Actions link instead.',
      },
      501
    );
  }

  let country = 'ALL';
  try {
    const body = await request.json();
    country = String(body?.country || 'ALL').toUpperCase();
  } catch {
    // default ALL
  }
  if (!COUNTRY_RE.test(country)) return json({ error: 'bad_request', message: 'Invalid country code.' }, 400);

  const ghRes = await fetch(`https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ghToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'sellsolar-admin-social-insights',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ref: 'main', inputs: { country } }),
    signal: AbortSignal.timeout(10000),
  });

  if (ghRes.status !== 204) {
    const detail = await ghRes.text().catch(() => '');
    return json(
      {
        error: 'github_error',
        status: ghRes.status,
        message:
          ghRes.status === 401 || ghRes.status === 403 || ghRes.status === 404
            ? 'GitHub rejected the token. It needs "Actions: Read and write" on the sellsolar repo.'
            : 'GitHub could not start the workflow.',
        detail: detail.slice(0, 300),
      },
      502
    );
  }

  return json({
    ok: true,
    country,
    message: 'Cron job started. Files update in ~1–2 min, live on the site ~3–6 min after.',
    actionsUrl: `https://github.com/${REPO}/actions/workflows/${WORKFLOW_FILE}`,
  });
}
