//--- SCREENSAVER
// After 10 minutes with no touch, mouse, key or scroll activity, go to the
// /screensaver page (the flythrough). Based on tsl-3/screensaver.js.
// Skipped on /admin so plot edits aren't lost, and on the screensaver itself.
(function () {
  var timeBeforeRedirect = 10 * 60 * 1000; // 10 minutes in milliseconds
  var redirectUrl = '/screensaver';
  var SKIP_PATHS = [/^\/admin(\/|$)/, /^\/screensaver(\/|$)/];
  var inactivityTimer;

  if (SKIP_PATHS.some(function (re) { return re.test(window.location.pathname); })) return;

  function resetTimer() {
    clearTimeout(inactivityTimer);
    var targetHref;
    try {
      targetHref = new URL(redirectUrl, window.location.href).href;
    } catch (e) {
      targetHref = redirectUrl;
    }

    inactivityTimer = setTimeout(function () {
      if (window.location.href === targetHref) return;
      window.location.href = targetHref;
    }, timeBeforeRedirect);
  }

  // Events to detect activity
  var events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];

  // Reset the timer on any of these events
  events.forEach(function (event) {
    document.addEventListener(event, resetTimer, true);
  });

  // Start the timer
  resetTimer();
})();
