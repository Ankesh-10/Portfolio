async page => {
  const OUT = '/home/user/Portfolio/research_notes/Nipun space site analysis/live';
  const o = [];
  const T = async (name, fn) => { try { await fn(); } catch (e) { o.push(`ERR ${name}: ` + String(e).slice(0, 200)); } };
  const browser = page.context().browser();
  await T('contact invalid', async () => {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await c.addInitScript(() => { sessionStorage.setItem('nipun.booted', '1'); localStorage.setItem('nipun.tour.v2', '1'); });
    const p = await c.newPage(); let posted = 0; await p.route('**/api.web3forms.com/**', r => { posted++; r.abort(); });
    const errs = () => p.evaluate(() => [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && /\[ ?err ?\]/i.test(e.innerText || '')).map(e => e.innerText.trim()).join(' | ') || 'no errors');
    await p.goto('https://www.nipun.space/contact'); await p.waitForTimeout(1200);
    await p.getByPlaceholder('your name').fill('Test'); await p.getByPlaceholder('you@domain.com').fill('not-an-email'); await p.locator('textarea').fill('hi');
    await p.getByRole('button', { name: /send/ }).click(); await p.waitForTimeout(500);
    o.push('contact bad email + short body -> ' + await errs());
    await p.locator('textarea').fill('this is a longer test message body');
    await p.getByRole('button', { name: /send/ }).click(); await p.waitForTimeout(500);
    o.push('contact bad email only -> ' + await errs() + ' ; posted=' + posted);
    await p.screenshot({ path: `${OUT}/1440-contact-invalid.jpg`, type: 'jpeg', quality: 70 });
    // error clears on typing?
    await p.getByPlaceholder('you@domain.com').fill('a@b'); await p.waitForTimeout(300);
    o.push('after editing email (no submit) -> ' + await errs());
    await c.close();
  });
  await T('RM boot', async () => {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const q = await c.newPage(); const t0 = Date.now();
    await q.goto('https://www.nipun.space/');
    const s = [];
    for (let i = 0; i < 12; i++) { s.push(`+${Date.now() - t0}ms boot=${await q.getByText('press any key to skip').isVisible().catch(() => false)} prog=${await q.evaluate(() => (document.body.innerText.match(/(\d+)%/) || [])[1])}`); if (i === 2) await q.screenshot({ path: `${OUT}/1440-reduced-boot.jpg`, type: 'jpeg', quality: 70 }); await q.waitForTimeout(200); }
    o.push('RM boot timeline: ' + s.join(' | '));
    o.push('RM matchMedia: ' + await q.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches));
    await c.close();
  });
  await T('route feel 2', async () => {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await c.addInitScript(() => { sessionStorage.setItem('nipun.booted', '1'); localStorage.setItem('nipun.tour.v2', '1'); });
    const q = await c.newPage();
    await q.goto('https://www.nipun.space/writing'); await q.waitForTimeout(1500);
    await q.keyboard.press('/'); await q.keyboard.type('services'); await q.keyboard.press('Enter');
    const t0 = Date.now(); const s = [];
    for (let i = 0; i < 12; i++) {
      s.push(await q.evaluate(t => { const pick = ['h1', 'h2', 'button']; return `+${Date.now() - t}ms ` + pick.map(sel => { const h = document.querySelector('main ' + sel) || document.querySelector(sel); if (!h) return sel + ':-'; let e = h, op = 1; while (e) { op *= +getComputedStyle(e).opacity; e = e.parentElement; } const r = h.getBoundingClientRect(); return `${sel}:op${op.toFixed(2)}@y${Math.round(r.top)}`; }).join(' '); }, t0));
      await q.waitForTimeout(70);
    }
    o.push('client nav /writing -> /services: ' + s.join(' || '));
    await c.close();
  });
  return o.join('\n');
}
