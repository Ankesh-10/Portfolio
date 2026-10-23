async page => {
  const OUT = '/home/user/Portfolio/research_notes/Nipun space site analysis/live';
  await page.context().clearCookies();
  await page.evaluate(() => { sessionStorage.clear(); localStorage.clear(); });
  const t0 = Date.now();
  await page.goto('https://www.nipun.space/');
  const log = [];
  for (const t of [150, 600, 1200, 1900, 2600, 3200, 4500]) {
    await page.waitForTimeout(Math.max(0, t - (Date.now() - t0)));
    const txt = await page.evaluate(() => document.body.innerText.slice(0, 700));
    log.push(`@${Date.now() - t0}ms: ` + txt.replace(/\n+/g, ' | '));
    await page.screenshot({ path: `${OUT}/1440-boot-${t}ms.jpg`, type: 'jpeg', quality: 70 });
  }
  const ss = await page.evaluate(() => JSON.stringify({ s: { ...sessionStorage }, l: { ...localStorage } }));
  return log.join('\n') + '\nSTORAGE ' + ss;
}
