export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Redirect www.sellsolar.pk -> sellsolar.pk
    if (url.hostname === 'www.sellsolar.pk') {
      const redirectUrl = new URL(request.url);
      redirectUrl.hostname = 'sellsolar.pk';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    // Proxy request to Cloudflare Pages deployment
    const targetUrl = new URL(url.pathname + url.search, 'https://sellsolar.pages.dev');

    const forwardHeaders = new Headers(request.headers);
    forwardHeaders.set('Host', 'sellsolar.pages.dev');
    forwardHeaders.set('X-Forwarded-Host', url.host);
    forwardHeaders.set('X-Forwarded-Proto', url.protocol.replace(':', ''));

    const proxyRequest = new Request(targetUrl.toString(), {
      method: request.method,
      headers: forwardHeaders,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual'
    });

    const response = await fetch(proxyRequest);

    // Return response with original content, bypassing edge HTML cache
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('X-Proxied-By', 'SellSolar-Edge-Router');
    
    // Ensure browsers and edge never cache stale HTML
    const contentType = responseHeaders.get('content-type') || '';
    if (contentType.includes('text/html')) {
      responseHeaders.set('Cache-Control', 'public, max-age=0, must-revalidate');
      responseHeaders.set('CDN-Cache-Control', 'no-store');
      responseHeaders.set('Cloudflare-CDN-Cache-Control', 'no-store');
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
  }
};
