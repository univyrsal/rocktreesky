// The animated route map. Put !map! on a line of its own in content.md to
// show it there; everything about the route is in the "Route map" section
// of settings.md. The route is drawn over the satellite picture, so
// positions are in that picture's pixels (2114 wide, 2030 tall), measured
// from its top left corner.
const MAP_IMAGE = 'images/California-Satellite-Map.jpg';
// White where the land is, black for the sea and the background, so they
// show the page's background color instead of the picture's white
const MAP_MASK = 'images/California-Satellite-Map-mask.png';
const MAP_W = 2114;
const MAP_H = 2030;
// Where the land is in the picture (the white of the mask); the empty
// strips around it are cropped off so the map shows as big as it can
const MAP_LAND = { x0: 233, y0: 17, x1: 1994, y1: 2022 };

// The map's two pictures, loaded and decoded before the map shows or starts
// drawing (index.html already started downloading them)
const mapPicturesReady = Promise.all([MAP_IMAGE, MAP_MASK].map((src) => {
  const img = new Image();
  img.src = src;
  return img.decode().catch(() => console.warn(`The route map couldn't load "${src}".`));
}));

let routeMapCount = 0;

function buildRouteMaps() {
  document.querySelectorAll('.route-map-slot').forEach(buildRouteMap);
}

function buildRouteMap(slot) {
  const id = 'rm' + ++routeMapCount;
  // The part of the picture shown (set below, once the detail box is known)
  let view = { x: 0, y: 0, w: MAP_W, h: MAP_H };
  const pct = (x, y) => `left:${((x - view.x) / view.w) * 100}%;top:${((y - view.y) / view.h) * 100}%`;
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // ROUTE: ["Name", x, y, "side"] is a stop, [x, y] a bend in the road.
  // The first stop is the start; the others are numbered.
  const points = [];
  const stops = [];
  for (const entry of setting('ROUTE', [])) {
    if (!Array.isArray(entry)) continue;
    const named = typeof entry[0] === 'string';
    const [x, y] = (named ? entry.slice(1, 3) : entry.slice(0, 2)).map(Number);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    points.push({ x, y });
    if (named) stops.push({ name: entry[0], x, y, side: entry[3] || 'right', at: points.length - 1 });
  }
  if (points.length < 2) {
    slot.textContent = 'The route map needs at least two positions in ROUTE in settings.md.';
    return;
  }
  stops.forEach((stop, i) => { stop.start = i === 0; stop.number = i; });

  // How far along the line each point is, 0 at the start to 1 at the end
  const along = [0];
  for (let i = 1; i < points.length; i++) {
    along.push(along[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
  }
  const total = along[along.length - 1] || 1;
  stops.forEach((stop) => { stop.reached = along[stop.at] / total; });
  const line = points.map((p) => `${p.x},${p.y}`).join(' ');

  // MAP_DETAIL: a zoomed-in copy of one area, shown in a box elsewhere on the map
  const d = setting('MAP_DETAIL', null);
  let detail = null;
  if (d && Array.isArray(d.area) && d.area.length === 2 && Array.isArray(d.at) && d.width > 0) {
    const [[ax0, ay0], [ax1, ay1]] = d.area;
    const area = { x: Math.min(ax0, ax1), y: Math.min(ay0, ay1), w: Math.abs(ax1 - ax0), h: Math.abs(ay1 - ay0) };
    if (area.w > 0 && area.h > 0) {
      const zoom = d.width / area.w;
      detail = { area, zoom, x: d.at[0], y: d.at[1], w: d.width, h: area.h * zoom, title: d.title || '' };
    }
  }
  // Shown: the land, the detail box and the route, with a little room around
  {
    const xs = [MAP_LAND.x0, MAP_LAND.x1, ...points.map((p) => p.x)];
    const ys = [MAP_LAND.y0, MAP_LAND.y1, ...points.map((p) => p.y)];
    if (detail) { xs.push(detail.x, detail.x + detail.w); ys.push(detail.y, detail.y + detail.h); }
    const pad = 24;
    const x0 = Math.max(0, Math.min(...xs) - pad), x1 = Math.min(MAP_W, Math.max(...xs) + pad);
    const y0 = Math.max(0, Math.min(...ys) - pad), y1 = Math.min(MAP_H, Math.max(...ys) + pad);
    view = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }
  const inArea = (p) => detail && p.x >= detail.area.x && p.x <= detail.area.x + detail.area.w && p.y >= detail.area.y && p.y <= detail.area.y + detail.area.h;
  const toBox = (p) => ({ x: detail.x + (p.x - detail.area.x) * detail.zoom, y: detail.y + (p.y - detail.area.y) * detail.zoom });

  // The picture and the line. The detail box shows the same picture and
  // line again, zoomed in, so they always match.
  const routeLines = `<polyline class="rm-casing" points="${line}"/><polyline class="rm-line" points="${line}"/>`;
  let detailSvg = '';
  let detailLines = '';
  if (detail) {
    const { area } = detail;
    // The box appears once the whole route is drawn, growing out of the
    // area it zooms in on: --from shrinks it back down onto that area
    const s = 1 / detail.zoom;
    const from = `translate(${area.x - detail.x * s}px, ${area.y - detail.y * s}px) scale(${s})`;
    const zoomed = (inside) => `<svg class="rm-zoomed" x="${detail.x}" y="${detail.y}" width="${detail.w}" height="${detail.h}" viewBox="${area.x} ${area.y} ${area.w} ${area.h}">${inside}</svg>`;
    detailSvg = `
      <g class="rm-detail">
        <rect class="rm-area" x="${area.x}" y="${area.y}" width="${area.w}" height="${area.h}"/>
        <line class="rm-link" x1="${area.x + area.w}" y1="${area.y}" x2="${detail.x}" y2="${detail.y}"/>
        <line class="rm-link" x1="${area.x + area.w}" y1="${area.y + area.h}" x2="${detail.x}" y2="${detail.y + detail.h}"/>
        <g class="rm-box" style="--from: ${from}">
          ${zoomed(`<use href="#${id}-base"/>`)}
          <rect class="rm-frame" x="${detail.x}" y="${detail.y}" width="${detail.w}" height="${detail.h}"/>
        </g>
      </g>`;
    detailLines = `
      <g class="rm-detail">
        <g class="rm-box" style="--from: ${from}">${zoomed(routeLines)}</g>
      </g>`;
  }

  // Stops: a numbered marker with its name. One inside the detail area gets
  // its marker and name in the box, and a small dot on the main map.
  const marker = (stop, p, cls) => `
    <div class="rm-stop ${cls}${stop.start ? ' rm-start' : ''}" data-reached="${stop.reached}" data-side="${esc(stop.side)}" style="${pct(p.x, p.y)}">
      <span class="rm-dot">${stop.start ? '' : stop.number}</span>${cls === 'rm-small' ? '' : `<span class="rm-label">${esc(stop.name)}</span>`}
    </div>`;
  const marks = stops.map((stop) => (inArea(stop)
    ? marker(stop, stop, 'rm-small') + marker(stop, toBox(stop), 'rm-in-box')
    : marker(stop, stop, ''))).join('');

  const title = setting('ROUTE_TITLE', '');
  const note = setting('ROUTE_NOTE', '');
  const legendAt = setting('MAP_LEGEND_AT', []);
  const numbered = stops.filter((s) => !s.start);
  const legend = setting('SHOW_MAP_KEY', true) && (title || numbered.length || note) ? `
    <div class="rm-legend${Array.isArray(legendAt) && legendAt.length === 2 ? '' : ' rm-below'}" style="${Array.isArray(legendAt) && legendAt.length === 2 ? pct(legendAt[0], legendAt[1]) : ''}">
      ${title ? `<p class="rm-legend-title">${esc(title)}</p>` : ''}
      ${numbered.length ? `<ol>${numbered.map((s) => `<li><span class="rm-dot">${s.number}</span>${esc(s.name)}</li>`).join('')}</ol>` : ''}
      ${note ? `<p class="rm-note"><span class="rm-swatch"></span>${esc(note)}</p>` : ''}
    </div>` : '';

  const figure = document.createElement('figure');
  figure.className = 'route-map' + (slot.classList.contains('banner') ? ' banner' : '');
  figure.style.setProperty('--route-color', setting('ROUTE_COLOR', '#FDC500'));
  figure.style.setProperty('--stop-color', setting('STOP_COLOR', '#DC283C'));
  figure.style.setProperty('--start-color', setting('START_COLOR', '#1E78FF'));
  figure.innerHTML = `
    <div class="rm-stage" style="aspect-ratio: ${view.w} / ${view.h}">
      <!-- Two layers: the picture, which stays still, and the route on top,
           which is redrawn while it draws, without redrawing the picture -->
      <svg class="rm-base" viewBox="${view.x} ${view.y} ${view.w} ${view.h}" role="img" aria-label="Map of the route: ${esc(stops.map((s) => s.name).join(', then '))}">
        <defs>
          <mask id="${id}-land" maskUnits="userSpaceOnUse" x="0" y="0" width="${MAP_W}" height="${MAP_H}">
            <image href="${MAP_MASK}" width="${MAP_W}" height="${MAP_H}"/>
          </mask>
          <g id="${id}-base"><image href="${MAP_IMAGE}" width="${MAP_W}" height="${MAP_H}" mask="url(#${id}-land)"/></g>
        </defs>
        <use href="#${id}-base"/>
        ${detailSvg}
      </svg>
      <svg class="rm-route" viewBox="${view.x} ${view.y} ${view.w} ${view.h}" aria-hidden="true">
        ${routeLines}
        ${detailLines}
      </svg>
      <div class="rm-marks" aria-hidden="true">${marks}</div>
      ${detail && detail.title ? `<p class="rm-detail-title" style="${pct(detail.x + detail.w + 24, detail.y + 16)}">${esc(detail.title)}</p>` : ''}
    </div>
    ${legend}`;
  slot.replaceWith(figure);

  // The line's thickness is set in screen pixels, so it stays the same
  // whatever size the map is shown at (and in the zoomed box too)
  const svg = figure.querySelector('.rm-route');
  const widthPx = Math.max(1, setting('ROUTE_WIDTH', 4));
  new ResizeObserver(([entry]) => {
    const perPx = view.w / Math.max(1, entry.contentRect.width);
    svg.querySelectorAll(':scope > .rm-line, :scope > .rm-casing').forEach((el) => {
      el.style.strokeWidth = (el.classList.contains('rm-casing') ? widthPx + 2 : widthPx) * perPx;
    });
    if (detail) svg.querySelectorAll('.rm-zoomed .rm-line, .rm-zoomed .rm-casing').forEach((el) => {
      el.style.strokeWidth = ((el.classList.contains('rm-casing') ? widthPx + 2 : widthPx) * perPx) / detail.zoom;
    });
  }).observe(figure);

  // Drawing the route: the line grows from the start, and each stop pops
  // up as the line reaches it
  const lines = [...svg.querySelectorAll('.rm-line, .rm-casing')];
  const stopEls = [...figure.querySelectorAll('.rm-stop')];
  lines.forEach((el) => { el.style.strokeDasharray = total; });
  function drawTo(progress) {
    lines.forEach((el) => { el.style.strokeDashoffset = total * (1 - progress); });
    stopEls.forEach((el) => el.classList.toggle('shown', progress >= Number(el.dataset.reached) - 0.0001));
    figure.classList.toggle('rm-detail-shown', progress >= 1);
  }

  // Hidden until its pictures are ready, then it fades in, and only then
  // can the line start drawing
  figure.classList.add('rm-loading');
  const shown = mapPicturesReady.then(() => new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      figure.classList.remove('rm-loading');
      resolve();
    }));
  }));

  if (!setting('ROUTE_ANIMATION', true)) {
    drawTo(1);
  } else {
    drawTo(0);
    const duration = Math.max(1, setting('ROUTE_DRAW_MS', 4000));
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const play = () => {
      const start = performance.now();
      const frame = (now) => {
        const t = Math.min((now - start) / duration, 1);
        drawTo(ease(t));
        if (t < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };
    // Starts once most of the map has scrolled into view
    const seen = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { seen.disconnect(); play(); }
    }, { threshold: 0.4 });
    shown.then(() => seen.observe(figure.querySelector('.rm-stage')));
  }

  if (setting('MAP_EDIT_MODE', false)) startMapEditMode(figure, detail, view);
}

// MAP_EDIT_MODE: click the map to get positions for ROUTE and MAP_DETAIL.
// A click in the detail box gives that spot's position on the main map.
function startMapEditMode(figure, detail, view) {
  const stage = figure.querySelector('.rm-stage');
  figure.classList.add('rm-editing');
  const panel = document.createElement('div');
  panel.className = 'rm-edit';
  panel.innerHTML = `
    <p><strong>Map edit mode</strong> (MAP_EDIT_MODE in settings.md). Click the map to get a position; each click is added below and copied. Clicks in the detail box give the spot's position on the main map.</p>
    <p class="rm-edit-now">Pointer: </p>
    <textarea rows="4" readonly></textarea>
    <button type="button">Clear</button>`;
  figure.appendChild(panel);
  const now = panel.querySelector('.rm-edit-now');
  const list = panel.querySelector('textarea');
  panel.querySelector('button').addEventListener('click', () => { list.value = ''; });

  const mapPoint = (e) => {
    const box = stage.getBoundingClientRect();
    let x = view.x + ((e.clientX - box.left) / box.width) * view.w;
    let y = view.y + ((e.clientY - box.top) / box.height) * view.h;
    if (detail && x >= detail.x && x <= detail.x + detail.w && y >= detail.y && y <= detail.y + detail.h) {
      x = detail.area.x + (x - detail.x) / detail.zoom;
      y = detail.area.y + (y - detail.y) / detail.zoom;
    }
    return `[${Math.round(x)}, ${Math.round(y)}]`;
  };
  stage.addEventListener('pointermove', (e) => { now.textContent = 'Pointer: ' + mapPoint(e); });
  stage.addEventListener('click', (e) => {
    const point = mapPoint(e);
    list.value += (list.value ? ', ' : '') + point;
    list.scrollTop = list.scrollHeight;
    if (navigator.clipboard) navigator.clipboard.writeText(point).catch(() => {});
    now.textContent = 'Copied ' + point;
  });
}
