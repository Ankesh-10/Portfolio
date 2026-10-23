async page => {
  const OUT = '/home/user/Portfolio/research_notes/Nipun space site analysis/live';
  const out = [];
  await page.evaluate(() => { sessionStorage.clear(); localStorage.clear(); });
  let t0 = Date.now();
  await page.goto('https://www.nipun.space/');
  await page.waitForTimeout(500);
  await page.keyboard.press('x');            // skip boot
  const skipAt = Date.now() - t0;
  // wait for tour
  await page.getByText('HOW TO GET AROUND', { exact: false }).first().waitFor({ timeout: 5000 });
  out.push(`boot skipped at ${skipAt}ms; tour visible at ${Date.now() - t0}ms`);
  const tt = Date.now();
  const seen = new Set();
  for (let i = 0; i < 26; i++) {
    const s = await page.evaluate(() => {
      const card = [...document.querySelectorAll('div')].find(d => /HOW TO GET AROUND/i.test(d.innerText) && d.innerText.length < 600 && d.querySelector('button'));
      return card ? card.innerText.replace(/\n+/g, ' | ') : 'none';
    });
    if (!seen.has(s)) { seen.add(s); out.push(`tour +${Date.now() - tt}ms: ${s}`); }
    if ([4, 10, 16].includes(i)) await page.screenshot({ path: `${OUT}/1440-tour-step${i}.jpg`, type: 'jpeg', quality: 70 });
    await page.waitForTimeout(200);
  }
  // test Esc dismisses
  await page.keyboard.press('Escape');
  await page.waitForTimeout(700);
  out.push('after Esc tour visible: ' + await page.getByText('HOW TO GET AROUND').isVisible().catch(() => false));
  out.push('storage: ' + await page.evaluate(() => JSON.stringify({ ...localStorage })));
  // boot does not re-show in same session
  await page.reload(); await page.waitForTimeout(400);
  out.push('after reload, boot shown: ' + await page.getByText('press any key to skip').isVisible().catch(() => false));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/1440-home.jpg`, type: 'jpeg', quality: 70 });
  return out.join('\n');
}
