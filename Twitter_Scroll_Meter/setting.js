function pixelsToMeters(pixels, ppi) {
    const inches = (pixels * window.devicePixelRatio) / ppi;
    const meters = inches * 0.0254;
    return meters;
}

function setDigit() {
    const digit = parseInt(document.getElementById('digit').value);
    if (digit >= 0) {
        if (digit <= 45) {
            chrome.storage.local.set({ digit: digit }, function () {
                console.log(`digit set: ${digit}`);
            });
        } else {
            alert("45より小さい値を設定して下さい")
        }
    } else {
        alert("負の値は設定できません");
    }
}

function setThreshold() {
    const threshold = parseInt(document.getElementById('threshold').value);
    if (threshold >= 0) {
        chrome.storage.local.set({ threshold: threshold }, function () {
            console.log(`threshold set: ${threshold}`);
        });
    } else {
        alert("負の値は設定できません");
    }
}

function setDD() {
    const DD = parseInt(document.getElementById('debounceDelay').value);
    if (DD >= 0) {
        chrome.storage.local.set({ debounceDelay: DD }, function () {
            // alert(`debounceDelayの設定が完了 : ${DD} \n\n X/Twitterを再読み込みさせてください`);
            console.log(`debounceDelay set: ${DD}`);
        });
        // 情報送信
        sendInfo()
    } else {
        alert("負の値は設定できません");
    }
}

function setFactor() {
    const factor = parseFloat(document.getElementById('factor').value);
    if (factor > 0) {
        chrome.storage.local.set({ factor: factor }, function () {
            // alert(`Factorの設定が完了 : ${factor} \n\n X/Twitterを再読み込みさせてください`);
            console.log(`Factor set: ${factor}`);
        });
        // 縦横の変更
        chrome.storage.local.get(['devicePPI'], function (data) {
            const ppi = data.devicePPI;
            if (ppi) {
                document.getElementById('tateyoko').textContent = '縦:' + (pixelsToMeters(200, ppi) * 100 * factor).toFixed(2) + 'cm / 横:' + (pixelsToMeters(300, ppi) * 100 * factor).toFixed(2) + 'cm';
            }
        });
        // 情報送信
        sendInfo()
    } else {
        alert("0以下のの値は設定できません");
    }
}

// 設定した情報を送信する
async function sendInfo() {
    const data = await chrome.storage.local.get(['devicePPI', 'debounceDelay', 'factor', 'measureType']);
    const ppi = data.devicePPI;
    const factor = data.factor || 1;
    const DD = (data.debounceDelay !== undefined) ? data.debounceDelay : 30;
    const measureType = data.measureType || "both";

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { devicePPI: ppi, factor: factor, debounceDelay: DD, measureType: measureType })
            .catch(e => {
                // alert(e)
            });
    });
}

// 初期設定
document.addEventListener('DOMContentLoaded', async function () {
    const data = await chrome.storage.local.get(['devicePPI', 'debounceDelay', 'factor', 'measureType', 'useUnit', 'digit', 'threshold']);
    const ppi = data.devicePPI || 96;
    const factor = data.factor || 1;
    const DD = (data.debounceDelay !== undefined) ? data.debounceDelay : 30;
    const threshold = data.threshold || 10000;
    let measureType = data.measureType || "both";
    let useUnit = data.useUnit || "meters";
    let digit = (data.digit !== undefined) ? data.digit : 2;

    document.getElementById('factor').value = factor;
    document.getElementById('debounceDelay').value = DD;
    document.getElementById('threshold').value = threshold;
    document.getElementById('measure_type').value = measureType;
    document.getElementById('useUnit').value = useUnit;
    document.getElementById('digit').value = digit;
    if (ppi) {
        document.getElementById('ppi-display').textContent = 'PPI: ' + ppi + ' に設定済み';
        document.getElementById('tateyoko').textContent = '縦:' + (pixelsToMeters(200, ppi) * 100 * factor).toFixed(2) + 'cm / 横:' + (pixelsToMeters(300, ppi) * 100 * factor).toFixed(2) + 'cm';
    }

    document.getElementById('setDigit').addEventListener('click', setDigit);
    document.getElementById('setThreshold').addEventListener('click', setThreshold);
    document.getElementById('setDebounceDelay').addEventListener('click', setDD);
    document.getElementById('setFactor').addEventListener('click', setFactor);

    document.getElementById('measure_type').addEventListener('change', function () {
        measureType = this.value;
        chrome.storage.local.set({ measureType: measureType }, function () {
            // alert(`measureTypeの設定が完了 : ${measureType} \n\n X/Twitterを再読み込みさせてください`);
            console.log(`measureType set: ${measureType}`);
            // 情報送信
            sendInfo()
        });
    });

    document.getElementById('useUnit').addEventListener('change', function () {
        useUnit = this.value;
        chrome.storage.local.set({ useUnit: useUnit }, function () {
            console.log(`useUnit set: ${useUnit}`);
        });
    });

    document.getElementById('setPPI').addEventListener('click', function () {
        chrome.tabs.create({ url: "setPPI.html" });
    });

    // debug用
    // document.getElementById('newtab').addEventListener('click', function () {
    //     chrome.tabs.create({ url: "setting.html" });
    // });
});
