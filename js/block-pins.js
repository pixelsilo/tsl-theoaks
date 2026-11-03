//--- APARTMENT BLOCK PINS
// Turns the wide "Block 15-23" map pin into two status-coloured circles joined
// by a dash: (15)–(23). Colour comes from the pin's block-status attribute,
// bound in Webflow to the Apartment Block's Availability slug.
(() => {
  const PIN_SEL = '.pin.wide';
  const RANGE = /(\d+)\s*[-–]\s*(\d+)/;

  const circle = (n, status) =>
    `<span class="block-pin_circle"><span class="pin-text${status ? '' : ' pin-text_var1'}">${n}</span>` +
    `<span class="availability_dot ${status}"></span></span>`;

  const convert = (pin) => {
    const label = (pin.querySelector('.pin-text') || pin).textContent.trim();
    const m = label.match(RANGE);
    if (!m) return;

    const status = (pin.getAttribute('block-status') || '').toLowerCase().replace(/[^a-z0-9-]/g, '');

    pin.classList.remove('wide');
    pin.classList.add('block-pin');
    pin.setAttribute('aria-label', label);
    pin.innerHTML =
      circle(m[1], status) +
      `<span class="block-pin_dash"><span class="availability_dot ${status}"></span></span>` +
      circle(m[2], status);
  };

  // Converted pins lose .wide, so a rescan never touches them twice
  const scan = () => document.querySelectorAll(PIN_SEL).forEach(convert);

  // Convert the source pins now, before panzoom-map.js clones them onto the map
  scan();

  let scheduled = false;
  const scheduleScan = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      scan();
    });
  };

  const init = () => {
    scan();
    new MutationObserver(scheduleScan).observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
