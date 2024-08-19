let requestId = null;

function debounce(func, delay) {
  let timeoutId;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

(function () {
  // 1cssピクセルが実際は何物理ピクセルか
  console.log(window.devicePixelRatio)

  let scrollDistance = 0;
  let lastPosition = window.scrollY;

  // ここはユーザに設定してもらうものとする(default = 96)
  const ppi = 227
  // let ppi = 96

  function pixelsToMeters(pixels) {
    const inches = (pixels * window.devicePixelRatio) / ppi;
    const meters = inches * 0.0254;
    return meters;
  }

  function updateScrollDistance() {
    const currentPosition = window.scrollY
    const delta = Math.abs(currentPosition - lastPosition);
    scrollDistance += delta;
    lastPosition = currentPosition;
    chrome.storage.local.set({ scrollDistance: scrollDistance }, function () {
      console.log(`Scroll distance saved: ${scrollDistance}px (${pixelsToMeters(scrollDistance)} meters)`);
    });
    chrome.runtime.sendMessage({ scrollDistance: scrollDistance })
      .catch(e => {
      });
    requestId = null;
  }

  function handleScroll() {
    if (!requestId) {
      requestId = requestAnimationFrame(updateScrollDistance);
    }
  }

  window.addEventListener('scroll', debounce(handleScroll, 30));

  chrome.storage.local.get('scrollDistance', function (data) {
    if (data.scrollDistance) {
      scrollDistance = data.scrollDistance;
      console.log(`Loaded saved scroll distance: ${scrollDistance}px (${pixelsToMeters(scrollDistance)} meters)`);
    }
  });
})();