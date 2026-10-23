async page => {
  const OUT = '/home/user/Portfolio/research_notes/Nipun space site analysis/live';
  const o = [];
  const ctx = await page.context().browser().newContext({ viewport: { width: 1440, height: 900 } });
  try { await ctx.addInitScript(() => { try { sessionStorage.setItem('nipun.booted', '1'); localStorage.setItem('nipun.tour.v2', '1'); } catch {} }); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  const p = await ctx.newPage();
  const vis = async sel => p.locator(sel).first().isVisible().catch(() => false);
  try { await p.goto('https://www.nipun.space/'); await p.waitForTimeout(1500); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  // ticker under input?
  try { o.push('ticker element: ' + await p.evaluate(() => { const el = [...document.querySelectorAll('*')].find(e => /press\s*\/\s*to run a command/.test(e.innerText||'') && e.children.length < 6 && e.innerText.length < 80); return el ? el.outerHTML.slice(0, 300) : 'none'; })); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  const tick = [];
  for (let i = 0; i < 8; i++) { tick.push(await p.evaluate(() => { const el = [...document.querySelectorAll('span,div,p')].find(e => /…$/.test((e.innerText||'').trim()) && e.innerText.length < 40); return el ? el.innerText.trim() : ''; })); await p.waitForTimeout(700); }
  try { o.push('ticker words over 5.6s: ' + [...new Set(tick)].join(' / ')); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  // focus via '/' hotkey
  try { await p.keyboard.press('/'); await p.waitForTimeout(500); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  const inp = p.locator('[aria-label="terminal command input"]');
  try { o.push('after / hotkey: focused=' + await inp.evaluate(e => e === document.activeElement) + ' value=' + JSON.stringify(await inp.inputValue())); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { await p.screenshot({ path: `${OUT}/1440-palette-open.jpg`, type: 'jpeg', quality: 70 }); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { o.push('palette text: ' + await p.evaluate(() => { const n = [...document.querySelectorAll('div')].filter(d => /fixed/.test(d.className) && /bottom-0/.test(d.className)).pop(); return (n ? n.innerText : 'nobar').replace(/\n+/g, ' | ').slice(0, 900); })); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); await p.waitForTimeout(200); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { await p.screenshot({ path: `${OUT}/1440-palette-arrow.jpg`, type: 'jpeg', quality: 70 }); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { await p.keyboard.type('sk'); await p.waitForTimeout(300); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { o.push('filter "/sk": ' + await p.evaluate(() => { const n = [...document.querySelectorAll('div')].filter(d => /fixed/.test(d.className) && /bottom-0/.test(d.className)).pop(); return (n ? n.innerText : 'nobar').replace(/\n+/g, ' | ').slice(0, 300); })); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { await p.keyboard.press('Escape'); await p.waitForTimeout(300); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { o.push('after Esc value=' + JSON.stringify(await inp.inputValue())); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { await inp.fill('/abo'); await p.waitForTimeout(200); await p.keyboard.press('Enter'); await p.waitForTimeout(1200); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { o.push('Enter on /abo -> ' + p.url()); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  // j/k? arrows on home wheel
  try { await p.goto('https://www.nipun.space/'); await p.waitForTimeout(1500); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  const navTxt = async () => p.evaluate(() => { const n = document.querySelector('nav[aria-label="Site navigation"]'); if (!n) return 'nonav'; return [...n.querySelectorAll('button')].map(b => `${b.innerText.trim()}:${getComputedStyle(b).fontSize}`).join(' '); });
  try { o.push('wheel initial: ' + await navTxt()); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { await p.mouse.move(720, 450); await p.mouse.wheel(0, 120); await p.waitForTimeout(400); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { o.push('after wheel down: ' + await navTxt()); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { await p.keyboard.press('ArrowDown'); await p.waitForTimeout(400); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { o.push('after ArrowDown: ' + await navTxt()); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { await p.keyboard.press('j'); await p.waitForTimeout(400); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { o.push('after j: ' + await navTxt() + ' url ' + p.url()); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { await p.keyboard.press('Enter'); await p.waitForTimeout(1000); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { o.push('after Enter on home: ' + p.url()); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { await p.goto('https://www.nipun.space/'); await p.waitForTimeout(1200); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { await p.screenshot({ path: `${OUT}/1440-home-wheel.jpg`, type: 'jpeg', quality: 70 }); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  // back / home buttons
  try { await p.goto('https://www.nipun.space/skills'); await p.waitForTimeout(800); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { await p.goto('https://www.nipun.space/writing'); await p.waitForTimeout(800); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { await p.getByRole('button', { name: 'Go back' }).click(); await p.waitForTimeout(800); o.push('Go back -> ' + p.url()); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { await p.getByRole('button', { name: 'Go home' }).click(); await p.waitForTimeout(800); o.push('Go home -> ' + p.url()); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  // work carousel keys
  try { await p.goto('https://www.nipun.space/work'); await p.waitForTimeout(1500); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  const sc = () => p.evaluate(() => Math.round(document.querySelector('.cursor-grab').scrollLeft));
  try { o.push('work scrollLeft start ' + await sc()); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(700); o.push('after ArrowRight ' + await sc()); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { await p.mouse.move(720, 450); await p.mouse.wheel(0, 300); await p.waitForTimeout(700); o.push('after wheel 300 ' + await sc()); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { await p.mouse.move(1420, 450); await p.waitForTimeout(1000); o.push('after 1s edge-hover right ' + await sc()); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { await p.mouse.move(720, 450); await p.waitForTimeout(300); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { const s0 = await sc(); await p.mouse.down(); await p.mouse.move(520, 450, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(500); o.push(`drag 200px left: ${s0} -> ${await sc()} url ${p.url()}`); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  // hover card
  const card = p.locator('h3', { hasText: 'Serenity' }).first();
  try { await card.hover(); await p.waitForTimeout(600); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { await p.screenshot({ path: `${OUT}/1440-work-hover.jpg`, type: 'jpeg', quality: 70 }); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { await p.keyboard.press('Enter'); await p.waitForTimeout(1200); o.push('Enter on work -> ' + p.url()); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  // serenity j/k
  try { await p.goto('https://www.nipun.space/work/serenity'); await p.waitForTimeout(1500); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  const act = () => p.evaluate(() => document.querySelector('main, body').innerText.match(/(\w+)\.md\s*Preview/)?.[1]);
  try { o.push('serenity active ' + await act()); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { await p.keyboard.press('j'); await p.waitForTimeout(500); o.push('after j ' + await act()); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { await p.keyboard.press('ArrowDown'); await p.waitForTimeout(500); o.push('after ArrowDown ' + await act()); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { await p.keyboard.press('k'); await p.waitForTimeout(500); o.push('after k ' + await act()); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  try { await p.screenshot({ path: `${OUT}/1440-serenity-features.jpg`, type: 'jpeg', quality: 70 }); } catch (e) { o.push("ERR: "+String(e).slice(0,160)); }
  await ctx.close();
  return o.join('\n');
}
