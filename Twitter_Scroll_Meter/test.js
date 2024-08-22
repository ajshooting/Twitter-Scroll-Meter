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

    if (screenSize > 0 && screenWidth > 0 && screenHeight > 0 && (screenDiagonalPixels / screenSize).toFixed(2) > 0) {
        const screenDiagonalPixels = Math.sqrt(screenWidth ** 2 + screenHeight ** 2);
        const ppi = screenDiagonalPixels / screenSize;
        document.getElementById('ppi-display').textContent = 'PPI: ' + ppi.toFixed(2);

        chrome.storage.local.set({ devicePPI: ppi.toFixed(2) }, function () {
            document.getElementById('result').textContent = '設定完了しました！';
            console.log(`PPI saved: ${ppi.toFixed(2)}`);
        });

        document.getElementById('ratio').textContent = 'ratio : ' + window.devicePixelRatio;
        document.getElementById('tateyoko').textContent = '縦が' + pixelsToMeters(400, ppi) * 100 + 'cm で、横が' + pixelsToMeters(600, ppi) * 100 + 'cm だとめちゃ嬉しい'
        document.getElementById('moshikashite').textContent = 'もしかしてだけど縦が' + pixelsToMeters(400, ppi) * (7 / 8) * 100 + 'cm で、横が' + pixelsToMeters(600, ppi) * (7 / 8) * 100 + 'cm の方が近かったら発狂する'
    } else {
        document.getElementById('ppi-display').textContent = '正しい値を入力してください。';
    }
}

document.getElementById('calculatePPI').addEventListener('click', function () {
    calculateAndDisplayPPI()
});