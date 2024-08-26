let requestId = null;
let ppi = 96;
let DD = 30;
let factor = 1;

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

    let scrollMeters = 0;
    let lastPosition = window.scrollY;

    // PPI
    chrome.storage.local.get('devicePPI', function (data) {
        ppi = data.devicePPI || 96;
        if (ppi == 0) {
            alert('PPIが0に設定されています。再設定してください。')
            chrome.tabs.create({ url: "test.html" });
        }
    });

    chrome.storage.local.get('debounceDelay', function (data) {
        DD = data.debounceDelay || 30;
    });

    chrome.storage.local.get('factor', function (data) {
        factor = data.factor || 1;
    });

    // CSSピクセルを物理ピクセルにしてからメートルに変換する、だと信じてる
    function pixelsToMeters(pixels) {
        const inches = (pixels * window.devicePixelRatio) / ppi;
        const meters = inches * 0.0254;
        return meters;
    }

    function updateScrollDistance() {
        const currentPosition = window.scrollY
        // Retinaディスプレイの場合、魔法の7/8をかけることで精度が爆上がりするかも？？？<-Factorで対応
        const delta = Math.abs(currentPosition - lastPosition) * factor;
        scrollMeters += pixelsToMeters(delta);
        lastPosition = currentPosition;
        chrome.storage.local.set({ scrollMeters: scrollMeters }, function () {
            console.log(`Scroll distance saved: ${scrollMeters} meters`);
        });
        // popup.jsへ行きます
        chrome.runtime.sendMessage({ scrollMeters: scrollMeters })
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

    window.addEventListener('scroll', debounce(handleScroll, DD));

    chrome.storage.local.get('scrollMeters', function (data) {
        if (data.scrollMeters) {
            scrollMeters = data.scrollMeters;
            console.log(`Loaded saved distance: ${scrollMeters} meters`);
        }
    });
})();