//--- APARTMENT BLOCK PINS
// Turns the wide "Block 15-23" map pin into one status-coloured pill reading
// "15–23". Colour comes from the pin's block-status attribute, bound in
// Webflow to the Apartment Block's Availability slug.
(() => {
  const PIN_SEL = '.pin.wide';
  const RANGE = /(\d+)\s*[-–]\s*(\d+)/;

  const convert = (pin) => {
    const label = (pin.querySelector('.pin-text') || pin).textContent.trim();
    const m = label.match(RANGE);
    if (!m) return;

    const status = (pin.getAttribute('block-status') || '').toLowerCase().replace(/[^a-z0-9-]/g, '');

    pin.classList.remove('wide');
    pin.classList.add('block-pin');
    pin.setAttribute('aria-label', label);
    pin.innerHTML =
      `<span class="pin-text${status ? '' : ' pin-text_var1'}">${m[1]}–${m[2]}</span>` +
      `<span class="availability_dot ${status}"></span>`;
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
