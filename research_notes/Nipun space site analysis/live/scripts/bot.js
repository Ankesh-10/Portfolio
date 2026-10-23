async page => {
  const OUT = '/home/user/Portfolio/research_notes/Nipun space site analysis/live';
  const o = [];
  const T = async (name, fn) => { try { await fn(); } catch (e) { o.push(`ERR ${name}: ` + String(e).slice(0, 200)); } };
  const ctx = await page.context().browser().newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('nipun.booted', '1'); localStorage.setItem('nipun.tour.v2', '1'); } catch {} });
  const p = await ctx.newPage();
  const reqs = [];
  p.on('request', r => { if (r.url().includes('/api/ask') || r.url().includes('/rag/')) reqs.push(`${r.method()} ${r.url().replace('https://www.nipun.space', '')} ${(r.postData() || '').slice(0, 80)}`); });
  const bar = () => p.evaluate(() => { const n = [...document.querySelectorAll('div')].filter(d => /fixed/.test(d.className) && /bottom-0/.test(d.className)).pop(); return n.innerText.replace(/\n+/g, ' | '); });
  const ask = async (q, tag) => {
    const inp = p.locator('[aria-label="terminal command input"]');
    await inp.click(); await inp.fill(q); await p.keyboard.press('Enter');
    const t0 = Date.now(); const states = [];
    for (let i = 0; i < 40; i++) {
      await p.waitForTimeout(500);
      const b = await bar(); states.push(`+${Date.now() - t0}ms ${b.slice(0, 160)}`);
      if (i === 2) await p.screenshot({ path: `${OUT}/1440-lucbot-${tag}-thinking.jpg`, type: 'jpeg', quality: 70 });
      if (i === 6) await p.screenshot({ path: `${OUT}/1440-lucbot-${tag}-streaming.jpg`, type: 'jpeg', quality: 70 });
      if (i > 6 && states.length > 3 && states.at(-1) === states.at(-2)?.replace(/^\+\d+ms/, states.at(-1).match(/^\+\d+ms/)[0])) break;
    }
    await p.screenshot({ path: `${OUT}/1440-lucbot-${tag}-done.jpg`, type: 'jpeg', quality: 70 });
    o.push(`Q "${q}":`); o.push('  first states: ' + states.slice(0, 4).join(' || '));
    o.push('  final: ' + (await bar()).slice(0, 1400));
    o.push('  buttons: ' + await p.evaluate(() => { const n = [...document.querySelectorAll('div')].filter(d => /fixed/.test(d.className) && /bottom-0/.test(d.className)).pop(); return [...n.querySelectorAll('button,a')].map(b => b.innerText.trim()).filter(Boolean).join(' / '); }));
  };
  await p.goto('https://www.nipun.space/'); await p.waitForTimeout(1500);
  await T('q1', () => ask('what is LucBot and how does it work?', 'q1'));
  await T('esc', async () => { await p.keyboard.press('Escape'); await p.waitForTimeout(500); o.push('after Esc bar: ' + (await bar()).slice(0, 200)); });
  await T('q2', () => ask('which project should I look at first?', 'q2'));
  await T('takeme', async () => {
    const btn = p.locator('button', { hasText: /take me|→|↗/ }).first();
    o.push('take-me button count: ' + await p.locator('button', { hasText: /take me/i }).count());
    const inp = p.locator('[aria-label="terminal command input"]'); await inp.click(); await inp.fill(''); await p.keyboard.press('Enter'); await p.waitForTimeout(1200);
    o.push('Enter on empty after answer -> ' + p.url());
  });
  await T('q3', () => ask('how can I hire Nipun?', 'q3'));
  o.push('network: ' + reqs.join(' || '));
  await ctx.close();
  return o.join('\n');
}
