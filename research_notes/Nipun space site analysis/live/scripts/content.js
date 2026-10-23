async page => {
  const S = 'https://www.nipun.space';
  const ctx = await page.context().browser().newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('nipun.booted', '1'); localStorage.setItem('nipun.tour.v2', '1'); } catch {} });
  const p = await ctx.newPage();
  const out = { scrapedAt: new Date().toISOString(), cards: [], projects: {}, posts: {}, pages: {}, errors: [] };
  const clean = s => s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  // project cards (strip is tripled -> dedupe by title)
  await p.goto(S + '/work'); await p.waitForTimeout(1500);
  out.cards = await p.evaluate(() => {
    const seen = new Set(); const cards = [];
    for (const h of document.querySelectorAll('h3')) {
      const t = h.innerText.trim(); if (seen.has(t)) continue; seen.add(t);
      let c = h; for (let i = 0; i < 6 && c && !/border/.test(c.className); i++) c = c.parentElement;
      const lines = (c || h.parentElement).innerText.split('\n').map(s => s.trim()).filter(Boolean);
      const img = (c || h.parentElement).querySelector('img');
      cards.push({ title: t, lines, img: img ? img.getAttribute('src') : null, border: c ? getComputedStyle(c).borderStyle + ' ' + getComputedStyle(c).borderColor : null });
    }
    return cards;
  });
  const slugs = ['serenity', 'pragati', 'guardia', 'samarth', 'godprofile', 'smart-notes', 'studypath', 'task-manager-pro', 'xlnet-emotion', 'fake-news-classifier', 'uni-verse'];
  // also probe experiment slugs
  const extra = out.cards.map(c => c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')).filter(s => !slugs.includes(s));
  for (const slug of [...slugs, ...extra]) {
    try {
      await p.goto(`${S}/work/${slug}`); await p.waitForTimeout(1200);
      const head = await p.evaluate(() => ({ title: document.title, links: [...document.querySelectorAll('a')].filter(a => /live|source|demo|github/i.test(a.innerText)).map(a => ({ text: a.innerText.trim(), href: a.href })).slice(0, 8) }));
      const files = await p.evaluate(() => { const bs = [...document.querySelectorAll('button')]; return bs.map((b, i) => ({ i, t: b.innerText.replace(/[\s›]+/g, '') })).filter(x => /^[\w-]+\.md$/.test(x.t) && !document.querySelector('button') .isSameNode(null)).filter((x, k, a) => a.findIndex(y => y.t === x.t) === k); });
      const sections = [];
      if (!files.length) { sections.push({ file: null, text: clean(await p.evaluate(() => document.querySelector('.overflow-y-auto, main, body').innerText)) }); }
      for (const fo of files) {
        const f = fo.t;
        await p.locator('button').nth(fo.i).click().catch(() => {});
        await p.waitForTimeout(450);
        const s = await p.evaluate(() => {
          const panes = [...document.querySelectorAll('div.overflow-y-auto')].filter(d => d.clientWidth > 400);
          const r = panes.sort((a, b) => b.scrollHeight - a.scrollHeight)[0];
          if (!r) return { text: '', imgs: [], blocks: {} };
          const blocks = {}; for (const e of r.querySelectorAll('h1,h2,h3,blockquote,pre,table,ul,ol,svg,img')) blocks[e.tagName] = (blocks[e.tagName] || 0) + 1;
          return { text: r.innerText, imgs: [...r.querySelectorAll('img')].map(i => i.getAttribute('src')), blocks };
        });
        sections.push({ file: f, ...s, text: clean(s.text) });
      }
      out.projects[slug] = { ...head, files: files.map(f => f.t), sections };
    } catch (e) { out.errors.push(`${slug}: ${String(e).slice(0, 150)}`); }
  }
  for (const slug of ['four-tier-memory', 'why-uni-verse', 'agents-that-build-their-own-tools', 'rag-with-a-job', 'mcp-became-the-plug']) {
    try {
      await p.goto(`${S}/writing/${slug}`); await p.waitForTimeout(1200);
      out.posts[slug] = await p.evaluate(() => { const r = document.querySelector('div.overflow-y-auto'); return { title: document.title, text: r ? r.innerText : document.body.innerText }; });
      out.posts[slug].text = clean(out.posts[slug].text);
    } catch (e) { out.errors.push(`post ${slug}: ${String(e).slice(0, 150)}`); }
  }
  for (const r of ['/', '/work', '/writing', '/about', '/skills', '/services', '/achievements', '/opensource', '/contact', '/map']) {
    try {
      await p.goto(S + r); await p.waitForTimeout(3500);  // let typewriters finish
      out.pages[r] = await p.evaluate(() => ({
        title: document.title,
        description: document.querySelector('meta[name=description]')?.content,
        canonical: document.querySelector('link[rel=canonical]')?.href,
        text: (document.querySelector('div.h-full.overflow-y-auto') || document.body).innerText,
        links: [...document.querySelectorAll('a[href]')].map(a => `${a.innerText.trim().slice(0, 40)} -> ${a.getAttribute('href')}`).filter((v, i, a) => a.indexOf(v) === i),
        images: [...document.querySelectorAll('img')].map(i => `${i.getAttribute('src')} (${i.naturalWidth}x${i.naturalHeight}, alt="${i.alt}")`).filter((v, i, a) => a.indexOf(v) === i),
      }));
      out.pages[r].text = clean(out.pages[r].text);
    } catch (e) { out.errors.push(`page ${r}: ${String(e).slice(0, 150)}`); }
  }
  // expanded accordions / skills sectors
  try {
    await p.goto(S + '/achievements'); await p.waitForTimeout(1200);
    for (const b of await p.locator('button').filter({ hasText: /courses|view/ }).all()) { await b.click().catch(() => {}); await p.waitForTimeout(150); }
    out.pages['/achievements'].expanded = clean(await p.evaluate(() => document.querySelector('div.h-full.overflow-y-auto').innerText));
    await p.goto(S + '/skills'); await p.waitForTimeout(1200);
    out.pages['/skills'].sectors = {};
    for (const s of ['AI / ML', 'LANGUAGES', 'BACKEND', 'FRONTEND', 'DATA', 'CLOUD / DEVOPS']) {
      await p.getByRole('button', { name: s, exact: true }).first().click(); await p.waitForTimeout(900);
      out.pages['/skills'].sectors[s] = clean(await p.evaluate(() => { const h = [...document.querySelectorAll('*')].find(e => /\/\/ breakdown/.test(e.innerText || '') && e.innerText.length < 3000 && e.children.length > 1); return h ? h.innerText : ''; }));
    }
  } catch (e) { out.errors.push('expand: ' + String(e).slice(0, 150)); }
  await ctx.close();
  return JSON.stringify(out);
}
