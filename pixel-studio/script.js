const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const video = document.createElement('video');
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggle-btn');

// Controladores de UI
const controls = {
    res: document.getElementById('res'),
    shape: document.getElementById('shape'),
    bright: document.getElementById('bright'),
    colorMode: document.getElementById('color-mode'),
    threshold: document.getElementById('threshold'),
    cDark: document.getElementById('color-dark'),
    cLight: document.getElementById('color-light'),
    asciiPresets: document.getElementById('ascii-presets'),
    asciiCustom: document.getElementById('ascii-custom')
};

// Toggle Sidebar
toggleBtn.onclick = () => sidebar.classList.toggle('hidden');

// Mostrar/Ocultar secciones según selección
controls.colorMode.onchange = () => {
    document.getElementById('duotone-controls').classList.toggle('hidden', controls.colorMode.value !== 'duotone');
};

controls.shape.onchange = () => {
    document.getElementById('ascii-section').classList.toggle('hidden', controls.shape.value !== 'ascii');
};

controls.asciiPresets.onchange = () => {
    controls.asciiCustom.classList.toggle('hidden', controls.asciiPresets.value !== 'custom');
};

// Cámara
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    video.srcObject = stream;
    video.play();
});

video.addEventListener('loadedmetadata', () => {
    canvas.width = 640;
    canvas.height = 480;
    render();
});

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function render() {
    const size = parseInt(controls.res.value);
    document.getElementById('v-res').innerText = size;

    // Dibujar video original procesado por brillo
    ctx.filter = `brightness(${controls.bright.value}%)`;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    
    // Limpiar canvas para dibujar píxeles
    ctx.filter = 'none';
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const charSet = controls.asciiPresets.value === 'custom' ? controls.asciiCustom.value : controls.asciiPresets.value;
    const darkRGB = hexToRgb(controls.cDark.value);
    const lightRGB = hexToRgb(controls.cLight.value);

    for (let y = 0; y < canvas.height; y += size) {
        for (let x = 0; x < canvas.width; x += size) {
            const i = (y * canvas.width + x) * 4;
            let r = imgData[i], g = imgData[i+1], b = imgData[i+2];
            const avg = (r + g + b) / 3;

            if (controls.colorMode.value === 'duotone') {
                const isLight = avg > parseInt(controls.threshold.value);
                const target = isLight ? lightRGB : darkRGB;
                r = target.r; g = target.g; b = target.b;
            }

            ctx.fillStyle = `rgb(${r},${g},${b})`;

            if (controls.shape.value === 'circle') {
                ctx.beginPath();
                ctx.arc(x + size/2, y + size/2, size/2.2, 0, Math.PI * 2);
                ctx.fill();
            } else if (controls.shape.value === 'ascii') {
                const charIdx = Math.floor((avg / 255) * (charSet.length - 1));
                ctx.font = `${size}px monospace`;
                ctx.fillText(charSet[charIdx] || ' ', x, y + size);
            } else {
                ctx.fillRect(x, y, size, size);
            }
        }
    }
    requestAnimationFrame(render);
}

function takeSnapshot() {
    const link = document.createElement('a');
    link.download = `pixel-art-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
}