// Google PageSpeed Insights (Lighthouse, mobile) for a list of URLs, plus the
// real-visitor Chrome UX Report data PSI returns when a URL/origin has enough.
const urls = process.argv.slice(2);
const fmt = (ms) => (ms == null ? '—' : (ms / 1000).toFixed(1) + ' s');
for (const url of urls) {
  const api = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?strategy=mobile&category=performance&url=' + encodeURIComponent(url);
  let j;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const r = await fetch(api); j = await r.json();
    if (!j.error) break;
    await new Promise((res) => setTimeout(res, 4000 * attempt));
  }
  if (j.error) { console.log(url, 'ERROR', j.error.message.slice(0, 160)); continue; }
  const a = j.lighthouseResult.audits;
  const n = (id) => a[id]?.numericValue;
  const score = Math.round((j.lighthouseResult.categories.performance.score || 0) * 100);
  const field = j.loadingExperience?.metrics, origin = j.originLoadingExperience?.metrics;
  const p75 = (m, k) => m?.[k]?.percentile;
  console.log(JSON.stringify({
    url: url.length > 90 ? url.slice(0, 90) + '…' : url, finalUrl: j.lighthouseResult.finalDisplayedUrl?.slice(0, 80),
    score, FCP: fmt(n('first-contentful-paint')), LCP: fmt(n('largest-contentful-paint')), TBT: Math.round(n('total-blocking-time') || 0) + ' ms',
    SpeedIndex: fmt(n('speed-index')), TTI: fmt(n('interactive')), CLS: (n('cumulative-layout-shift') ?? 0).toFixed(3),
    redirects: a['redirects']?.details?.items?.length ? a['redirects'].details.items.map((i) => (i.wastedMs|0) + 'ms').join('+') : 'none',
    serverResponse: Math.round(n('server-response-time') || 0) + ' ms', totalKB: Math.round((n('total-byte-weight') || 0) / 1024),
    lcpElement: (a['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.snippet || '').slice(0, 90),
    fieldURL_p75: field ? { LCP: fmt(p75(field, 'LARGEST_CONTENTFUL_PAINT_MS')), FCP: fmt(p75(field, 'FIRST_CONTENTFUL_PAINT_MS')), INP: p75(field, 'INTERACTION_TO_NEXT_PAINT') + ' ms', TTFB: fmt(p75(field, 'EXPERIMENTAL_TIME_TO_FIRST_BYTE')) } : 'not enough traffic',
    fieldOrigin_p75: origin ? { LCP: fmt(p75(origin, 'LARGEST_CONTENTFUL_PAINT_MS')), FCP: fmt(p75(origin, 'FIRST_CONTENTFUL_PAINT_MS')), TTFB: fmt(p75(origin, 'EXPERIMENTAL_TIME_TO_FIRST_BYTE')) } : 'not enough traffic',
  }, null, 1));
}
