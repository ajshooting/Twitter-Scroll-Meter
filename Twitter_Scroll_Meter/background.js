// 拡張機能の読み込み時に実行されると思います
async function loadData() {
    const data = await chrome.storage.local.get('devicePPI');
    let ppi = data.devicePPI || null;
    if (!ppi || ppi == 0) {
        // ここをPPI設定画面に変更したいわけですね
        chrome.tabs.create({ url: "setting.html" });
    }
}

loadData();


// ここも更新させる
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
        console.log('Extension updated');
        // 接続解除フラグ(popup用)
        chrome.storage.local.set({ disconnected: true });

    } else if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        console.log('Extension installed');
        // ここは上の処理と同じだもんなぁ..
    }
});