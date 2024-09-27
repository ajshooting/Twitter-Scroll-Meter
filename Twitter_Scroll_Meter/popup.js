const unitMap = {
    pixels: 'px',
    meters: 'm',
    inch: 'in',
    feet: 'ft',
    yard: 'yd',
    mile: 'mi',
    尺: '尺',
    海里: '海里',
    天文単位: 'au',
    光年: 'ly',
    parsec: 'pc',
    angstrom: 'Å',
    fathom_e: 'fathom',
    fathom_g: 'fathom',
    fathom_w: 'fathom'
};

function convertUnit(pixels, useUnit, ppi) {
    const conversionFactors = {
        pixels: ppi,
        meters: 0.0254,
        inch: 1,
        feet: 0.0254 / 0.3048,
        yard: 0.0254 / 0.9144,
        mile: 0.0254 / 1609.344,
        尺: 0.0254 / 0.30303,
        海里: 0.0254 / 1852,
        天文単位: 0.0254 / 149597870700,
        光年: 0.00000000000000000268478211842252327,
        parsec: 0.00000000000000000082315793952531799698,
        angstrom: 0.0254 / 0.0000000001,
        fathom_e: 0.0254 / 1.8288,
        fathom_g: 0.0254 / 1.8542,
        fathom_w: 0.0254 / 1.8964838
    };
    return pixels / ppi * (conversionFactors[useUnit] || 1);
}

function updateDisplay(scrollDistance, unit, digit) {
    const distance = scrollDistance.toFixed(digit);
    document.getElementById('result').textContent = distance;
    document.getElementById('unit').textContent = unit;
}

document.addEventListener('DOMContentLoaded', async function () {
    const data = await chrome.storage.local.get(['scrollDistance', 'useUnit', 'devicePPI', 'digit']);
    const scrollDistance = data.scrollDistance || 0;
    const useUnit = data.useUnit || 'meters';
    const ppi = data.devicePPI || 96;
    const digit = (data.digit !== undefined) ? data.digit : 2;

    let unit = '[' + unitMap[useUnit] + ']'

    // 初期更新
    updateDisplay(convertUnit(scrollDistance, useUnit, ppi), unit, digit);

    // 接続解除グラフを確認
    chrome.storage.local.get(['disconnected'], (result) => {
        if (result.disconnected) {
            document.getElementById('result').textContent = "計測停止中";
            document.getElementById('unit').textContent = "";
        }
    });

    // 受け取る、メートルで来るはず
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.scrollDistance !== undefined) {
            updateDisplay(convertUnit(request.scrollDistance, useUnit, ppi), unit, digit);
        }
    });
});