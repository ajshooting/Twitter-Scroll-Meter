document.addEventListener('DOMContentLoaded', function () {
    function pixelsToMeters(pixels) {
        const dpi = 227 * window.devicePixelRatio; // 96 is the standard DPI for many screens
        const inches = pixels / dpi;
        const meters = inches * 0.0254;
        return meters;
    }


    function updateDisplay(scrollDistance) {
        const meters = pixelsToMeters(scrollDistance).toFixed(2);
        document.getElementById('result').textContent = meters;
    }

    // 初期表示の設定
    chrome.storage.local.get('scrollDistance', function (data) {
        const scrollDistance = data.scrollDistance || 0;
        updateDisplay(scrollDistance);
    });



    // メッセージを受け取りリアルタイムで表示を更新
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.scrollDistance !== undefined) {
            updateDisplay(request.scrollDistance);
        }
    });

});

