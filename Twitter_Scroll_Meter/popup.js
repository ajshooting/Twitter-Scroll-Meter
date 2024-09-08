document.addEventListener('DOMContentLoaded', async function () {

    function updateDisplay(scrollMeters) {
        const meters = scrollMeters.toFixed(2);
        document.getElementById('result').textContent = meters;
    }

    const data = await chrome.storage.local.get('scrollMeters');
    const scrollMeters = data.scrollMeters || 0;
    updateDisplay(scrollMeters);

    // 受け取る、メートルで来るはず
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.scrollMeters !== undefined) {
            updateDisplay(request.scrollMeters);
        }
    });
});