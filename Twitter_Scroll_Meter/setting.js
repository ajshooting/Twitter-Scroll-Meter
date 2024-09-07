function pixelsToMeters(pixels, ppi) {
    const inches = (pixels * window.devicePixelRatio) / ppi;
    const meters = inches * 0.0254;
    return meters;
}

// PPIを計算し、表示する関数
function setPPI() {
    const screenSize = parseFloat(document.getElementById('screen-size').value);
    const screenWidth = parseInt(document.getElementById('screen-width').value);
    const screenHeight = parseInt(document.getElementById('screen-height').value);
    const screenDiagonalPixels = Math.sqrt(screenWidth ** 2 + screenHeight ** 2);
    const ppi = (screenDiagonalPixels / screenSize).toFixed();
    if (screenSize > 0 && screenWidth > 0 && ppi > 0) {
        chrome.storage.local.set({ devicePPI: ppi }, function () {
            document.getElementById('ppi-display').textContent = 'PPI: ' + ppi + ' に設定完了';
            console.log(`PPI saved: ${ppi}`);
        });
        // 縦横の変更
        chrome.storage.local.get(['factor'], function (data) {
            const factor = data.factor || 1;
            document.getElementById('tateyoko').textContent = '縦:' + (pixelsToMeters(200, ppi).toFixed(2) * 100 * factor) + 'cm / 横:' + (pixelsToMeters(300, ppi).toFixed(1) * 100 * factor) + 'cm';
        });
    } else {
        document.getElementById('ppi-display').textContent = '正しい値を入力してください。';
    }
}

function setDD() {
    const DD = parseInt(document.getElementById('debounceDelay').value);
    if (DD >= 0) {
        chrome.storage.local.set({ debounceDelay: DD }, function () {
            alert(`debounceDelayの設定が完了 : ${DD} \n 設定を反映させるためにX/Twitterを再読み込みさせてください`);
            console.log(`debounceDelay set: ${DD}`);
        });
    } else {
        alert("負の値は設定できません");
    }
}

function setFactor() {
    const factor = parseFloat(document.getElementById('factor').value);
    if (factor > 0) {
        chrome.storage.local.set({ factor: factor }, function () {
            alert(`Factorの設定が完了 : ${factor} \n 設定を反映させるためにX/Twitterを再読み込みさせてください`);
            console.log(`Factor set: ${factor}`);
        });
        // 縦横の変更
        chrome.storage.local.get(['devicePPI'], function (data) {
            const ppi = data.devicePPI;
            if (ppi) {
                document.getElementById('tateyoko').textContent = '縦:' + (pixelsToMeters(200, ppi).toFixed(2) * 100 * factor) + 'cm / 横:' + (pixelsToMeters(300, ppi).toFixed(1) * 100 * factor) + 'cm';
            }
        });
    } else {
        alert("負の値は設定できません");
    }
}


// 初期設定
document.addEventListener('DOMContentLoaded', async function () {
    await chrome.storage.local.get(['devicePPI', 'factor', 'debounceDelay'], function (data) {
        const ppi = data.devicePPI;
        const factor = data.factor || 1;
        const DD = data.debounceDelay || 30;

        document.getElementById('factor').value = factor;
        document.getElementById('debounceDelay').value = DD;
        if (ppi) {
            document.getElementById('ppi-display').textContent = 'PPI: ' + ppi + ' に設定済み';
            document.getElementById('tateyoko').textContent = '縦:' + (pixelsToMeters(200, ppi).toFixed(2) * 100 * factor) + 'cm / 横:' + (pixelsToMeters(300, ppi).toFixed(1) * 100 * factor) + 'cm';
        }
    });

    document.getElementById('calculatePPI').addEventListener('click', setPPI);

    document.getElementById('setDebounceDelay').addEventListener('click', setDD);

    document.getElementById('setFactor').addEventListener('click', setFactor);
});

// 情報をcontent.jsに送信後、