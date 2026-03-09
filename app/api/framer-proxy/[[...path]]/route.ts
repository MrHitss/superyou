import { NextRequest, NextResponse } from 'next/server';

const FRAMER_ORIGIN = 'https://superyoubio.framer.website';

const BADGE_HIDE_CSS = `
.__framer-badge, a.__framer-badge { display: none !important; visibility: hidden !important; }
`;

const BADGE_REMOVAL_SCRIPT = `
(function() {
  function removeBadge() {
    var el = document.querySelector('.__framer-badge') || document.querySelector('a.__framer-badge');
    if (el) {
      var target = el.parentElement || el;
      target.remove();
      return true;
    }
    return false;
  }
  if (removeBadge()) return;
  var obs = new MutationObserver(function() {
    if (removeBadge()) obs.disconnect();
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(function() {
    removeBadge();
    obs.disconnect();
  }, 10000);
})();
`;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await context.params;
  const pathSegments = path && path.length > 0 ? path.join('/') : '';
  const search = request.nextUrl.search;
  const framerUrl = `${FRAMER_ORIGIN}/${pathSegments}${search}`;

  let res: Response;
  try {
    res = await fetch(framerUrl, {
      headers: {
        'User-Agent': request.headers.get('user-agent') ?? 'Mozilla/5.0 (compatible; SuperYou/1)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    });
  } catch (e) {
    return new NextResponse('Proxy error', { status: 502 });
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('text/html')) {
    return new NextResponse(res.body, {
      status: res.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': res.headers.get('cache-control') ?? 'public, max-age=60',
      },
    });
  }

  let html = await res.text();

  const baseTag = `<base href="${FRAMER_ORIGIN}/">`;
  const badgeStyle = `<style id="framer-badge-hide">${BADGE_HIDE_CSS}</style>`;
  if (!html.includes('<base ')) {
    if (html.includes('</head>')) {
      html = html.replace('</head>', `${baseTag}\n${badgeStyle}\n</head>`);
    } else if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>${baseTag}\n${badgeStyle}`);
    }
  } else if (html.includes('</head>') && !html.includes('framer-badge-hide')) {
    html = html.replace('</head>', `${badgeStyle}\n</head>`);
  }

  const scriptTag = `<script>${BADGE_REMOVAL_SCRIPT}</script>`;
  html = html.replace(/<\/body\s*>/i, `${scriptTag}\n</body>`);

  return new NextResponse(html, {
    status: res.status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60',
    },
  });
}
