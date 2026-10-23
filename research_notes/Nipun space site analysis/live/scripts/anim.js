async page => {
  const S = 'https://www.nipun.space';
  const OUT = '/home/user/Portfolio/research_notes/Nipun space site analysis/live';
  const o = { routes: {}, css: null, checks: [] };
  const T = async (name, fn) => { try { await fn(); } catch (e) { o.checks.push(`ERR ${name}: ` + String(e).slice(0, 200)); } };
  const ctx = await page.context().browser().newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => {
    try { sessionStorage.setItem('nipun.booted', '1'); localStorage.setItem('nipun.tour.v2', '1'); } catch {}
    window.__snd = [];
    const AC = window.AudioContext; if (AC) { const orig = AC.prototype.createOscillator; AC.prototype.createOscillator = function () { const osc = orig.call(this); const st = osc.start.bind(osc); osc.start = (...a) => { window.__snd.push(`${osc.type}@${Math.round(osc.frequency.value)}Hz`); return st(...a); }; return osc; }; }
    // record inline style tweens (framer motion rAF path)
    window.__tw = new Map(); window.__t0 = performance.now();
    window.__startTw = () => { window.__tw = new Map(); window.__t0 = performance.now(); };
    new MutationObserver(ms => { const now = performance.now() - window.__t0; for (const m of ms) { const e = m.target; const st = e.style; if (!st) continue; const v = `${st.opacity}|${st.transform}`; let r = window.__tw.get(e); if (!r) { r = { first: now, last: now, from: v, to: v, n: 0 }; window.__tw.set(e, r); } r.last = now; r.to = v; r.n++; } }).observe(document, { subtree: true, attributes: true, attributeFilter: ['style'] });
  });
  const p = await ctx.newPage();
  const desc = 'e => (e.tagName + "." + (e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className || "")).slice(0, 70) + " \\"" + (e.innerText || e.textContent || "").trim().slice(0, 30).replace(/\\s+/g, " ") + "\\""';
  // CSS keyframes inventory
  await p.goto(S + '/'); await p.waitForTimeout(1500);
  o.css = await p.evaluate(() => {
    const kf = [], uses = [];
    for (const sh of document.styleSheets) { let rules; try { rules = sh.cssRules; } catch { continue; }
      const walk = rs => { for (const r of rs) { if (r.type === 7) kf.push(r.name); else if (r.cssRules) walk(r.cssRules); else if (r.style && (r.style.animation || r.style.animationName)) uses.push(`${r.selectorText} { animation: ${r.style.animation || r.style.animationName} }`); } };
      walk(rules); }
    return { keyframes: [...new Set(kf)], animationRules: uses };
  });
  for (const route of ['/work', '/about', '/skills', '/services', '/achievements', '/writing', '/writing/rag-with-a-job', '/work/serenity', '/contact', '/map', '/opensource', '/']) {
    await T('anim ' + route, async () => {
      await p.goto(S + (route === '/' ? '/map' : '/')); await p.waitForTimeout(1200);
      await p.evaluate(() => window.__startTw());
      const cmd = { '/': '/home', '/work': '/projects', '/work/serenity': null, '/writing/rag-with-a-job': null }[route];
      const t0 = Date.now();
      if (cmd === null) await p.evaluate(r => { history.pushState({}, '', r); dispatchEvent(new PopStateEvent('popstate')); }, route);
      else { await p.keyboard.press('/'); await p.keyboard.type((cmd || route).slice(1)); await p.keyboard.press('Enter'); }
      const seen = new Map();
      for (let i = 0; i < 16; i++) {
        const snap = await p.evaluate(d => { const f = eval(d); return document.getAnimations().map(a => { const t = a.effect?.getTiming?.() || {}; const kf = a.effect?.getKeyframes?.() || []; return { kind: a.constructor.name, name: a.animationName || a.transitionProperty || a.id || '', dur: t.duration, delay: t.delay, easing: t.easing, iter: t.iterations, props: [...new Set(kf.flatMap(k => Object.keys(k).filter(x => !['offset', 'easing', 'composite', 'computedOffset'].includes(x))))].join(','), target: a.effect?.target ? f(a.effect.target) : '' }; }); }, desc);
        for (const a of snap) { const k = `${a.kind}|${a.name}|${a.dur}|${a.delay}|${a.easing}|${a.props}`; if (!seen.has(k)) seen.set(k, { ...a, count: 0, firstSeenMs: Date.now() - t0 }); seen.get(k).count++; }
        await p.waitForTimeout(100);
      }
      const tw = await p.evaluate(d => { const f = eval(d); return [...window.__tw.entries()].filter(([e, r]) => r.n > 2).map(([e, r]) => ({ el: f(e), startMs: Math.round(r.first), endMs: Math.round(r.last), frames: r.n, from: r.from, to: r.to })).sort((a, b) => a.startMs - b.startMs).slice(0, 25); }, desc);
      o.routes[route] = { url: p.url(), waapiAndCss: [...seen.values()].map(a => { const { count, ...rest } = a; return rest; }), inlineTweens: tw };
    });
  }
  // --- unverified items ---
  await T('wheel keys', async () => {
    await p.goto(S + '/'); await p.waitForTimeout(1500);
    const act = () => p.evaluate(() => [...document.querySelectorAll('nav[aria-label="Site navigation"] button')].find(b => getComputedStyle(b).fontSize === '21px')?.innerText.trim());
    await p.mouse.click(300, 650); await p.waitForTimeout(200);
    const a0 = await act(); await p.keyboard.press('ArrowDown'); await p.waitForTimeout(400); const a1 = await act();
    await p.mouse.move(720, 400); await p.waitForTimeout(100); await p.keyboard.press('ArrowDown'); await p.waitForTimeout(400); const a2 = await act();
    await p.locator('nav[aria-label="Site navigation"]').focus().catch(() => {}); await p.keyboard.press('ArrowDown'); await p.waitForTimeout(400); const a3 = await act();
    o.checks.push(`wheel nav keys: start=${a0}; ArrowDown after clicking page=${a1}; ArrowDown with pointer over nav=${a2}; ArrowDown with nav focused=${a3}; activeElement=${await p.evaluate(() => document.activeElement.tagName + '.' + document.activeElement.className.slice(0, 40))}`);
    o.checks.push('wheel nav listeners: ' + await p.evaluate(() => { const n = document.querySelector('nav[aria-label="Site navigation"]'); return n ? n.outerHTML.slice(0, 300) : 'none'; }));
  });
  await T('hover sound', async () => {
    await p.goto(S + '/work'); await p.waitForTimeout(1500);
    await p.mouse.click(700, 40); await p.waitForTimeout(200); await p.evaluate(() => window.__snd = []);
    for (const t of ['Serenity', 'Pragati', 'Guardia']) { await p.locator('h3', { hasText: t }).first().hover(); await p.waitForTimeout(250); }
    o.checks.push('sounds hovering 3 work cards (after a click unlocked audio): ' + (await p.evaluate(() => window.__snd)).join(', '));
    await p.evaluate(() => window.__snd = []);
    await p.keyboard.press('/'); await p.waitForTimeout(200); await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); await p.waitForTimeout(200);
    o.checks.push('sounds palette open + 2x ArrowDown: ' + (await p.evaluate(() => window.__snd)).join(', '));
    await p.evaluate(() => window.__snd = []); await p.keyboard.press('Enter'); await p.waitForTimeout(500);
    o.checks.push('sounds palette Enter (navigate): ' + (await p.evaluate(() => window.__snd)).join(', '));
    await p.evaluate(() => window.__snd = []); await p.keyboard.press('/'); await p.keyboard.type('zzzz'); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    o.checks.push('sounds Esc: ' + (await p.evaluate(() => window.__snd)).join(', '));
    await p.goto(S + '/skills'); await p.waitForTimeout(1200); await p.mouse.click(700, 40); await p.evaluate(() => window.__snd = []);
    await p.getByRole('button', { name: 'DATA', exact: true }).click(); await p.waitForTimeout(300);
    o.checks.push('sounds skills sector click: ' + (await p.evaluate(() => window.__snd)).join(', '));
  });
  await T('universe hover', async () => {
    await p.goto(S + '/'); await p.waitForTimeout(1500);
    const before = await p.evaluate(() => document.querySelectorAll('*').length);
    const link = p.locator('a', { hasText: /^Uni-Verse$/ }).first();
    await link.hover(); await p.waitForTimeout(800);
    await p.screenshot({ path: `${OUT}/1440-home-universe-hover.jpg`, type: 'jpeg', quality: 70 });
    o.checks.push(`universe link: href=${await link.getAttribute('href')} target=${await link.getAttribute('target')}; DOM nodes ${before} -> ${await p.evaluate(() => document.querySelectorAll('*').length)}; popover text: ` + await p.evaluate(() => { const c = [...document.querySelectorAll('div,span')].filter(d => /BUILDING|uni-verse\.co\.in/i.test(d.innerText || '') && d.innerText.length < 300 && getComputedStyle(d).opacity !== '0'); return c.length ? c.map(d => d.innerText.replace(/\n+/g, ' | ')).sort((a, b) => a.length - b.length).slice(-1)[0] : 'none'; }));
  });
  await T('mindmap drag', async () => {
    await p.goto(S + '/about'); await p.waitForTimeout(1200);
    await p.getByText('drag the nodes', { exact: false }).first().scrollIntoViewIfNeeded(); await p.waitForTimeout(1200);
    const node = p.getByText('FULL-STACK', { exact: true }).first();
    const b = await node.boundingBox();
    const info = await node.evaluate(e => { let n = e; for (let i = 0; i < 6; i++) { const cs = getComputedStyle(n); if (/grab|move/.test(cs.cursor) || n.style.transform) return `${n.tagName}.${n.className.slice(0, 60)} cursor=${cs.cursor} transform=${n.style.transform}`; n = n.parentElement; } return 'no grab ancestor; cursor=' + getComputedStyle(e).cursor; });
    await p.mouse.move(b.x + 20, b.y + 5); await p.mouse.down(); await p.mouse.move(b.x - 120, b.y + 80, { steps: 10 }); await p.mouse.up(); await p.waitForTimeout(400);
    const b2 = await node.boundingBox();
    await p.screenshot({ path: `${OUT}/1440-about-mindmap-dragged.jpg`, type: 'jpeg', quality: 70 });
    o.checks.push(`mind-map node FULL-STACK: ${info}; drag (${Math.round(b.x)},${Math.round(b.y)}) -> (${Math.round(b2.x)},${Math.round(b2.y)})`);
  });
  await T('edge scroll fps', async () => {
    await p.goto(S + '/work'); await p.waitForTimeout(1500);
    const fps = await p.evaluate(() => new Promise(r => { let n = 0; const t = performance.now(); const f = () => { n++; if (performance.now() - t < 1000) requestAnimationFrame(f); else r(n); }; requestAnimationFrame(f); }));
    const sc = () => p.evaluate(() => document.querySelector('.cursor-grab').scrollLeft);
    await p.mouse.move(1435, 450); await p.waitForTimeout(100); const s0 = await sc(); await p.waitForTimeout(2000); const s1 = await sc();
    await p.mouse.move(1300, 450); await p.waitForTimeout(100); const s2 = await sc(); await p.waitForTimeout(1000); const s3 = await sc();
    o.checks.push(`edge scroll: headless rAF=${fps} fps; pointer at x=1435 (outer 1%): ${Math.round((s1 - s0) / 2)} px/s; pointer at x=1300 (inside the 10% zone edge): ${Math.round(s3 - s2)} px/s`);
  });
  await ctx.close();
  return JSON.stringify(o);
}
