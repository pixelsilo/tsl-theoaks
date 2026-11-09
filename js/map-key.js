//--- SITE PLAN STATUS KEY
// Adds a small key to the corner of each plan map (.map) explaining the pin
// colours (Available / Reserved / Exchanged / Sold). Runs on every page, so it
// covers the Development Overview site plan and the apartment block plans.
// It sits on .map, outside the pan/zoom container, so it stays put and the same
// size while the plan zooms. Swatches reuse Webflow's own `availability_dot
// <status>` classes, so the key always matches the pin colours set in Webflow.
// Only statuses that appear on that map's pins are listed, in the order below,
// and the key only shows once the map has a plan image (the apartment blocks
// have no level plan yet, so their maps are blank).
(() => {
  const MAP_SEL = '.map';
  const DOT_SEL = '.map-pin .availability_dot';
  const ORDER = ['available', 'reserved', 'exchanged', 'sold'];
  const LABELS = { available: 'Available', reserved: 'Reserved', exchanged: 'Exchanged', sold: 'Sold' };
  const SKIP = ['hidden'];

  const statusOf = (dot) =>
    [...dot.classList].find((c) => c !== 'availability_dot' && !c.startsWith('w-'));

  const label = (s) => LABELS[s] || s.replace(/[-_]+/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

  // The plan is either an <img> or a CSS background image inside the map
  const hasPlan = (map) => {
    if ([...map.querySelectorAll('img')].some((i) => i.currentSrc || i.src)) return true;
    return [...map.querySelectorAll('*')].some(
      (e) => !e.closest('.map-key, .map-pin') && getComputedStyle(e).backgroundImage.includes('url(')
    );
  };

  const renderMap = (map) => {
    const found = new Set();
    map.querySelectorAll(DOT_SEL).forEach((d) => {
      const s = statusOf(d);
      if (s && !SKIP.includes(s)) found.add(s);
    });

    const statuses = [
      ...ORDER.filter((s) => found.has(s)),
      ...[...found].filter((s) => !ORDER.includes(s)).sort(),
    ];
    const sig = statuses.length && hasPlan(map) ? statuses.join(',') : '';

    let key = map.querySelector(':scope > .map-key');
    if (!sig) {
      if (key) key.remove();
      return;
    }
    if (key && key.dataset.statuses === sig) return;
    if (!key) {
      key = document.createElement('div');
      key.className = 'map-key';
      key.setAttribute('role', 'group');
      key.setAttribute('aria-label', 'Plot status key');
      map.appendChild(key);
    }
    key.dataset.statuses = sig;
    key.innerHTML =
      `<div class="map-key_title">Key</div>` +
      `<ul class="map-key_list">` +
      statuses
        .map(
          (s) =>
            `<li class="map-key_item">` +
            `<span class="map-key_swatch"><span class="availability_dot ${s}"></span></span>` +
            `<span class="map-key_label">${label(s)}</span></li>`
        )
        .join('') +
      `</ul>`;
  };

  const render = () => document.querySelectorAll(MAP_SEL).forEach(renderMap);

  // Pins are (re)built by panzoom-map.js after the CMS lists load, so watch for
  // them. Ignore our own changes to the key so we don't loop.
  let scheduled = false;
  const schedule = (records) => {
    if (records && records.every((r) => r.target.closest && r.target.closest('.map-key'))) return;
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      render();
    });
  };

  const init = () => {
    render();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    window.addEventListener('load', () => schedule());
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
