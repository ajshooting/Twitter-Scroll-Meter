const ppi = 227
// let ppi = 96

document.addEventListener('DOMContentLoaded', function () {

    function updateDisplay(scrollDistance) {
        const meters = scrollDistance.toFixed(2);
        document.getElementById('result').textContent = meters;
    }

    chrome.storage.local.get('scrollDistance', function (data) {
        const scrollDistance = data.scrollDistance || 0;
        updateDisplay(scrollDistance);
    });

    // 受け取る、メートルで来るはず
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.scrollDistance !== undefined) {
            updateDisplay(request.scrollDistance);
        }
    });
});

