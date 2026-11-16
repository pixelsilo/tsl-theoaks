//--- AVAILABILITY FILTER
// 1. Ticks "Available" in the Finsweet filters when the page loads, unless the
//    URL already carries an availability filter (fs-list-showquery).
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

  const tickDefault = () => {
    const urlHasFilter = [...new URLSearchParams(location.search).keys()].some((k) => k.startsWith('availability'));
    if (urlHasFilter || ticked().length) return;
    const box = boxes().find((b) => (b.getAttribute('fs-list-value') || '').toLowerCase() === DEFAULT_STATUS);
    if (!box) return;
    // Finsweet's custom checkboxes are driven by the label, so click it
    (box.closest('label') || box).click();
  };

  const init = () => {
    if (!boxes().length) return;
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
      },
    ]);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
