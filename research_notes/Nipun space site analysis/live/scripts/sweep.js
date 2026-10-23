async page => {
  const OUT = '/home/user/Portfolio/research_notes/Nipun space site analysis/live';
  const browser = page.context().browser();
  const sizes = { 375: { width: 375, height: 812, m: true }, 768: { width: 768, height: 1024, m: true }, 1024: { width: 1024, height: 768 }, 1440: { width: 1440, height: 900 } };
  const routes = ['/', '/work', '/work/serenity', '/writing', '/writing/four-tier-memory', '/about', '/skills', '/services', '/achievements', '/opensource', '/contact', '/map', '/does-not-exist'];
  const res = {};
  for (const [w, s] of Object.entries(sizes)) {
    const ctx = await browser.newContext({ viewport: { width: s.width, height: s.height }, isMobile: s.m, hasTouch: s.m, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => {
      try { sessionStorage.setItem('nipun.booted', '1'); localStorage.setItem('nipun.tour.v2', '1'); } catch {}
      window.__lcp = 0; window.__cls = 0;
      try {
        new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
      } catch {}
    });
    const p = await ctx.newPage();
    res[w] = {};
    for (const r of routes) {
      await p.goto('https://www.nipun.space' + r, { waitUntil: 'networkidle' }).catch(() => {});
      await p.waitForTimeout(1800);
      const name = `${w}-${r === '/' ? 'home' : r.slice(1).replace(/\//g, '_')}`;
      await p.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 70 });
      res[w][r] = await p.evaluate(() => {
        const vis = el => { const b = el.getBoundingClientRect(); const cs = getComputedStyle(el); return b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05; };
        const scrollers = [...document.querySelectorAll('*')].filter(e => { const cs = getComputedStyle(e); return /(auto|scroll)/.test(cs.overflowY + cs.overflowX) && (e.scrollHeight > e.clientHeight + 4 || e.scrollWidth > e.clientWidth + 4); })
          .map(e => `${e.tagName}.${(e.className + '').slice(0, 50)} ${e.clientWidth}x${e.clientHeight} scroll ${e.scrollWidth}x${e.scrollHeight}`);
        const nav = document.querySelector('nav[aria-label="Site navigation"]');
        const input = document.querySelector('[aria-label="terminal command input"]');
        const quick = [...document.querySelectorAll('button')].filter(b => /^(work|about|skills|services|writing|contact)\s*●?$/.test(b.innerText.trim()) && vis(b) && b.getBoundingClientRect().top > innerHeight - 200).map(b => b.innerText.trim());
        const heads = [...document.querySelectorAll('h1,h2,h3')].filter(vis).slice(0, 14).map(h => h.tagName + ':' + h.innerText.replace(/\s+/g, ' ').slice(0, 50));
        return {
          url: location.pathname, title: document.title,
          docScroll: `${document.scrollingElement.scrollWidth}x${document.scrollingElement.scrollHeight}`,
          scrollers: scrollers.slice(0, 5), wheelNav: nav ? vis(nav) : null,
          input: input ? { ph: input.placeholder, fs: getComputedStyle(input).fontSize, top: Math.round(input.getBoundingClientRect().top) } : null,
          quick, heads, lcp: Math.round(window.__lcp), cls: +window.__cls.toFixed(4),
          canvases: [...document.querySelectorAll('canvas')].filter(vis).length,
          text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 900),
        };
      });
    }
    await ctx.close();
  }
  return JSON.stringify(res, null, 1);
  return 'ok';
}
