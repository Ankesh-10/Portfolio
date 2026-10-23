async page => {
  const OUT = '/home/user/Portfolio/research_notes/Nipun space site analysis/live';
  const o = [];
  const T = async (name, fn) => { try { await fn(); } catch (e) { o.push(`ERR ${name}: ` + String(e).slice(0, 200)); } };
  const browser = page.context().browser();
  const mk = async (opts = {}) => { const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts }); await c.addInitScript(() => { try { sessionStorage.setItem('nipun.booted', '1'); localStorage.setItem('nipun.tour.v2', '1'); } catch {} }); return c; };
  const ctx = await mk(); const p = await ctx.newPage();
  const posted = []; await p.route('**/api.web3forms.com/**', r => { posted.push(r.request().url()); r.abort(); });
  const errs = () => p.evaluate(() => [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && /\[ ?err ?\]|required|valid|at least|characters/i.test(e.innerText || '')).map(e => e.innerText.trim()).slice(0, 8).join(' | '));
  await T('contact', async () => {
    await p.goto('https://www.nipun.space/contact'); await p.waitForTimeout(1200);
    o.push('contact fields: ' + await p.evaluate(() => [...document.querySelectorAll('input,textarea,select')].map(e => `${e.tagName}[name=${e.name} type=${e.type} ph="${e.placeholder}" req=${e.required} hidden=${e.offsetParent === null}]`).join(' ; ')));
    o.push('form novalidate: ' + await p.evaluate(() => [...document.forms].map(f => f.noValidate)));
    await p.getByRole('button', { name: /send/ }).click(); await p.waitForTimeout(600);
    o.push('empty submit -> ' + await errs());
    await p.screenshot({ path: `${OUT}/1440-contact-empty-submit.jpg`, type: 'jpeg', quality: 70 });
    await p.locator('input').nth(0).fill('Test'); await p.locator('input[type=email], input').nth(1).fill('not-an-email'); await p.locator('textarea').fill('hi');
    await p.getByRole('button', { name: /send/ }).click(); await p.waitForTimeout(600);
    o.push('bad email + short body -> ' + await errs());
    await p.locator('textarea').fill('this is a longer test message body');
    await p.getByRole('button', { name: /send/ }).click(); await p.waitForTimeout(600);
    o.push('bad email + ok body -> ' + await errs());
    await p.screenshot({ path: `${OUT}/1440-contact-invalid.jpg`, type: 'jpeg', quality: 70 });
    o.push('web3forms requests attempted (blocked): ' + posted.length);
  });
  await T('services form', async () => {
    await p.goto('https://www.nipun.space/services'); await p.waitForTimeout(1200);
    await p.getByRole('button', { name: /start a project/ }).first().click(); await p.waitForTimeout(1500);
    o.push('after "start a project": scrollTop=' + await p.evaluate(() => document.querySelector('.overflow-y-auto').scrollTop));
    o.push('services fields: ' + await p.evaluate(() => [...document.querySelectorAll('input,textarea,select,button[role=radio]')].map(e => `${e.tagName}[${e.name || ''} ph="${(e.placeholder || '').slice(0, 40)}" val="${(e.value || '').slice(0, 60)}"]`).join(' ; ')));
    await p.screenshot({ path: `${OUT}/1440-services-brief.jpg`, type: 'jpeg', quality: 70 });
    const sb = p.getByRole('button', { name: /send|submit|brief/i }).last();
    o.push('services submit btn: ' + await sb.innerText().catch(() => '?'));
    await p.locator('textarea').last().fill(''); await sb.click(); await p.waitForTimeout(600);
    o.push('services empty submit -> ' + await errs());
    await p.screenshot({ path: `${OUT}/1440-services-brief-empty.jpg`, type: 'jpeg', quality: 70 });
    o.push('web3forms requests attempted (blocked): ' + posted.length);
  });
  await ctx.close();
  // reduced motion
  await T('reduced', async () => {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const q = await c.newPage();
    await q.goto('https://www.nipun.space/'); await q.waitForTimeout(250);
    o.push('RM: boot visible @250ms: ' + await q.getByText('press any key to skip').isVisible().catch(() => false));
    await q.waitForTimeout(1500);
    o.push('RM: tour visible @1.75s: ' + await q.getByText('HOW TO GET AROUND').isVisible().catch(() => false) + ' text: ' + (await q.evaluate(() => { const d = [...document.querySelectorAll('div')].filter(d => /HOW TO GET AROUND/.test(d.innerText) && d.innerText.length < 600).pop(); return d ? d.innerText.replace(/\n+/g, ' | ') : ''; })).slice(0, 200));
    await q.screenshot({ path: `${OUT}/1440-reduced-tour.jpg`, type: 'jpeg', quality: 70 });
    await q.keyboard.press('Escape'); await q.waitForTimeout(400);
    o.push('RM: ticker: ' + await q.evaluate(() => { const el = [...document.querySelectorAll('div')].find(e => /press\s*\/\s*to run a command/.test(e.innerText || '') && e.innerText.length < 80); return el ? el.innerText.replace(/\n/g, ' ') : 'none'; }));
    await q.mouse.move(300, 600); await q.waitForTimeout(200);
    o.push('RM: spotlight vars: ' + await q.evaluate(() => { const e = [...document.querySelectorAll('*')].find(e => e.style && e.style.getPropertyValue('--mx')); return e ? e.style.getPropertyValue('--mx') : 'none set'; }));
    o.push('RM: animation durations sample: ' + await q.evaluate(() => [...document.querySelectorAll('*')].map(e => getComputedStyle(e)).filter(s => s.animationName !== 'none').slice(0, 4).map(s => s.animationName + ' ' + s.animationDuration + ' x' + s.animationIterationCount).join(', ')));
    await q.goto('https://www.nipun.space/about'); await q.waitForTimeout(300);
    o.push('RM: about intro @300ms: ' + (await q.evaluate(() => { const h = [...document.querySelectorAll('*')].find(e => e.innerText && /^Hey, I'm/.test(e.innerText.trim()) && e.children.length < 12); return h ? h.innerText.replace(/\n+/g, ' / ') : ''; })).slice(0, 160));
    await q.screenshot({ path: `${OUT}/1440-reduced-about.jpg`, type: 'jpeg', quality: 70 });
    await q.goto('https://www.nipun.space/work'); await q.waitForTimeout(300);
    await q.screenshot({ path: `${OUT}/1440-reduced-work.jpg`, type: 'jpeg', quality: 70 });
    await c.close();
  });
  // phone specifics: tour on mobile, palette on mobile, quick nav tap
  await T('phone', async () => {
    const c = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
    const q = await c.newPage();
    await q.goto('https://www.nipun.space/'); await q.waitForTimeout(800);
    await q.screenshot({ path: `${OUT}/375-boot.jpg`, type: 'jpeg', quality: 70 });
    await q.tap('body').catch(() => {}); await q.waitForTimeout(1500);
    await q.screenshot({ path: `${OUT}/375-tour.jpg`, type: 'jpeg', quality: 70 });
    await q.getByRole('button', { name: 'got it' }).tap().catch(e => o.push('no got it'));
    await q.waitForTimeout(500);
    await q.locator('[aria-label="terminal command input"]').tap(); await q.waitForTimeout(500);
    o.push('phone: input value after tap: ' + JSON.stringify(await q.locator('[aria-label="terminal command input"]').inputValue()));
    await q.screenshot({ path: `${OUT}/375-palette.jpg`, type: 'jpeg', quality: 70 });
    await q.keyboard.press('Escape'); await q.locator('body').tap({ position: { x: 10, y: 300 } }).catch(() => {});
    const t0 = Date.now(); await q.getByRole('button', { name: 'skills', exact: true }).last().tap(); await q.waitForURL('**/skills'); o.push(`phone: quick-nav tap -> ${q.url()} in ${Date.now() - t0}ms`);
    await q.waitForTimeout(1200); await q.screenshot({ path: `${OUT}/375-skills.jpg`, type: 'jpeg', quality: 70 });
    await c.close();
  });
  // route change feel: sample opacity/transform of first heading after client nav
  await T('route feel', async () => {
    const c = await mk(); const q = await c.newPage();
    await q.goto('https://www.nipun.space/writing'); await q.waitForTimeout(1500);
    const reqBefore = []; q.on('request', r => reqBefore.push(r.url()));
    await q.keyboard.press('/'); await q.keyboard.type('about'); await q.keyboard.press('Enter');
    const samples = [];
    const t0 = Date.now();
    for (let i = 0; i < 14; i++) { samples.push(await q.evaluate(t => { const h = document.querySelector('h1'); if (!h) return `+${Date.now() - t}ms no h1`; let e = h, op = 1; while (e) { op *= +getComputedStyle(e).opacity; e = e.parentElement; } return `+${Date.now() - t}ms ${location.pathname} h1 op=${op.toFixed(2)} tf=${getComputedStyle(h.parentElement).transform}`; }, t0)); await q.waitForTimeout(60); }
    o.push('client nav /writing -> /about samples: ' + samples.join(' || '));
    o.push('requests during client nav: ' + reqBefore.filter(u => !/google|gtag|collect/.test(u)).map(u => u.replace('https://www.nipun.space', '')).join(', '));
    await c.close();
  });
  return o.join('\n');
}
