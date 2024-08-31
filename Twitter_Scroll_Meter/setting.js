function pixelsToMeters(pixels, ppi) {
    const inches = (pixels * window.devicePixelRatio) / ppi;
    const meters = inches * 0.0254;
    return meters;
}

// PPIを計算し、表示する関数
function calculateAndDisplayPPI() {
    const screenSize = parseFloat(document.getElementById('screen-size').value);
    const screenWidth = parseInt(document.getElementById('screen-width').value);
    const screenHeight = parseInt(document.getElementById('screen-height').value);

    const screenDiagonalPixels = Math.sqrt(screenWidth ** 2 + screenHeight ** 2);
    const ppi = (screenDiagonalPixels / screenSize).toFixed(2);

    if (screenSize > 0 && screenWidth > 0 && ppi > 0) {

        chrome.storage.local.set({ devicePPI: ppi }, function () {
            document.getElementById('ppi-display').textContent = 'PPI: ' + ppi + ' に設定完了';
            console.log(`PPI saved: ${ppi}`);
        });

        document.getElementById('tateyoko').textContent = '縦が' + pixelsToMeters(200, ppi) * 100 + 'cm で、横が' + pixelsToMeters(300, ppi) * 100 + 'cm だとめちゃ嬉しい'
        document.getElementById('moshikashite').textContent = 'もしかしてだけど縦が' + pixelsToMeters(200, ppi) * (7 / 8) * 100 + 'cm で、横が' + pixelsToMeters(300, ppi) * (7 / 8) * 100 + 'cm の方が近かったら発狂する'
    } else {
        document.getElementById('ppi-display').textContent = '正しい値を入力してください。';
    }
}

function setDD() {
    const DD = parseInt(document.getElementById('debounceDelay').value);
    if (DD >= 0) {
        chrome.storage.local.set({ debounceDelay: DD }, function () {
            alert(`debounceDelayの設定が完了 : ${DD}`);
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
            alert(`Factorの設定が完了 : ${factor}`);
            console.log(`Factor set: ${factor}`);
        });
    } else {
        alert("負の値は設定できません");
    }
}

document.getElementById('calculatePPI').addEventListener('click', function () {
    calculateAndDisplayPPI()
});

document.getElementById('setDebounceDelay').addEventListener('click', function () {
    setDD()
});

document.getElementById('setFactor').addEventListener('click', function () {
    setFactor()
});

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get('devicePPI', function (data) {
        const ppi = data.devicePPI;
        if (ppi) {
            document.getElementById('ppi-display').textContent = 'PPI: ' + ppi + ' に設定済み';
        }
    });

    chrome.storage.local.get('debounceDelay', function (data) {
        const DD = data.debounceDelay || 30;
        document.getElementById('debounceDelay').value = DD;
    });

    chrome.storage.local.get('factor', function (data) {
        const factor = data.factor || 1;
        document.getElementById('factor').value = factor;
    });
});

// ↑再読み込みさせたほうがいいかもな〜
// させないならどうにか反映させてあげて