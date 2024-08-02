(function () {
  console.log(window.devicePixelRatio)
  let scrollDistance = 0;
  let lastPosition = window.scrollY;

  // DPIからピクセルをメートルに変換
  function pixelsToMeters(pixels) {
    const ppi = 227 / window.devicePixelRatio // window.devicePixelRatio * 96; // 96 is the standard DPI for many screens
    const inches = pixels / ppi;
    const meters = inches * 0.0254; // 1 inch = 0.0254 meters
    console.log("This is 差分！！！！ : " + meters)
    return meters;

  }

  function updateScrollDistance() {
    const currentPosition = window.scrollY;
    const delta = Math.abs(currentPosition - lastPosition);
    scrollDistance += delta;
    lastPosition = currentPosition;
    chrome.storage.local.set({ scrollDistance: scrollDistance }, function () {
      console.log(`Scroll distance saved: ${scrollDistance}px (${pixelsToMeters(scrollDistance)} meters)`);
    });

    // メッセージを送信してポップアップを更新
    chrome.runtime.sendMessage({ scrollDistance: scrollDistance });
  }

  window.addEventListener('scroll', updateScrollDistance);

  chrome.storage.local.get('scrollDistance', function (data) {
    if (data.scrollDistance) {
      scrollDistance = data.scrollDistance;
      console.log(`Loaded saved scroll distance: ${scrollDistance}px (${pixelsToMeters(scrollDistance)} meters)`);
    }
  });
})();