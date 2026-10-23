async page => {
  const S = 'https://www.nipun.space'; const o = [];
  const ctx = await page.context().browser().newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => {
    try { sessionStorage.setItem('nipun.booted', '1'); localStorage.setItem('nipun.tour.v2', '1'); } catch {}
    window.__snd = []; const AC = window.AudioContext; const orig = AC.prototype.createOscillator;
    AC.prototype.createOscillator = function () { const osc = orig.call(this); const st = osc.start.bind(osc); osc.start = (...a) => { window.__snd.push(`${osc.type}@${Math.round(osc.frequency.value)}`); return st(...a); }; return osc; };
  });
  const p = await ctx.newPage();
  const take = () => p.evaluate(() => { const r = window.__snd.join(', ') || 'none'; window.__snd = []; return r; });
  const step = async (label, fn) => { try { await take(); await fn(); await p.waitForTimeout(350); o.push(`${label}: ${await take()}`); } catch (e) { o.push(`${label}: ERR ${String(e).slice(0, 120)}`); } };
  await p.goto(S + '/work'); await p.waitForTimeout(1500);
  await step('first click on page (unlock)', () => p.mouse.click(700, 120));
  await step('move pointer across 3 cards', async () => { for (const x of [720, 1040, 1300]) { await p.mouse.move(x, 450, { steps: 4 }); await p.waitForTimeout(150); } });
  await step('hover back/home buttons', async () => { await p.mouse.move(36, 22); await p.waitForTimeout(150); await p.mouse.move(68, 22); });
  await step('/ then ArrowDown x2', async () => { await p.keyboard.press('/'); await p.waitForTimeout(150); await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); });
  await step('Enter (navigate via palette)', () => p.keyboard.press('Enter'));
  await step('/zz + Enter (unknown command)', async () => { await p.keyboard.press('/'); await p.keyboard.type('zz'); await p.keyboard.press('Enter'); await p.waitForTimeout(400); });
  await step('Escape', () => p.keyboard.press('Escape'));
  await p.goto(S + '/skills'); await p.waitForTimeout(1200);
  await step('click page (unlock)', () => p.mouse.click(700, 120));
  await step('click DATA sector', () => p.getByRole('button', { name: 'DATA', exact: true }).click());
  await step('hover skill row', () => p.mouse.move(1100, 340, { steps: 3 }));
  await p.goto(S + '/'); await p.waitForTimeout(1200);
  await step('click page (unlock)', () => p.mouse.click(300, 650));
  await step('hover wheel items', async () => { for (const y of [300, 352, 395]) { await p.mouse.move(720, y, { steps: 3 }); await p.waitForTimeout(120); } });
  await step('click a wheel item', () => p.mouse.click(720, 395));
  await ctx.close();
  return o.join('\n');
}
