postMessage('Worker initialised. Importing scripts...');

importScripts(
    './node_modules/d3-array/dist/d3-array.js',
    './node_modules/d3-collection/dist/d3-collection.js',
    './node_modules/d3-color/dist/d3-color.js',
    './node_modules/d3-format/dist/d3-format.js',
    './node_modules/d3-interpolate/dist/d3-interpolate.js',
    './node_modules/d3-scale-chromatic/dist/d3-scale-chromatic.js',
    './node_modules/d3-random/dist/d3-random.js',
    './node_modules/d3-scale/dist/d3-scale.js',
    './node_modules/d3-shape/dist/d3-shape.js',
    './node_modules/d3-time-format/dist/d3-time-format.js',
    './node_modules/@d3fc/d3fc-extent/build/d3fc-extent.js',
    './node_modules/@d3fc/d3fc-random-data/build/d3fc-random-data.js',
    './node_modules/@d3fc/d3fc-rebind/build/d3fc-rebind.js',
    './node_modules/@d3fc/d3fc-series/build/d3fc-series.js',
    './node_modules/@d3fc/d3fc-webgl/build/d3fc-webgl.js'
);

postMessage('Scripts imported. Generating data...');

const randomNormal = d3.randomNormal(0, 1);
const randomLogNormal = d3.randomLogNormal();

const data = Array.from({ length: parseInt(location.hash.substring(1)) }, () => ({
    x: randomNormal(),
    y: randomNormal(),
    size: randomLogNormal() * 10
}));

postMessage('Data generated. Configuring rendering...');

const xScale = d3.scaleLinear().domain([-5, 5]);

const yScale = d3.scaleLinear().domain([-5, 5]);

const series = fc
    .seriesWebglPoint()
    .xScale(xScale)
    .yScale(yScale)
    .crossValue(d => d.x)
    .mainValue(d => d.y)
    .size(d => d.size)
    .equals((previousData, data) => previousData.length > 0);

const colorScale = d3.scaleOrdinal(d3.schemeAccent);

const webglColor = color => {
    const { r, g, b, opacity } = d3.color(color).rgb();
    return [r / 255, g / 255, b / 255, opacity];
};

const fillColor = fc
    .webglFillColor()
    .value((d, i) => webglColor(colorScale(i)))
    .data(data);

series.decorate(program => {
    fillColor(program);
});

postMessage('Rendering configured. Awaiting canvas...');

function render() {
    const ease = 5 * (0.51 + 0.49 * Math.sin(Date.now() / 1e3));
    xScale.domain([-ease, ease]);
    yScale.domain([-ease, ease]);
    series(data);
    requestAnimationFrame(render);
    postMessage('frame');
}

addEventListener('message', ({ data: { offscreenCanvas, width, height } }) => {
    if (offscreenCanvas != null) {
        postMessage('Canvas received. Rendering...');
        const gl = offscreenCanvas.getContext('webgl');
        series.context(gl);
        render();
    }

    if (width != null && height != null) {
        const gl = series.context();
        gl.canvas.width = width;
        gl.canvas.height = height;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }
});
