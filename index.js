if (!location.search) {
    location.search = 10000;
}

let worker = null;

const canvasContainer = document.querySelector('d3fc-canvas');
canvasContainer.addEventListener('measure', ({ detail }) => {
    if (worker == null) {
        worker = new Worker(`worker.js#${Number(location.search.substring(1))}`);
        const canvas = canvasContainer
            .querySelector('canvas');
        if (canvas.transferControlToOffscreen == null) {
            alert(`It looks like OffscreenCanvas isn't supported by your browser`);
        }
        const offscreenCanvas = canvas.transferControlToOffscreen();
        worker.postMessage({ offscreenCanvas }, [offscreenCanvas]);
    }
    const { width, height } = detail;
    worker.postMessage({ width, height });
});
canvasContainer.requestRedraw();

const timestampContainer = document.querySelector('#timestamp');

const updateTimestamp = () => {
    timestampContainer.innerText = Date.now();
    requestAnimationFrame(updateTimestamp);
};

updateTimestamp();

document.querySelector('#alert').addEventListener('click', () => {
    alert(
        'This alert pauses the main thread, notice that the timestamp' +
        ' has stopped updating. Dismissing the alert will resume the' +
        ' main thread.'
    );
});
