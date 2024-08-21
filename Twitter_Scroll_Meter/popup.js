const ppi = 227
// let ppi = 96

// 多分こっちで取得できるの違うよね....みたいな

document.addEventListener('DOMContentLoaded', function () {
    function pixelsToMeters(pixels) {
        const inches = (pixels * window.devicePixelRatio) / ppi;
        const meters = inches * 0.0254;
        return meters;
    }

    function updateDisplay(scrollDistance) {
        const meters = pixelsToMeters(scrollDistance).toFixed(2);
        document.getElementById('result').textContent = meters;
    }

    chrome.storage.local.get('scrollDistance', function (data) {
        const scrollDistance = data.scrollDistance || 0;
        updateDisplay(scrollDistance);
    });

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.scrollDistance !== undefined) {
            updateDisplay(request.scrollDistance);
        }
    });

});

