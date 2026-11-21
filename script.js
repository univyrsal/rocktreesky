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
  const bold = setting('BOLD_WEIGHT', 900);
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
  for (const want of [heading, body, { family: body.family, weight: bold },
    { family: fallback, weight: heading.weight }, { family: fallback, weight: body.weight }, { family: fallback, weight: bold }]) {
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
  root.style.setProperty('--bold-weight', bold);

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

const root = document.documentElement;

function applySettings() {
  root.style.setProperty('--accent', setting('ACCENT_COLOR', '#6ABF4B'));
  root.style.setProperty('--bg', setting('BACKGROUND_COLOR', '#F6F3EE'));
  root.style.setProperty('--text', setting('TEXT_COLOR', '#22302B'));
  // The bar behind the title: "" = no bar, just the page's background
  const barColor = setting('TITLE_BAR_COLOR', '').trim();
  const barText = setting('TITLE_BAR_TEXT_COLOR', '').trim();
  if (barColor) root.style.setProperty('--title-bar-color', barColor);
  if (barText) root.style.setProperty('--title-bar-text', barText);
  root.style.setProperty('--title-bar-radius', Math.max(0, setting('TITLE_BAR_RADIUS', 20)) + 'px');
  root.style.setProperty('--logo-height', Math.max(16, setting('LOGO_HEIGHT', 72)) + 'px');
  root.style.setProperty('--form-height', Math.max(400, setting('FORM_HEIGHT', 720)) + 'px');
  root.style.setProperty('--form-width', Math.max(280, setting('FORM_WIDTH', 480)) + 'px');
  root.style.setProperty('--top-text-width', Math.max(120, setting('TOP_TEXT_WIDTH', 300)) + 'px');

  // The page's layout
  root.style.setProperty('--page-width', Math.max(600, setting('PAGE_WIDTH', 1600)) + 'px');
  root.style.setProperty('--text-size', Math.max(10, setting('TEXT_SIZE', 17)) + 'px');
  root.style.setProperty('--title-size', Math.max(16, setting('TITLE_SIZE', 56)) + 'px');
  // CENTERED_TEXT: text sections centered, by file name ("beside-form.md")
  const sectionName = (n) => String(n).replace(/^.*\//, '').replace(/\.md$/i, '').toLowerCase();
  const centered = setting('CENTERED_TEXT', []).map(sectionName);
  document.querySelectorAll('[data-md]').forEach((el) => {
    el.classList.toggle('centered-section', centered.includes(sectionName(el.dataset.md)));
  });
  root.style.setProperty('--side-space', Math.max(0, setting('PAGE_SIDE_SPACE', 96)) + 'px');
  root.classList.toggle('no-scrollbar', setting('HIDE_SCROLLBAR', true));
  root.style.setProperty('--row-gap', Math.max(0, setting('ROW_GAP', 96)) + 'px');
  root.style.setProperty('--column-gap', Math.max(0, setting('COLUMN_GAP', 64)) + 'px');
  root.style.setProperty('--section-padding', Math.max(0, setting('SECTION_PADDING', 64)) + 'px');
  root.style.setProperty('--section-title-size', Math.max(12, setting('SECTION_TITLE_SIZE', 36)) + 'px');
  // 0 = the picture's own shape
  const sectionPictureHeight = Math.max(0, setting('SECTION_PICTURE_HEIGHT', 480));
  root.style.setProperty('--section-picture-height', sectionPictureHeight > 0 ? sectionPictureHeight + 'px' : 'auto');
  showSections();

  // The rounded boxes: the quotes (QUOTES), TEXT_CARDS and MAP_CARD
  const boxColor = setting('BOX_COLOR', '#EDEBD5').trim();
  root.style.setProperty('--box-color', boxColor.toLowerCase() === 'accent' ? 'var(--accent)' : boxColor);
  root.style.setProperty('--box-gap', Math.max(0, setting('BOX_GAP', 64)) + 'px');
  const cards = setting('TEXT_CARDS', []).map(sectionName);
  document.querySelectorAll('[data-md]').forEach((el) => {
    el.classList.toggle('text-card', cards.includes(sectionName(el.dataset.md)));
  });
  document.querySelector('.map-col')?.classList.toggle('map-card', setting('MAP_CARD', false));

  root.style.setProperty('--picture-width', Math.max(20, setting('PICTURE_WIDTH', 720)) + 'px');
  // 0 = as tall as the picture works out; any other number sets the height.
  const pictureHeight = Math.max(0, setting('PICTURE_HEIGHT', 0));
  root.style.setProperty('--picture-height', pictureHeight + 'px');
  document.querySelectorAll('.content').forEach((el) => el.classList.toggle('set-picture-height', pictureHeight > 0));
  root.style.setProperty('--picture-radius', Math.max(0, setting('PICTURE_CORNER_RADIUS', 12)) + 'px');
  // {banner} pictures: 0 = their own shape; any other number crops them to that height
  const bannerHeight = Math.max(0, setting('BANNER_HEIGHT', 0));
  root.style.setProperty('--banner-height', bannerHeight > 0 ? bannerHeight + 'px' : 'auto');
}

// SECTIONS: each row's color ("accent" = ACCENT_COLOR), title, and a
// picture under the title
function showSections() {
  const sections = setting('SECTIONS', {});
  document.querySelectorAll('.row[data-section]').forEach((row) => {
    const { color = '', title = '', picture = '', pictureWords = '' } = sections[row.dataset.section] || {};
    const c = String(color).trim();
    row.classList.toggle('colored', !!c);
    row.style.setProperty('--section-color', c.toLowerCase() === 'accent' ? 'var(--accent)' : c);
    row.querySelectorAll(':scope > .section-title, :scope > .section-picture').forEach((el) => el.remove());
    const t = String(title).trim();
    const file = String(picture).trim();
    if (file) {
      const img = document.createElement('img');
      img.className = 'section-picture';
      img.loading = 'lazy';   // not until it's nearly on screen, so the map loads first
      img.src = file;
      img.alt = String(pictureWords);
      img.addEventListener('error', () => console.warn(`SECTIONS in settings.md: couldn't load the picture "${file}". Check the file is in the images folder and the name matches.`));
      row.prepend(img);
    }
    if (t) {
      const h = document.createElement('h2');
      h.className = 'section-title';
      h.textContent = t;
      row.prepend(h);
    }
    // In the top row on a mid-size screen, the form starts below these
    row.style.setProperty('--form-row', 1 + !!t + !!file);
  });
}

// The Givebutter donation widget (settings.md: GIVEBUTTER_ACCOUNT and
// GIVEBUTTER_WIDGET). Givebutter's script turns each <givebutter-widget>
// tag into the form.
function showDonateForm() {
  const account = setting('GIVEBUTTER_ACCOUNT', '').trim();
  // One widget or a list of them, top to bottom. Each is its ID, or the
  // whole <givebutter-widget id="..."> tag pasted in.
  const raw = window.GIVEBUTTER_WIDGET;
  const pasted = (Array.isArray(raw) ? raw : [raw]).filter((w) => typeof w === 'string' && w.trim()).map((w) => w.trim());
  const widgets = pasted.map((w) => (w.match(/id\s*=\s*["']?([\w-]+)/i) || [])[1] || (/^[\w-]+$/.test(w) ? w : '')).filter(Boolean);
  if (pasted.length > widgets.length) console.warn('GIVEBUTTER_WIDGET in settings.md: each one should be a widget\'s ID or its <givebutter-widget id="..."> tag; skipping the ones that aren\'t.');
  if (!account || !widgets.length) {
    // FORM_PLACEHOLDER: the words in the box until there's a form
    const words = setting('FORM_PLACEHOLDER', 'Donation form goes here');
    document.querySelectorAll('.form-placeholder').forEach((box) => { box.textContent = words; });
    return;
  }
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://widgets.givebutter.com/latest.umd.cjs?acct=' + encodeURIComponent(account) + '&p=other';
  document.head.appendChild(script);

  document.querySelectorAll('.donate').forEach((spot) => {
    spot.replaceChildren(...widgets.map((id) => {
      const tag = document.createElement('givebutter-widget');
      tag.id = id;
      return tag;
    }));
    spot.classList.add('has-widget');
  });
}

// LOGO_IMAGE: the logo at the left of the title bar, a link to LOGO_LINK
function showLogo() {
  const file = setting('LOGO_IMAGE', '').trim();
  if (!file) return;
  const logo = document.querySelector('.logo');
  const link = setting('LOGO_LINK', '').trim();
  if (link) logo.href = link;
  else logo.removeAttribute('href');
  const img = document.createElement('img');
  img.src = file;
  img.alt = setting('LOGO_WORDS', '');
  img.addEventListener('error', () => console.warn(`LOGO_IMAGE in settings.md: couldn't load "${file}". Check the file is in the images folder and the name matches.`));
  logo.replaceChildren(img);
  logo.hidden = false;
  // LOGO_TEXT_COLOR / LOGO_BLACK: the logo in one solid color (the filter is in index.html)
  const tint = setting('LOGO_TEXT_COLOR', false) ? getComputedStyle(document.querySelector('.top-bar')).color
    : setting('LOGO_BLACK', false) ? '#000' : '';
  if (tint) document.querySelector('.logo-tint-color').setAttribute('flood-color', tint);
  logo.classList.toggle('tinted', !!tint);
  // Room either side of the title for the logo, so the title stays in the middle
  new ResizeObserver(() => {
    root.style.setProperty('--logo-space', img.offsetWidth ? img.offsetWidth + 16 + 'px' : '0px');
  }).observe(img);
}

// The text sections: each one's words come from the file named in its
// data-md (the text folder), through markdownToHtml (markdown.js). In the
// title's file, a # heading on the first line is the page's big title.
function loadContent(sections) {
  return Promise.all(sections.map((section) =>
    fetch(section.dataset.md, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error('HTTP ' + r.status))))
      .then((md) => {
        let title = '';
        if (section.classList.contains('title-block')) {
          // The title is the first line (starting with #) and every line
          // right under it, up to the first empty line; each is its own
          // line of the title. A # in front of the later lines is optional.
          const lines = md.replace(/\r\n?/g, '\n').replace(/^\s*\n/, '').split('\n');
          if (/^#\s+/.test(lines[0] || '')) {
            let end = 0;
            while (end < lines.length && lines[end].trim()) end++;
            title = lines.slice(0, end)
              .map((line) => markdownToHtml(line.replace(/^#*\s*/, '').replace(/\s*#*\s*$/, '')).replace(/^<p>|<\/p>\s*$/g, ''))
              .filter(Boolean).join('<br>');
            md = lines.slice(end).join('\n');
          }
        }
        section.innerHTML = (title ? '<h1>' + title + '</h1>\n' : '') + markdownToHtml(md);
      })
      .catch((err) => console.warn(section.dataset.md + ' could not be loaded (' + err.message + ').'))));
}

// QUOTES: a rounded box for each student's quote (a file in text/quotes),
// in the left or right column or in the middle under both
function placeQuotes() {
  const quotes = setting('QUOTES', {});
  const animate = setting('BOX_ANIMATION', true);
  const phone = matchMedia('(max-width: 900px)').matches;   // one column: they take turns
  const made = [];
  for (const [side, spot] of [['left', '.quote-col[data-side="left"]'], ['right', '.quote-col[data-side="right"]'], ['middle', '.quote-middle']]) {
    const names = Array.isArray(quotes[side]) ? quotes[side] : [];
    for (const name of names) {
      const file = String(name).trim().replace(/^.*\//, '').replace(/\.md$/i, '');
      if (!file) continue;
      const box = document.createElement('div');
      box.className = 'content text-box';
      box.dataset.md = 'text/quotes/' + file + '.md';
      box.dataset.side = side;
      // Out of place from the start (so they never visibly slide away first):
      // the left column's from the left, the right's from the right, the
      // middle ones from below
      if (animate) {
        const slide = phone ? (made.length % 2 ? 1 : -1) : { left: -1, right: 1 }[side] || 0;
        box.style.setProperty('--slide', slide);
        box.style.setProperty('--rise', slide ? 0 : 1);
        box.classList.add('waiting');
      }
      document.querySelector(spot).appendChild(box);
      made.push(box);
    }
  }
  return made;
}

// The quote boxes slide into place as they scroll into view
function slideInBoxes() {
  root.style.setProperty('--box-slide-ms', Math.max(0, setting('BOX_ANIMATION_MS', 700)) + 'ms');
  const boxes = [...document.querySelectorAll('.quotes .text-box.waiting')];
  if (!boxes.length) return;
  const watch = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.remove('waiting');
      watch.unobserve(e.target);
    });
  }, {
    // BOX_START: a box starts sliding in once its top is this far up the
    // screen (percent of the screen's height, from the bottom)
    rootMargin: `0px 0px -${Math.min(90, Math.max(0, setting('BOX_START', 25)))}% 0px`,
  });
  boxes.forEach((box) => watch.observe(box));
}

const settingsReady = loadSettings();
const pageText = loadContent([...document.querySelectorAll('[data-md]')]);

// The quotes are placed from the settings, then filled in like the other text
const quotesText = settingsReady.then(() => {
  const quotes = placeQuotes();
  loadFonts();
  applySettings();
  showDonateForm();
  showLogo();
  return loadContent(quotes);
});
const contentReady = Promise.all([pageText, quotesText]);

// The route map needs the settings and the page text (for where !map! is),
// but not the quotes
Promise.all([pageText, settingsReady]).then(buildRouteMaps);
Promise.all([contentReady, settingsReady]).then(slideInBoxes);
