// 拡張機能の読み込み時に実行されると思います
async function loadData() {
    const data = await chrome.storage.local.get('devicePPI');
    let ppi = data.devicePPI || null;
    if (!ppi || ppi == 0) {
        chrome.tabs.create({ url: "setting.html" });
    }
}

loadData();