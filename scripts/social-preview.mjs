import { chromium } from 'playwright';

// Render the project's own typography and local photographs; no external media.
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173/al-tayyibat/';
  await page.goto(base);
  await page.setContent(`<!doctype html><html lang="ar" dir="rtl"><head><style>
    @font-face{font-family:Plex;src:url('${base}fonts/ibm-plex-sans-arabic/ibm-plex-sans-arabic-arabic-700.woff2');font-weight:700}
    *{box-sizing:border-box}body{margin:0;background:#0e1310;color:#f2ede3;font-family:Plex,sans-serif;width:1200px;height:630px;padding:48px;border:12px solid #e3b341}
    .label{font-size:22px;color:#e3b341;border-bottom:2px solid #f2ede3;padding-bottom:20px;display:flex;justify-content:space-between}
    .layout{display:grid;grid-template-columns:1.15fr 1fr;gap:42px;align-items:center;height:440px}
    h1{font-size:84px;line-height:1.4;margin:0}h1 span{color:#e3b341}p{font-size:29px;line-height:1.8;margin:12px 0}
    .photo{height:330px;border:3px solid #f2ede3;box-shadow:-10px 10px #e3b341;width:100%;object-fit:cover}
    footer{font-size:18px;color:#cfcabd;border-top:2px solid #f2ede3;padding-top:14px}
  </style></head><body><div class="label"><span>// دليل عربي تفاعلي</span><span dir="ltr">AL-TAYYIBAT</span></div>
    <div class="layout"><div><h1>نظام <span>الطيبات</span></h1><p>الأطعمة · الوصفات · البدائل</p><p style="font-size:23px;color:#cfcabd">٣٨٥ صنفًا في دليل واحد</p></div>
    <img class="photo" src="${base}images/foods/pasta.jpg" alt="المكرونة"></div>
    <footer>دليل معلوماتي مستقل لقواعد النظام — ليس بديلًا عن المشورة الطبية الشخصية</footer></body></html>`);
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode())); });
  await page.screenshot({ path: 'public/social-preview.jpg', type: 'jpeg', quality: 90 });
  console.log('Created 1200×630 local social preview.');
} finally { await browser.close(); }
