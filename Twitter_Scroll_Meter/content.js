// やることメモ
// 
// ->history
// 0保存回避
// ひゅんって戻った時のために閾値で
// 再読み込み検知してURL遷移時と同じような処理
// settingsからcontentにsendする
// PPI は別ページで設定させるようにする！

let requestId = null;
let ppi = 96;
let DD = 30;
let factor = 1;
let scrollDistance = 0;
let useUnit = "meters"
let measureType = "both"
let lastPosition = 0;

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

// CSSピクセルを物理ピクセルにしてからメートルに変換する
// function pixelsToMeters(pixels) {
//     const inches = (pixels * window.devicePixelRatio) / ppi;
//     return inches * 0.0254;
// }

// 読み込む
async function loadSettings() {
    const data = await chrome.storage.local.get(['devicePPI', 'debounceDelay', 'factor', 'scrollDistance', 'measureType', 'useUnit']);
    ppi = data.devicePPI || 96;
    DD = (data.debounceDelay !== undefined) ? data.debounceDelay : 30;
    factor = data.factor || 1;
    useUnit = data.useUnit || 'meters'
    measureType = data.measureType || 'both';
    scrollDistance = data.scrollDistance || 0;

    if (ppi == 0) {
        alert('PPIが0に設定されています。再設定してください。')
        chrome.tabs.create({ url: "setting.html" });
    } else {
        console.log(`Loaded settings: PPI=${ppi}, debounceDelay=${DD}, factor=${factor},useUnit=${useUnit},measureType=${measureType} scrollDistance=${scrollDistance}`);
    }
}

// スクロール距離の保存
async function saveScrollDistance(scrollDistance) {
    if (!chrome.storage || !chrome.storage.local) { return false; }
    try {
        await chrome.storage.local.set({ scrollDistance });
        // console.log(`Scroll distance saved: ${scrollDistance} Physics Pixels`);
    } catch (error) {
        console.log('Failed to save scroll distance: ', error);
    }
}

// スクロール距離の更新
async function updateScrollDistance() {
    const currentPosition = window.scrollY;
    let delta;
    if (measureType == "both") {
        delta = Math.abs(currentPosition - lastPosition) * factor;
    } else if (measureType == "upOnly") {
        delta = (currentPosition - lastPosition) < 0 ? Math.abs(currentPosition - lastPosition) * factor : 0;
    } else {
        delta = (currentPosition - lastPosition) > 0 ? Math.abs(currentPosition - lastPosition) * factor : 0;
    }
    // 保存は物理ピクセルで行う
    scrollDistance += delta * window.devicePixelRatio;
    lastPosition = currentPosition;

    await saveScrollDistance(scrollDistance);

    // popup.jsへ送信
    if (!chrome.runtime || !chrome.runtime.sendMessage) { return false; }
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

// URLの変更を検知
function monitorUrlChanges() {
    let lastUrl = location.href;
    const checkUrlChange = () => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            onUrlChange();
        }
    };
    const onUrlChange = () => {
        const waitForPageLoad = () => {
            // これ挟まないとwindow.scrollYが173.88くらいに固定されちゃう
            setTimeout(() => {
                lastPosition = window.scrollY;
                console.log(`遷移後位置: ${lastPosition}`);
            }, 0);
        };
        waitForPageLoad();
    };
    // URL変更の監視
    new MutationObserver(checkUrlChange).observe(document, { subtree: true, childList: true });
    // SPAの対応...?
    window.addEventListener('popstate', checkUrlChange);
    const originalPushState = history.pushState;
    history.pushState = function (...args) {
        originalPushState.apply(this, args);
        checkUrlChange();
    };
}


// 初期設定
(async function () {
    console.log(`Device pixel ratio: ${window.devicePixelRatio}`);
    lastPosition = window.scrollY;

    await loadSettings();

    // setting.jsからの情報を受信する
    // うごかない
    // Reload指示のみでOKでは？
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.devicePPI !== undefined) {
            ppi = request.devicePPI;
            factor = request.factor;
            DD = request.debounceDelay;
            console.log(`receive info / ppi:${ppi},factor:${factor},DD:${DD}`)
        }
    });

    window.addEventListener('scroll', debounce(handleScroll, DD));

    monitorUrlChanges();

    // devicePixelRatioの変更を検知..?
    // いらなくないか...?
    // ratioを変数にして、変更時のみ書き換えにすれば処理速度向上しそうですね
    let initialZoom = window.devicePixelRatio;

    window.addEventListener('resize', () => {
        if (window.devicePixelRatio !== initialZoom) {
            console.log('Zoom level changed');
            initialZoom = window.devicePixelRatio;
        }
    });

    // 高頻度で await loadSettings(); させるという手もあるけどまぁいいかなーって感じ
    // -> URL変更検知時でいいのでは？
})();


// 保存は物理ピクセルにした