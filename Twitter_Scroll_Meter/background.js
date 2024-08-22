// 拡張機能の読み込み時に実行されると思います
chrome.storage.local.get('devicePPI', function (data) {
    var ppi = data.devicePPI || null;

    if (!ppi || ppi == 0) {
        chrome.tabs.create({ url: "test.html" });
    }
});
