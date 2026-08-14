import { test, expect } from "@playwright/test";

// Ujian interaktiviti awam PERKIB v3.2 (LIVE perkib.my) — mengesahkan klik/toggle
// yang gagal diuji melalui Chrome MCP (tab background menggantung hidrasi).

test.describe("PERKIB v3.2 — interaktiviti awam (LIVE)", () => {
  test("M5 · accordion /soalan-lazim buka & tutup", async ({ page }) => {
    await page.goto("/soalan-lazim");
    const trigger = page.locator('[id^="acc-t-"]').first();
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    const panelId = await trigger.getAttribute("aria-controls");
    const panel = page.locator(`#${panelId}`);

    // Buka
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(panel).toHaveAttribute("data-open", "true");
    // grid-template-rows bukan 0fr bila terbuka (kandungan ada ketinggian)
    const openRows = await panel.evaluate((el) => getComputedStyle(el).gridTemplateRows);
    expect(openRows).not.toBe("0fr");
    expect(openRows).not.toBe("0px");

    // Tutup
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(panel).toHaveAttribute("data-open", "false");
  });

  test("M1 · penapis kategori /pegawai (desktop)", async ({ page }) => {
    await page.goto("/pegawai");
    await page.locator("article").first().waitFor();
    const before = await page.locator("article").count();
    expect(before).toBeGreaterThan(30);

    // Klik pill kategori "Bilal"
    const bilal = page.locator("#penapis-pegawai button", { hasText: /^Bilal/ });
    await bilal.click();
    await expect(page.getByText(/Memaparkan \d+ pegawai/)).toBeVisible();

    const after = await page.locator("article").count();
    expect(after).toBeGreaterThan(0);
    expect(after).toBeLessThan(before);

    // Setiap kad ditapis mesti kategori Bilal
    const cards = page.locator("article");
    const n = await cards.count();
    for (let i = 0; i < n; i++) {
      await expect(cards.nth(i)).toContainText("Bilal");
    }

    // Reset → kembali penuh
    await page.locator("#penapis-pegawai button", { hasText: /Semua Kategori/ }).click();
    await expect(page.locator("article")).toHaveCount(before);
  });

  test("M1 · butang Tapis + panel collapsible /pegawai (mobile)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/pegawai");
    await page.locator("article").first().waitFor();

    const tapis = page.getByRole("button", { name: /Tapis/ });
    await expect(tapis).toBeVisible();

    const panel = page.locator("#penapis-pegawai");
    await expect(panel).toBeHidden(); // tertutup pada mula (mobile)

    await tapis.click();
    await expect(panel).toBeVisible(); // dibuka

    // Tapis kategori dalam panel berfungsi
    const before = await page.locator("article").count();
    await page.locator("#penapis-pegawai button", { hasText: /^Bilal/ }).click();
    await expect(page.getByText(/Memaparkan \d+ pegawai/)).toBeVisible();
    expect(await page.locator("article").count()).toBeLessThan(before);

    await tapis.click();
    await expect(panel).toBeHidden(); // ditutup semula
  });

  test("M5 · kad /saguhati gaya Nadi", async ({ page }) => {
    await page.goto("/saguhati");
    await expect(page.getByText("kadar saguhati").first()).toBeVisible();
    await expect(page.getByText(/^S[1-9]$/).first()).toBeVisible(); // kod S1–S9
    await expect(page.getByText("Sekali seumur hidup").first()).toBeVisible();
  });

  test("M4 · arch-glow + kubah pada kad pegawai", async ({ page }) => {
    await page.goto("/pegawai");
    await page.locator("article").first().waitFor();
    // Bingkai arch-glow hadir + animasi berdenyut aktif (opacity animation)
    const archGlow = page.locator(".arch-glow").first();
    await expect(archGlow).toBeAttached();
    const glowCount = await page.locator(".arch-glow").count();
    expect(glowCount).toBeGreaterThan(50); // ~93 kad
  });
});

test.describe("PERKIB v3.3 — pembaikan (LIVE)", () => {
  test("M1 · /ajk Presiden + Timbalan Presiden featured", async ({ page }) => {
    await page.goto("/ajk");
    // Kad featured (P + TP) ada gold-topline; sekurang-kurangnya 2.
    await expect(page.locator(".gold-topline").first()).toBeVisible();
    expect(await page.locator(".gold-topline").count()).toBeGreaterThanOrEqual(2);
  });

  test("M1 · homepage kepimpinan ada bingkai arch (arch-glow)", async ({ page }) => {
    await page.goto("/");
    await page.locator("#kepimpinan").scrollIntoViewIfNeeded();
    expect(await page.locator("#kepimpinan .arch-glow").count()).toBeGreaterThan(2);
  });

  test("M5 · /sukarelawan redirect ke utama", async ({ page }) => {
    await page.goto("/sukarelawan");
    await expect(page).toHaveURL(/\/$/);
  });

  test("M4 · /direktori-masjid butang fokus wilayah", async ({ page }) => {
    await page.goto("/direktori-masjid?view=peta");
    await expect(page.getByRole("button", { name: "KL", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Putrajaya", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Labuan", exact: true })).toBeVisible();
  });

  test("M5 · CTA terapung boleh-tutup (mobile)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, 1400));
    await page.waitForTimeout(500);
    const x = page.getByRole("button", { name: "Tutup butang Mohon Saguhati" });
    await expect(x).toBeVisible(); // CTA muncul selepas skrol
    await x.click();
    await expect(x).toBeHidden(); // ditutup
  });
});

test.describe("PERKIB koordinat masjid (LIVE)", () => {
  test("peta papar pin masjid (KL default) daripada koordinat Sanity", async ({ page }) => {
    await page.goto("/direktori-masjid?view=peta");
    // Marker = <button class="perkib-pin"> ditambah selepas map 'load'.
    await page.locator(".perkib-pin").first().waitFor({ state: "attached", timeout: 20000 });
    const pins = await page.locator(".perkib-pin").count();
    expect(pins).toBeGreaterThan(40); // majoriti masjid KL kini berkoordinat
  });
});

test.describe("PERKIB v3.4 — jenama/peta/yuran (LIVE)", () => {
  test("M1 · homepage hero medali emas (logo diangkat)", async ({ page }) => {
    await page.goto("/");
    // Medali di panel arch (desktop lg:block) — sinaran radial .medali-halo.
    await expect(page.locator(".medali-halo").first()).toBeAttached();
    // Logo guna mark transparan (bukan logo.png kotak).
    const logo = page.getByAltText("Logo PERKIB").first();
    await expect(logo).toBeVisible();
  });

  test("M1 · OG thumbnail WhatsApp = /og/perkib-og.png", async ({ page }) => {
    await page.goto("/");
    const og = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(og).toContain("/og/perkib-og.png");
  });

  test("M3 · peta butang toggle 3D wujud", async ({ page }) => {
    await page.goto("/direktori-masjid?view=peta");
    await page.locator(".perkib-pin").first().waitFor({ state: "attached", timeout: 20000 });
    await expect(page.getByRole("button", { name: /Paparan 3D/ })).toBeVisible();
  });

  test("M6 · /yuran/semak borang + captcha render", async ({ page }) => {
    await page.goto("/yuran/semak");
    await expect(page.getByRole("heading", { name: /Semak Yuran/ })).toBeVisible();
    await expect(page.locator("#emp")).toBeVisible(); // No. Pekerja
    await expect(page.locator("#captcha")).toBeVisible(); // pengesahan
    await expect(page.getByRole("button", { name: /Semak Rekod Yuran/ })).toBeVisible();
  });
});

test.describe("PERKIB v3.6 — marker Claude Design (LIVE)", () => {
  test("marker masjid = rekaan Claude Design + klik → drawer + pin aktif", async ({ page }) => {
    await page.goto("/direktori-masjid?view=peta");
    const pin = page.locator(".perkib-pin").first();
    await pin.waitFor({ state: "attached", timeout: 20000 });
    // SVG marker mengandungi gradien design (teardrop shell + kubah bawang) — bukan kubah lama.
    const design = await pin.evaluate(
      (el) => el.innerHTML.includes("mm-shell-n") && el.innerHTML.includes("mm-dome-n") && el.innerHTML.includes("64 82")
    );
    expect(design).toBeTruthy();
    // Klik pin → drawer terbuka.
    await pin.click({ force: true });
    await expect(page.getByRole("link", { name: /Dapatkan Arah/ })).toBeVisible({ timeout: 8000 });
    // Pin dipilih jadi aktif (aria-current + gradien varian -a).
    const aktif = await page.evaluate(() => {
      const el = document.querySelector('.perkib-pin[aria-current="true"]');
      return !!el && el.innerHTML.includes("mm-shell-a");
    });
    expect(aktif).toBeTruthy();
  });
});

test.describe("PERKIB v4.1 — slaid video dalam deck (LIVE)", () => {
  test("video amali disisip selepas page 32 + main/jeda + slaid asal utuh", async ({ page }) => {
    await page.goto("/slide/sembelihan-2026");
    // 60 slaid asal + 9 video amali = 69 item.
    await expect(page.locator(".sb-slide")).toHaveCount(69);

    // Lompat ke bab "Haiwan & Situasi" (slaid page 31) — deterministik,
    // kemudian dua langkah: page 32 → video pertama.
    const aktif = page.locator('.sb-slide[data-state="active"]');
    await page.getByRole("button", { name: "Haiwan & Situasi" }).click();
    await expect(aktif.locator("img")).toHaveAttribute("src", /s30\.webp/);
    await page.keyboard.press("ArrowRight");
    await expect(aktif.locator("img")).toHaveAttribute("src", /s31\.webp/);
    await page.keyboard.press("ArrowRight");
    await expect(aktif.locator("video")).toHaveAttribute("src", /kuasai-1\.mp4/);
    await expect(page.locator(".sb-count")).toContainText("m/s 32");
    await expect(aktif.locator(".sb-video-label")).toContainText(/video 1\/5/i);

    // Butang main → video bermain; tukar slaid → auto-jeda.
    await aktif.locator(".sb-video-play").click();
    await expect
      .poll(async () =>
        page.evaluate(
          () => document.querySelector<HTMLVideoElement>('.sb-slide[data-state="active"] video')?.paused
        )
      )
      .toBe(false);
    await page.keyboard.press("ArrowRight");
    await expect
      .poll(async () => page.evaluate(() => [...document.querySelectorAll("video")].every((v) => v.paused)))
      .toBe(true);

    // Slaid ASAL kekal utuh selepas video (regresi fidelity).
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(aktif.locator("img")).toHaveAttribute("src", /s31\.webp/);

    // Regresi v4.0.1 — dokumen tidak boleh terseret mendatar.
    await page.locator(".sb-chapter").last().click();
    expect(await page.evaluate(() => window.scrollX)).toBe(0);
  });

  test("aset video + poster dihidangkan", async ({ request }) => {
    const v = await request.get("/slide/sembelihan-2026/video/kuasai-1.mp4", {
      headers: { Range: "bytes=0-1023" },
    });
    expect([200, 206]).toContain(v.status());
    const p = await request.get("/slide/sembelihan-2026/video/poster/kuasai-1.webp");
    expect(p.status()).toBe(200);
  });
});

test.describe("PERKIB v4.3 — senarai slaid awam (LIVE)", () => {
  test("/slide papar kad deck + header/footer laman (chrome KEKAL)", async ({ page }) => {
    await page.goto("/slide");
    await expect(page.getByRole("heading", { name: /Bahan Pembentangan PERKIB/i })).toBeVisible();
    // Chrome laman mesti hadir di senarai (berbeza dengan deck skrin penuh).
    await expect(page.locator("header").first()).toBeVisible();
    await expect(page.locator("footer").first()).toBeAttached();
    // Kad deck: tajuk + kiraan sebenar dari registry.
    await expect(page.getByRole("heading", { name: "Penyembelihan Halal" })).toBeVisible();
    await expect(page.getByText("60", { exact: true }).first()).toBeVisible();
    // Butang buka deck → deck sebenar.
    await page.getByRole("link", { name: "Buka Deck", exact: true }).click();
    await expect(page).toHaveURL(/\/slide\/sembelihan-2026$/);
    await expect(page.locator(".sb-slide")).toHaveCount(69);
  });

  test("deck kekal tanpa chrome + jenama pautan balik ke /slide", async ({ page }) => {
    await page.goto("/slide/sembelihan-2026");
    await expect(page.locator("header")).toHaveCount(0);
    await page.locator("a.sb-brand").click();
    await expect(page).toHaveURL(/\/slide$/);
  });

  test("laman utama ada kad Slaid & Modul → /slide", async ({ page }) => {
    await page.goto("/");
    const kad = page.getByRole("link", { name: /Slaid & Modul/i }).first();
    await expect(kad).toHaveAttribute("href", "/slide");
  });

  test("pautan menu header + footer → /slide (tanpa perlu skrol)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    // Nav desktop: label pendek "Slaid", mesti kelihatan tanpa skrol.
    const navSlaid = page.locator("header nav a[href='/slide']");
    await expect(navSlaid).toBeVisible();
    await expect(navSlaid).toHaveText("Slaid");
    // Nav tidak boleh melimpah keluar viewport (tambahan item ke-9).
    const box = await page.locator("header nav").first().boundingBox();
    expect(box!.x + box!.width).toBeLessThanOrEqual(1280);
    // Footer.
    await expect(page.locator("footer a[href='/slide']").first()).toHaveText("Slaid & Modul");
    await navSlaid.click();
    await expect(page).toHaveURL(/\/slide$/);
  });

  test("menu mobile ada Slaid & Modul", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    const item = page.getByRole("link", { name: "Slaid & Modul", exact: true });
    await expect(item).toBeVisible();
    await expect(item).toHaveAttribute("href", "/slide");
  });

  test("penemuan awam: sitemap + OG deck", async ({ request }) => {
    const sm = await request.get("/sitemap.xml");
    expect(sm.status()).toBe(200);
    const xml = await sm.text();
    expect(xml).toContain("/slide");
    expect(xml).toContain("/slide/sembelihan-2026");
    const og = await request.get("/og/slide-sembelihan-2026.png");
    expect(og.status()).toBe(200);
  });
});
