// 取得するようにしてもいいかもー
const boxWidth = 600;
const boxHeight = 400;

function pixelsToMeters(pixels, ppi) {
    const inches = (pixels * window.devicePixelRatio) / ppi;
    const meters = inches * 0.0254;
    return meters;
}

// PPIを計算し、表示する
function setPPI() {
    const screenSize = parseFloat(document.getElementById('screen-size').value);
    const screenWidth = parseInt(document.getElementById('screen-width').value);
    const screenHeight = parseInt(document.getElementById('screen-height').value);
    const screenDiagonalPixels = Math.sqrt(screenWidth ** 2 + screenHeight ** 2);
    const ppi = (screenDiagonalPixels / screenSize).toFixed(1);
    if (screenSize > 0 && screenWidth > 0 && ppi > 0) {
        chrome.storage.local.set({ devicePPI: ppi }, function () {
            document.getElementById('ppi-display').textContent = 'PPI: ' + ppi + ' に設定完了';
            alert(`PPIの設定が完了 : ${ppi} \n\n X/Twitterを再読み込みさせてください`);
            console.log(`PPI saved: ${ppi}`);
        });
        // 縦横の変更
        chrome.storage.local.get(['factor'], function (data) {
            const factor = data.factor || 1;
            document.getElementById('tateyoko').textContent = '縦:' + (pixelsToMeters(boxHeight, ppi) * 100 * factor).toFixed(2) + 'cm / 横:' + (pixelsToMeters(boxWidth, ppi) * 100 * factor).toFixed(2) + 'cm';
        });
        // 情報送信
        sendInfo()
    } else {
        document.getElementById('ppi-display').textContent = '正しい値を入力してください。';
    }
}

function setFactor() {
    const factor = parseFloat(document.getElementById('factor').value);
    if (factor > 0) {
        chrome.storage.local.set({ factor: factor }, function () {
            alert(`Factorの設定が完了 : ${factor} \n\n X/Twitterを再読み込みさせてください`);
            console.log(`Factor set: ${factor}`);
        });
        // 縦横の変更
        chrome.storage.local.get(['devicePPI'], function (data) {
            const ppi = data.devicePPI;
            if (ppi) {
                document.getElementById('tateyoko').textContent = '縦:' + (pixelsToMeters(boxHeight, ppi) * 100 * factor).toFixed(2) + 'cm / 横:' + (pixelsToMeters(boxWidth, ppi) * 100 * factor).toFixed(2) + 'cm';
            }
        });
        // 情報送信(できません)
        // sendInfo()
    } else {
        alert("0以下のの値は設定できません");
    }
}


// 初期設定
document.addEventListener('DOMContentLoaded', async function () {
    const data = await chrome.storage.local.get(['devicePPI', 'factor']);
    const ppi = data.devicePPI || 96;
    const factor = data.factor || 1;

    document.getElementById('factor').value = factor;
    if (ppi) {
        document.getElementById('ppi-display').textContent = 'PPI: ' + ppi + ' に設定済み';
        document.getElementById('tateyoko').textContent = '縦:' + (pixelsToMeters(boxHeight, ppi) * 100 * factor).toFixed(2) + 'cm / 横:' + (pixelsToMeters(boxWidth, ppi) * 100 * factor).toFixed(2) + 'cm';
    }

    document.getElementById('calculatePPI').addEventListener('click', setPPI);
    document.getElementById('setFactor').addEventListener('click', setFactor);


    // debug用
    // document.getElementById('newtab').addEventListener('click', function () {
    //     chrome.tabs.create({ url: "setting.html" });
    // });
});
