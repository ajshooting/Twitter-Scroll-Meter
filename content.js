// やることメモ
// 
// ->history

let requestId = null;
let suggestReload = false;
let ppi = 96;
let DD = 30;
let factor = 1;
let scrollDistance = 0;
let useUnit = "meters";
let measureType = "both";
let lastPosition = 0;
let ratio = 1;
let threshold = 10000;

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

// 読み込む
async function loadSettings() {
    const data = await chrome.storage.local.get(['devicePPI', 'debounceDelay', 'factor', 'scrollDistance', 'measureType', 'useUnit', 'threshold']);
    ppi = data.devicePPI || 96;
    DD = (data.debounceDelay !== undefined) ? data.debounceDelay : 30;
    factor = data.factor || 1;
    useUnit = data.useUnit || 'meters'
    measureType = data.measureType || 'both';
    scrollDistance = data.scrollDistance || 0;
    threshold = data.threshold || 10000;

    if (ppi == 0) {
        alert('PPIが0に設定されています。再設定してください。')
        chrome.tabs.create({ url: "setting.html" });
    } else {
        console.log(`[twitter scroll meter]\nLoaded settings: PPI=${ppi},debounceDelay=${DD},factor=${factor},useUnit=${useUnit},measureType=${measureType},threshold=${threshold},scrollDistance=${scrollDistance}`);
    }
}

// スクロール距離の保存
async function saveScrollDistance(scrollDistance) {
    if (!chrome.storage || !chrome.storage.local) { return false; }
    if (scrollDistance == 0) { return false; }
    try {
        await chrome.storage.local.set({ scrollDistance });
        // console.log(`Scroll distance saved: ${scrollDistance} Physics Pixels`);
    } catch (error) {
        console.log('Failed to save scroll distance: ', error);
    }
}

// スクロール距離の更新
async function updateScrollDistance() {
    // 接続の解除を検知->リロード
    // ここIDが読み取れない場合あるっぽいからchrome.runtime==undefinedで十分かどうかの検証ができたらそっちでやりましょ
    if (chrome.runtime.id == undefined) {
        if (suggestReload == false) {
            alert("拡張機能[Twitter Scroll Meter]が更新されました\nTwitter/Xを再読み込みするまで計測は中断されます。");
            suggestReload = true;
        }
        requestId = null;
        return;
    };

    const currentPosition = window.scrollY;
    let delta;
    const abs = Math.abs(currentPosition - lastPosition);

    if (abs > threshold) return;

    if (measureType == "both") {
        delta = abs * factor;
    } else if (measureType == "upOnly") {
        delta = (currentPosition - lastPosition) < 0 ? abs * factor : 0;
    } else {
        delta = (currentPosition - lastPosition) > 0 ? abs * factor : 0;
    }
    // 保存は物理ピクセルで
    scrollDistance += delta * ratio;
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
                // console.log(`遷移後位置: ${lastPosition}`);
                // URL変更時に再提案
                suggestReload = false;
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

// devicePixelRatioの変更を検知
ratio = window.devicePixelRatio;
let remove = null;
const updatePixelRatio = () => {
    if (remove != null) {
        remove();
    }
    ratio = window.devicePixelRatio;
    // console.log(`updateRatio : ${ratio}`)
    const mqString = `(resolution: ${ratio}dppx)`;
    const media = matchMedia(mqString);
    media.addEventListener("change", updatePixelRatio);
    remove = () => {
        media.removeEventListener("change", updatePixelRatio);
    };
};


// ここが実行！
(async function () {
    lastPosition = window.scrollY;

    // 接続できたフラグ(popup用)
    chrome.storage.local.set({ disconnected: false });

    // 設定読み込み
    await loadSettings();

    // メイン処理
    window.addEventListener('scroll', debounce(handleScroll, DD));

    // URL変更時の処理
    monitorUrlChanges();

    // Ratio変更時の処理
    updatePixelRatio();

    // setting.jsからの情報を受信する
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        ppi = request.devicePPI;
        factor = request.factor;
        DD = request.debounceDelay;
        measureType = request.measureType;
        threshold = request.threshold;
        console.log(`receive info / ppi:${ppi},factor:${factor},DD:${DD},measureType:${measureType}`)
        sendResponse();
        return;
    });
})();