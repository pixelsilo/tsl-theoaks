//--- AVAILABILITY FILTER
// 1. Sets the Finsweet availability filter to "Available" only when the page
//    loads (back/forward keeps the visitor's choice).
// 2. Applies the availability checkboxes to the apartment block list, which
//    Finsweet doesn't manage. A block shows when no availability box is ticked,
//    or when its block-status is one of the ticked values. Hidden blocks are
//    taken out of the list, so panzoom-map.js rebuilds the map pins without them.
(() => {
  const DEFAULT_STATUS = 'available';
  const BOX_SEL = 'input[fs-list-field="availability"]';
  const BLOCK_LIST_SEL = '[pin="list"]:not([fs-list-element])';
  const ITEM_SEL = '.plot_ci';

  const boxes = () => [...document.querySelectorAll(BOX_SEL)];
  const ticked = () =>
    boxes().filter((b) => b.checked).map((b) => (b.getAttribute('fs-list-value') || '').toLowerCase());

  // Block items keep their place via a comment marker while taken out of the list
  const blocks = [];
  const collectBlocks = () => {
    document.querySelectorAll(BLOCK_LIST_SEL).forEach((list) => {
      list.querySelectorAll(ITEM_SEL).forEach((item) => {
        if (blocks.some((b) => b.item === item)) return;
        const status = (item.querySelector('[block-status]')?.getAttribute('block-status') || '').toLowerCase();
        const marker = document.createComment('block-item');
        item.before(marker);
        blocks.push({ item, marker, status });
      });
    });
  };

  const syncBlocks = () => {
    collectBlocks();
    const on = ticked();
    blocks.forEach(({ item, marker, status }) => {
      const show = !on.length || on.includes(status);
      if (show && !item.isConnected) marker.after(item);
      if (!show && item.isConnected) item.remove();
    });
  };

  // A checkbox added through the Webflow API comes out as a native box (the
  // "custom" style can't be set there). Give it the same overlay markup as its
  // custom-styled siblings so it looks and behaves like them.
  const matchCustomCheckboxes = () => {
    boxes().forEach((input) => {
      const label = input.closest('label.w-checkbox');
      if (!label || label.querySelector('.w-checkbox-input--inputType-custom')) return;
      const sample = label.parentElement?.querySelector('.w-checkbox-input--inputType-custom');
      if (!sample) return;
      const overlay = document.createElement('div');
      overlay.className = sample.className.replace(/\bw--redirected-(checked|focus)\b/g, '').trim();
      input.before(overlay);
      input.className = '';
      input.style.cssText = 'opacity:0;position:absolute;z-index:-1';
      const sync = () => overlay.classList.toggle('w--redirected-checked', input.checked);
      input.addEventListener('change', sync);
      sync();
    });
  };

  // Every fresh load or reload starts on "Available" only, even if the URL
  // (fs-list-showquery) carries other availability values from earlier use.
  // Back/forward keeps whatever the visitor had chosen.
  const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  const keepChoice = !!nav && nav.type === 'back_forward';

  // Drop availability values from the URL before Finsweet reads them on init
  if (!keepChoice) {
    const url = new URL(location.href);
    const keys = [...url.searchParams.keys()].filter((k) => k.startsWith('availability'));
    if (keys.length) {
      keys.forEach((k) => url.searchParams.delete(k));
      history.replaceState(history.state, '', url);
    }
  }

  const tickDefault = () => {
    if (keepChoice) return;
    boxes().forEach((box) => {
      const want = (box.getAttribute('fs-list-value') || '').toLowerCase() === DEFAULT_STATUS;
      // Finsweet's custom checkboxes are driven by the label, so click it
      if (box.checked !== want) (box.closest('label') || box).click();
    });
  };

  const init = () => {
    if (!boxes().length) return;
    matchCustomCheckboxes();
    document.addEventListener('change', (e) => {
      if (e.target.matches && e.target.matches(BOX_SEL)) syncBlocks();
    });
    // "Clear all filters" unticks everything without a change event per box
    document.addEventListener('click', (e) => {
      if (e.target.closest && e.target.closest('[fs-list-element="clear"]')) setTimeout(syncBlocks, 50);
    });

    window.FinsweetAttributes = window.FinsweetAttributes || [];
    window.FinsweetAttributes.push([
      'list',
      () => {
        tickDefault();
        syncBlocks();
        // Finsweet can apply URL filters just after this callback, so check again
        setTimeout(() => {
          tickDefault();
          syncBlocks();
        }, 800);
      },
    ]);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
