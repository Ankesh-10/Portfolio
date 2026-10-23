async page => {
  const OUT = '/home/user/Portfolio/research_notes/Nipun space site analysis/live';
  const o = [];
  const T = async (name, fn) => { try { await fn(); } catch (e) { o.push(`ERR ${name}: ` + String(e).slice(0, 200)); } };
  const ctx = await page.context().browser().newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => {
    try { sessionStorage.setItem('nipun.booted', '1'); localStorage.setItem('nipun.tour.v2', '1'); } catch {}
    window.__snd = []; window.__vib = [];
    const AC = window.AudioContext;
    if (AC) { const orig = AC.prototype.createOscillator; AC.prototype.createOscillator = function () { const osc = orig.call(this); const st = osc.start.bind(osc); osc.start = (...a) => { window.__snd.push(`${osc.type}@${Math.round(osc.frequency.value)}`); return st(...a); }; return osc; }; }
    navigator.vibrate = (x) => { window.__vib.push(x); return true; };
  });
  const p = await ctx.newPage();
  const snd = async () => { const s = await p.evaluate(() => { const r = window.__snd.slice(); window.__snd = []; return r; }); return s.join(',') || 'none'; };
  await T('home cursor', async () => {
    await p.goto('https://www.nipun.space/'); await p.waitForTimeout(1500);
    o.push('cursor css: ' + await p.evaluate(() => ['html', 'body', 'a', 'button'].map(s => { const e = document.querySelector(s); return s + '=' + getComputedStyle(e).cursor.slice(0, 120); }).join(' ; ')));
    o.push('custom cursor elements: ' + await p.evaluate(() => [...document.querySelectorAll('*')].filter(e => /cursor|reticle/i.test(e.className + '') && getComputedStyle(e).position === 'fixed').map(e => e.className.slice(0, 80)).join(' | ') || 'none'));
    await p.mouse.move(300, 600); await p.waitForTimeout(300);
    o.push('spotlight vars: ' + await p.evaluate(() => { const e = [...document.querySelectorAll('*')].find(e => e.style && e.style.getPropertyValue('--mx')); return e ? `--mx=${e.style.getPropertyValue('--mx')} --my=${e.style.getPropertyValue('--my')} on ${e.tagName}.${(e.className+'').slice(0,60)}` : 'none'; }));
    await p.screenshot({ path: `${OUT}/1440-home-spotlight.jpg`, type: 'jpeg', quality: 70, clip: { x: 100, y: 450, width: 400, height: 300 } });
    // sound on hover
    await p.mouse.click(5, 5); await p.waitForTimeout(100); await snd();
    await p.locator('nav[aria-label="Site navigation"] button', { hasText: 'work' }).hover(); await p.waitForTimeout(300);
    o.push('sound after hovering wheel item: ' + await snd());
    await p.mouse.move(720, 450); await p.mouse.wheel(0, 120); await p.waitForTimeout(400);
    o.push('sound after wheel: ' + await snd());
    await p.keyboard.press('/'); await p.keyboard.type('abc'); await p.waitForTimeout(200);
    o.push('sound after typing: ' + await snd() + ' ; vibrate calls: ' + JSON.stringify(await p.evaluate(() => window.__vib)));
    await p.keyboard.press('Escape');
    o.push('mute/sound controls: ' + await p.evaluate(() => [...document.querySelectorAll('button,[role=switch]')].filter(b => /mute|sound|audio|volume/i.test((b.getAttribute('aria-label') || '') + b.innerText + b.title)).map(b => b.outerHTML.slice(0, 120)).join(' | ') || 'none'));
    o.push('Uni-Verse hover card: ');
    await p.locator('a', { hasText: 'Uni-Verse' }).first().hover(); await p.waitForTimeout(700);
    await p.screenshot({ path: `${OUT}/1440-home-universe-hover.jpg`, type: 'jpeg', quality: 70 });
    o.push('  ' + await p.evaluate(() => { const els = [...document.querySelectorAll('div')].filter(d => /BUILDING/.test(d.innerText) && d.innerText.length < 400); return els.length ? els.pop().innerText.replace(/\n+/g, ' | ') : 'none'; }));
  });
  await T('map visited', async () => {
    const c2 = await page.context().browser().newContext({ viewport: { width: 1440, height: 900 } });
    await c2.addInitScript(() => { try { sessionStorage.setItem('nipun.booted', '1'); localStorage.setItem('nipun.tour.v2', '1'); } catch {} });
    const q = await c2.newPage();
    await q.goto('https://www.nipun.space/about'); await q.waitForTimeout(800);
    await q.goto('https://www.nipun.space/map'); await q.waitForTimeout(1500);
    o.push('map ticks after visiting only /about: ' + await q.evaluate(() => document.body.innerText.match(/(HOME|WORK|ABOUT|SKILLS|SERVICES|WRITING|ACHIEVEMENTS|OPEN SOURCE|CONTACT) ?✓/g)?.join(', ')));
    await q.locator('text=SKILLS').first().hover(); await q.waitForTimeout(600);
    o.push('map NOTES on hover SKILLS: ' + await q.evaluate(() => { const n = [...document.querySelectorAll('div')].filter(d => /^NOTES/.test(d.innerText.trim())).pop(); return n ? n.innerText.replace(/\n+/g, ' ') : 'none'; }));
    await q.screenshot({ path: `${OUT}/1440-map-hover.jpg`, type: 'jpeg', quality: 70 });
    await q.keyboard.press('/'); await q.waitForTimeout(300);
    o.push('palette ticks: ' + await q.evaluate(() => { const n = [...document.querySelectorAll('div')].filter(d => /fixed/.test(d.className) && /bottom-0/.test(d.className)).pop(); return n.innerText.replace(/\n+/g, ' ').match(/\/\w[\w-]* [^/]*?✓/g)?.join(' || '); }));
    await q.locator('text=WORK').first().click(); await q.waitForTimeout(800); o.push('click WORK node -> ' + q.url());
    await c2.close();
  });
  await T('skills', async () => {
    await p.goto('https://www.nipun.space/skills'); await p.waitForTimeout(1200);
    const sel = () => p.evaluate(() => [...document.querySelectorAll('button')].filter(b => /^(ALL|AI \/ ML|LANGUAGES|BACKEND|FRONTEND|DATA|CLOUD \/ DEVOPS)$/.test(b.innerText.trim())).map(b => b.innerText.trim() + (b.getAttribute('aria-pressed') === 'true' || /accent|red|border-\[/.test(b.className) && getComputedStyle(b).color !== 'rgb(229, 229, 229)' ? '*' : '') + ':' + getComputedStyle(b).color).join(' '));
    o.push('skills buttons t=1.2s: ' + await sel());
    await p.waitForTimeout(4000); o.push('skills buttons t=5.2s: ' + await sel());
    await p.getByRole('button', { name: 'BACKEND', exact: true }).click(); await p.waitForTimeout(1200);
    o.push('after BACKEND click centre: ' + await p.evaluate(() => document.body.innerText.match(/\d+\s*\n\s*BACKEND/)?.[0]?.replace(/\s+/g, ' ')));
    await p.screenshot({ path: `${OUT}/1440-skills-backend.jpg`, type: 'jpeg', quality: 70 });
    await p.getByRole('button', { name: 'ALL', exact: true }).click(); await p.waitForTimeout(1200);
    await p.screenshot({ path: `${OUT}/1440-skills-all.jpg`, type: 'jpeg', quality: 70 });
    o.push('ALL text: ' + (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(180, 700));
  });
  await T('about', async () => {
    await p.goto('https://www.nipun.space/about'); await p.waitForTimeout(400);
    const intro = () => p.evaluate(() => { const h = [...document.querySelectorAll('*')].find(e => e.innerText && /^Hey, I'm/.test(e.innerText.trim()) && e.children.length < 12); return h ? h.innerText.replace(/\n/g, ' / ').slice(0, 300) : ''; });
    o.push('about intro @0.4s: ' + await intro()); await p.waitForTimeout(2000); o.push('about intro @2.4s: ' + await intro());
    await p.getByRole('button', { name: /skip/ }).first().click().catch(e => o.push('no skip btn')); await p.waitForTimeout(300); o.push('after skip: ' + await intro());
    o.push('ascii art element: ' + await p.evaluate(() => { const pre = [...document.querySelectorAll('pre,canvas')]; return pre.map(e => `${e.tagName} ${e.clientWidth}x${e.clientHeight}`).join(', '); }));
    await snd();
    for (let i = 0; i < 15; i++) await p.mouse.move(200 + i * 25, 400 + (i % 2) * 60, { steps: 2 });
    await p.screenshot({ path: `${OUT}/1440-about-glitch.jpg`, type: 'jpeg', quality: 70 });
    o.push('sounds from pointer over ascii: ' + await snd());
    await p.getByText('SYSTEM TELEMETRY').first().click(); await p.waitForTimeout(1200);
    await p.screenshot({ path: `${OUT}/1440-about-telemetry.jpg`, type: 'jpeg', quality: 70 });
    o.push('scroller top after telemetry click: ' + await p.evaluate(() => document.querySelector('.overflow-y-auto').scrollTop));
    const sc = p.locator('.overflow-y-auto').first();
    for (const y of [1700, 2600, 3500]) { await sc.evaluate((e, y) => e.scrollTo(0, y), y); await p.waitForTimeout(1300); await p.screenshot({ path: `${OUT}/1440-about-y${y}.jpg`, type: 'jpeg', quality: 70 }); }
    o.push('about nodes: ' + await p.evaluate(() => document.querySelectorAll('.react-flow__node').length + ' react-flow nodes'));
    const node = p.locator('.react-flow__node').first();
    if (await node.count()) { const b = await node.boundingBox(); await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await p.mouse.down(); await p.mouse.move(b.x + 120, b.y + 60, { steps: 6 }); await p.mouse.up(); const b2 = await node.boundingBox(); o.push(`drag node: (${Math.round(b.x)},${Math.round(b.y)}) -> (${Math.round(b2.x)},${Math.round(b2.y)})`); }
    o.push('sticky strip: ' + await p.evaluate(() => [...document.querySelectorAll('*')].filter(e => getComputedStyle(e).position === 'sticky').map(e => e.className.slice(0, 60)).join(' | ')));
  });
  await T('achievements', async () => {
    await p.goto('https://www.nipun.space/achievements'); await p.waitForTimeout(1500);
    await p.screenshot({ path: `${OUT}/1440-achievements-top.jpg`, type: 'jpeg', quality: 70 });
    o.push('draggables: ' + await p.evaluate(() => [...document.querySelectorAll('[draggable], .cursor-grab, [style*="touch-action"]')].map(e => `${e.tagName}.${(e.className+'').slice(0,50)}`).slice(0, 8).join(' | ')));
    const d = p.locator('.cursor-grab').first();
    if (await d.count()) { await snd(); const b = await d.boundingBox(); await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await p.mouse.down(); await p.mouse.move(b.x + b.width / 2 - 150, b.y + b.height / 2 + 40, { steps: 6 }); await p.mouse.up(); const b2 = await d.boundingBox(); o.push(`badge drag (${Math.round(b.x)},${Math.round(b.y)}) -> (${Math.round(b2.x)},${Math.round(b2.y)}); sound ${await snd()}`); await p.screenshot({ path: `${OUT}/1440-achievements-dragged.jpg`, type: 'jpeg', quality: 70 }); }
    const sc = p.locator('.overflow-y-auto').first(); await sc.evaluate(e => e.scrollTo(0, 700)); await p.waitForTimeout(1200);
    await p.screenshot({ path: `${OUT}/1440-achievements-certs.jpg`, type: 'jpeg', quality: 70 });
    o.push('cert links: ' + await p.evaluate(() => [...document.querySelectorAll('a')].filter(a => /cert|verify/i.test(a.innerText)).map(a => a.innerText.trim() + '→' + a.getAttribute('href') + (a.target ? ' [' + a.target + ']' : '')).slice(0, 6).join(' | ')));
  });
  await T('services', async () => {
    await p.goto('https://www.nipun.space/services'); await p.waitForTimeout(1200);
    await p.getByRole('button', { name: 'AI APPS', exact: true }).click(); await p.waitForTimeout(900);
    o.push('services after AI APPS filter: ' + await p.evaluate(() => [...document.querySelectorAll('h2')].map(h => h.innerText).join(', ')));
    await p.screenshot({ path: `${OUT}/1440-services-aiapps.jpg`, type: 'jpeg', quality: 70 });
    await p.getByRole('button', { name: 'ALL', exact: true }).click(); await p.waitForTimeout(600);
  });
  await ctx.close();
  return o.join('\n');
}
