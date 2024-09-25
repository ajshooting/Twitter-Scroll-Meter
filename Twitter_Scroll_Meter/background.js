// 拡張機能の読み込み時に実行されると思います
async function loadData() {
    const data = await chrome.storage.local.get('devicePPI');
    let ppi = data.devicePPI || null;
    if (!ppi || ppi == 0) {
        chrome.tabs.create({ url: "setting.html" });
    }
}

loadData();


// ここも更新させる
// chrome.runtime.onInstalled.addListener((details) => {
//     if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
//         console.log('Extension updated');
//         // 更新時に実行したい処理をここに記述
//     } else if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
//         console.log('Extension installed');
//         // インストール時に実行したい処理をここに記述
//     }
// });
