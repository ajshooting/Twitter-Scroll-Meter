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

// 全面的に処理変えなきゃー
// うわーーーー

(function () {
    // 1cssピクセルが実際は何物理ピクセルか
    console.log(window.devicePixelRatio)

    let scrollMeters = 0;
    let lastPosition = window.scrollY;

    // ここはユーザに設定してもらうものとする(default = 96)
    const ppi = 227

    // CSSピクセルを物理ピクセルにしてからメートルに変換する、だと信じてる
    function pixelsToMeters(pixels) {
        const inches = (pixels * window.devicePixelRatio) / ppi;
        const meters = inches * 0.0254;
        return meters;
    }

    function updateScrollDistance() {
        const currentPosition = window.scrollY
        //　魔法の7/8をかけることで精度が爆上がりする
        const delta = Math.abs(currentPosition - lastPosition) * (7 / 8); 
        scrollMeters += pixelsToMeters(delta);
        lastPosition = currentPosition;
        chrome.storage.local.set({ scrollDistance: scrollMeters }, function () {
            console.log(`Scroll distance saved: ${scrollMeters} meters`);
        });
        // popup.jsへ行きます
        chrome.runtime.sendMessage({ scrollDistance: scrollMeters })
            .catch(e => {
            });
        requestId = null;
    }

    // これ！
    function handleScroll() {
        if (!requestId) {
            requestId = requestAnimationFrame(updateScrollDistance);
        }
    }

    window.addEventListener('scroll', debounce(handleScroll, 100));

    chrome.storage.local.get('scrollDistance', function (data) {
        if (data.scrollDistance) {
            scrollMeters = data.scrollDistance;
            console.log(`Loaded saved distance: ${scrollMeters} meters`);
        }
    });
})();