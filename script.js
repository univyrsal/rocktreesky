function loadSettings() {
  return fetch('settings.md', { cache: 'no-cache' })
    .then((r) => (r.ok ? r.text() : Promise.reject(new Error('HTTP ' + r.status))))
    .then((text) => {
      // Only the ``` code blocks are settings; the rest is notes. Each block
      // runs on its own, so a mistake in one only skips that block.
      const blocks = [...text.replace(/\r\n?/g, '\n').matchAll(/^```[^\n]*\n([\s\S]*?)^```/gm)];
      for (const [, code] of blocks) {
        try {
          (0, eval)(code); // runs as plain page-wide code: NAME = value sets NAME
        } catch (err) {
          console.error('settings.md: skipped a code block with a mistake (' + err.message + '):\n' + code);
        }
      }
    })
    .catch((err) => console.warn('settings.md could not be loaded (' + err.message + '); using the built-in defaults.'));
}

function setting(name, fallback) {
  const value = window[name];
  if (value === undefined || typeof value !== typeof fallback) return fallback;
  return value;
}

// Fonts named in FONT_FILES are loaded from those files; any other font is
// fetched from Google Fonts. FALLBACK_FONT stands in while a font loads, or
// for good if it can't be found.
function loadFonts() {
  const fallback = setting('FALLBACK_FONT', 'Nunito');
  const heading = { family: setting('HEADING_FONT', 'Gotham Rounded'), weight: setting('HEADING_WEIGHT', 700) };
  const body = { family: setting('BODY_FONT', 'Gotham Rounded'), weight: setting('BODY_WEIGHT', 700) };
  const files = setting('FONT_FILES', []).filter((f) => f && f.family && f.file);
  const fromFile = new Set(files.map((f) => f.family));

  if (files.length) {
    const style = document.createElement('style');
    style.textContent = files.map((f) => `@font-face {
      font-family: "${f.family}";
      src: url("${encodeURI(f.file)}");
      font-weight: ${f.weight || 400};
      font-display: swap;
    }`).join('\n');
    document.head.appendChild(style);
  }

  // One request per Google family, so a name Google doesn't have can't
  // take the others down with it
  const google = new Map();
  for (const want of [heading, body, { family: fallback, weight: heading.weight }, { family: fallback, weight: body.weight }]) {
    if (!want.family || fromFile.has(want.family)) continue;
    if (!google.has(want.family)) google.set(want.family, new Set());
    google.get(want.family).add(want.weight);
  }
  for (const [family, weights] of google) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${[...weights].sort((a, b) => a - b).join(';')}&display=swap`;
    document.head.appendChild(link);
  }

  const stack = (family) => [family, fallback].filter(Boolean).map((f) => `"${f}"`).join(', ') + ', system-ui, sans-serif';
  root.style.setProperty('--heading-font', stack(heading.family));
  root.style.setProperty('--heading-weight', heading.weight);
  root.style.setProperty('--body-font', stack(body.family));
  root.style.setProperty('--body-weight', body.weight);

  // Say so in the console if a font didn't turn up, rather than quietly
  // showing the fallback
  // (A missing file makes load() fail outright; a name Google doesn't have
  // just finds no faces.)
  for (const { family, weight } of [...new Map([heading, body].map((f) => [`${f.family} ${f.weight}`, f])).values()]) {
    const warn = () => console.warn(`Font "${family}" (weight ${weight}) didn't load, so "${fallback}" is showing instead. ` +
      (fromFile.has(family) ? 'Check that its file is in the fonts folder and the path in FONT_FILES in settings.md matches.' : 'It isn\'t on Google Fonts; add its file to FONT_FILES in settings.md.'));
    document.fonts.load(`${weight} 1em "${family}"`).then((faces) => { if (!faces.length) warn(); }, warn);
  }
}

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const root = document.documentElement;
const sidebar = document.querySelector('.sidebar');
const thermometer = document.querySelector('.thermometer');
const fill = document.querySelector('.fill');
const scale = document.querySelector('.scale');
const raisedEl = document.querySelector('.raised');
const labelEl = document.querySelector('.raised-label');
const donorsEl = document.querySelector('.donors');
const content = document.querySelector('.content');
const donateEl = document.querySelector('.donate');

function applySettings() {
  root.style.setProperty('--accent', setting('ACCENT_COLOR', '#6ABF4B'));
  root.style.setProperty('--panel', setting('PANEL_COLOR', '#6ABF4B'));
  // Bottom to top, evenly spaced; the bulb is the first (bottom) color
  let colors = setting('THERMOMETER_COLORS', []).filter((c) => typeof c === 'string' && c.trim());
  if (!colors.length) colors = [setting('ACCENT_COLOR', '#6ABF4B')];
  if (colors.length === 1) colors.push(colors[0]);
  root.style.setProperty('--fill-colors', colors.join(', '));
  root.style.setProperty('--bulb-color', colors[0]);
  thermometer.classList.toggle('flat', !setting('THERMOMETER_SHINE', true));
  root.style.setProperty('--bg', setting('BACKGROUND_COLOR', '#F6F3EE'));
  root.style.setProperty('--text', setting('TEXT_COLOR', '#22302B'));
  root.style.setProperty('--thermometer-width', setting('THERMOMETER_WIDTH', 56) + 'px');
  root.style.setProperty('--pay-width', setting('PAY_PANEL_WIDTH', 420) + 'px');
  root.style.setProperty('--form-height', Math.max(400, setting('FORM_HEIGHT_ON_PHONES', 1000)) + 'px');
  root.style.setProperty('--fill-duration', setting('FILL_ANIMATION_MS', 1600) + 'ms');
  sidebar.classList.toggle('scrolls', !setting('STAY_IN_PLACE', true));
  document.body.classList.toggle('panel-right', setting('PANEL_SIDE', 'right') !== 'left');

  root.style.setProperty('--picture-width', Math.max(20, setting('PICTURE_WIDTH', 720)) + 'px');
  // 0 = as tall as the picture works out; any other number sets the height.
  const pictureHeight = Math.max(0, setting('PICTURE_HEIGHT', 0));
  root.style.setProperty('--picture-height', pictureHeight + 'px');
  content.classList.toggle('set-picture-height', pictureHeight > 0);
  root.style.setProperty('--picture-radius', Math.max(0, setting('PICTURE_CORNER_RADIUS', 12)) + 'px');
  // {banner} pictures: 0 = their own shape; any other number crops them to that height
  const bannerHeight = Math.max(0, setting('BANNER_HEIGHT', 0));
  root.style.setProperty('--banner-height', bannerHeight > 0 ? bannerHeight + 'px' : 'auto');
}

// The Zeffy donation form (settings.md: ZEFFY_FORM_LINK). Takes the form's
// normal link or its embed link, and shows the embed version in the panel.
function showDonateForm() {
  const link = setting('ZEFFY_FORM_LINK', '').trim();
  if (!link) return;
  let url = null;
  try { url = new URL(link); } catch (err) { /* not a link */ }
  if (!url || url.protocol !== 'https:' || !/(^|.)zeffy.com$/i.test(url.hostname)) {
    console.warn('ZEFFY_FORM_LINK in settings.md should be a link starting https://www.zeffy.com/ ; showing the placeholder instead.');
    return;
  }
  // The embed version has /embed/ before the form type, after any language
  // part (www.zeffy.com/en-US/embed/donation-form/...)
  const parts = url.pathname.split('/').filter(Boolean);
  if (!parts.includes('embed')) parts.splice(/^[a-z]{2}(-[a-z]{2})?$/i.test(parts[0] || '') ? 1 : 0, 0, 'embed');
  url.pathname = '/' + parts.join('/');

  const frame = document.createElement('iframe');
  frame.className = 'donate-form';
  frame.title = 'Donation form powered by Zeffy';
  frame.src = url.href;
  frame.allow = 'payment';                    // Apple Pay / Google Pay
  frame.setAttribute('allowpaymentrequest', ''); // the same, for older browsers
  frame.setAttribute('allowtransparency', 'true');
  donateEl.replaceChildren(frame);
}

// The page text, from content.md. A # heading on the very first line is the
// page's big title; everything else goes through markdownToHtml (markdown.js).
function loadContent() {
  return fetch('content.md', { cache: 'no-cache' })
    .then((r) => (r.ok ? r.text() : Promise.reject(new Error('HTTP ' + r.status))))
    .then((md) => {
      let title = '';
      md = md.replace(/^\s*#\s+(.+?)\s*#*\s*(\n|$)/, (all, words) => { title = words; return ''; });
      content.innerHTML = (title ? '<h1>' + markdownToHtml(title).replace(/^<p>|<\/p>$/g, '') + '</h1>\n' : '') + markdownToHtml(md);
    })
    .catch((err) => console.warn('content.md could not be loaded (' + err.message + '); showing the text in index.html instead.'));
}

// The fill's colors are spread over the whole tube, so it needs the tube's height
new ResizeObserver(([entry]) => {
  fill.style.setProperty('--track-height', entry.contentRect.height + 'px');
}).observe(document.querySelector('.track'));

// What the thermometer is showing right now
let shownGoal = 10000;
let shownRaised = 0;
let countRun = 0;

function countUp(from, to, duration) {
  const run = ++countRun; // a newer count-up stops this one
  const start = performance.now();
  function frame(now) {
    if (run !== countRun) return;
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    raisedEl.textContent = money.format(Math.round(from + (to - from) * eased));
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return run;
}

// Fill the thermometer to an amount, gliding there or jumping straight there
function showRaised(raised, animate) {
  const pct = Math.min(raised / shownGoal, 1) * 100;
  const from = shownRaised;
  shownRaised = raised;
  thermometer.setAttribute('aria-valuenow', raised);
  thermometer.setAttribute('aria-valuetext', `${money.format(raised)} of ${money.format(shownGoal)}`);

  if (!animate) {
    countRun++;
    fill.style.transition = 'none';
    fill.style.height = `${pct}%`;
    raisedEl.textContent = money.format(raised);
    return;
  }
  fill.style.transition = '';
  const run = countUp(from, raised, setting('FILL_ANIMATION_MS', 1600));
  // Next frame so the height transition actually runs, unless something
  // newer (a drag in test mode) has already moved it on
  requestAnimationFrame(() => { if (run === countRun) fill.style.height = `${pct}%`; });
}

function drawScale(goal) {
  const step = setting('SCALE_STEP', 2500);
  scale.innerHTML = '';
  if (step <= 0) return;
  for (let amount = step; amount <= goal; amount += step) {
    const mark = document.createElement('div');
    mark.className = 'mark';
    mark.style.bottom = `${(amount / goal) * 100}%`;
    mark.innerHTML = `<span>${money.format(amount)}</span>`;
    scale.appendChild(mark);
  }
}

function render({ raised = 0, goal = setting('DEFAULT_GOAL', 10000), donors = 0 }) {
  shownGoal = goal;
  // RAISED_LABEL: the line under the amount; {goal} becomes the goal amount
  labelEl.textContent = String(setting('RAISED_LABEL', 'raised of {goal}')).split('{goal}').join(money.format(goal));
  thermometer.setAttribute('aria-valuemax', goal);
  if (donors > 0) donorsEl.textContent = `${donors} ${donors === 1 ? 'donor' : 'donors'}`;
  drawScale(goal);
  showRaised(raised, setting('ANIMATE_ON_LOAD', true));
  if (setting('TEST_MODE', false)) startTestMode();
}

// TEST_MODE: click or drag on the thermometer to try out different amounts.
// Only changes what this browser shows; the real total is untouched.
function startTestMode() {
  const track = document.querySelector('.track');
  thermometer.classList.add('testing');

  const amountAt = (y) => {
    const box = track.getBoundingClientRect();
    const pct = Math.min(Math.max((box.bottom - y) / box.height, 0), 1);
    const step = Math.max(1, setting('TEST_MODE_STEP', 50));
    return Math.min(Math.round((shownGoal * pct) / step) * step, shownGoal);
  };
  let dragging = false;
  thermometer.addEventListener('pointerdown', (e) => {
    dragging = true;
    thermometer.setPointerCapture(e.pointerId);
    showRaised(amountAt(e.clientY), true);
    e.preventDefault();
  });
  thermometer.addEventListener('pointermove', (e) => {
    if (dragging) showRaised(amountAt(e.clientY), false);
  });
  const stop = () => { dragging = false; };
  thermometer.addEventListener('pointerup', stop);
  thermometer.addEventListener('pointercancel', stop);
}

// Cache-bust: GitHub Pages caches files for ~10 minutes
const progress = fetch(`progress.json?t=${Date.now()}`)
  .then((res) => (res.ok ? res.json() : {}))
  .catch(() => ({}));

const contentReady = loadContent();
const settingsReady = loadSettings();

settingsReady.then(() => {
  loadFonts();
  applySettings();
  showDonateForm();
  return progress;
}).then(render);

// The route map needs both the page text (for where !map! is) and the settings
Promise.all([contentReady, settingsReady]).then(buildRouteMaps);
