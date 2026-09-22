/**
 * Matrix Love Code - Interactive Romantic Particle & Matrix Experience
 * Synchronized with the soundtrack from the video.
 */

// ==========================================
// Configuration & State
// ==========================================
const CONFIG = {
    // Default messages (can be customized via UI or localStorage)
    heartText: localStorage.getItem('matrix_heart_text') || 'I Love ❤️ You Sayang',
    word1: localStorage.getItem('matrix_word_1') || 'You',
    word2: localStorage.getItem('matrix_word_2') || 'Are',
    word3: localStorage.getItem('matrix_word_3') || 'My',
    word4: localStorage.getItem('matrix_word_4') || 'Love',

    // Timeline event timings in seconds (matched with audio.mp4)
    timings: {
        introStart: 0.0,
        centerDot1Start: 1.6,
        centerDot1End: 2.8,
        count3Start: 2.9,
        count2Start: 3.9,
        count1Start: 4.9,
        countdownEnd: 5.9,
        centerDot2Start: 6.6,
        centerDot2End: 7.6,
        word1Start: 7.7,
        word1End: 9.5,
        word2Start: 9.6,
        word2End: 11.4,
        word3Start: 11.5,
        word3End: 13.2,
        word4Start: 13.3,
        word4End: 15.6,
        anticipationStart: 15.6,
        heartDropStart: 17.6
    }
};

// ==========================================
// Canvas & Context Setup
// ==========================================
const matrixCanvas = document.getElementById('matrix-canvas');
const matrixCtx = matrixCanvas.getContext('2d');

const fgCanvas = document.getElementById('fg-canvas');
const fgCtx = fgCanvas.getContext('2d');

const audio = document.getElementById('bgm');
const startOverlay = document.getElementById('start-overlay');
const startBtn = document.getElementById('start-btn');
const uiControls = document.getElementById('ui-controls');
const playPauseBtn = document.getElementById('play-pause-btn');
const replayBtn = document.getElementById('replay-btn');
const editBtn = document.getElementById('edit-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');

// Modal Elements
const editModal = document.getElementById('edit-modal');
const inputHeartText = document.getElementById('input-heart-text');
const inputWord1 = document.getElementById('input-word-1');
const inputWord2 = document.getElementById('input-word-2');
const inputWord3 = document.getElementById('input-word-3');
const inputWord4 = document.getElementById('input-word-4');
const saveModalBtn = document.getElementById('save-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const resetDefaultsBtn = document.getElementById('reset-defaults-btn');

let width = window.innerWidth;
let height = window.innerHeight;
let isStarted = false;
let controlsTimeout = null;

function resizeCanvases() {
    width = window.innerWidth;
    height = window.innerHeight;
    
    matrixCanvas.width = width;
    matrixCanvas.height = height;
    
    fgCanvas.width = width;
    fgCanvas.height = height;

    initMatrixRain();
    regenerateGlyphCaches();
    generateHeartParticles();
}

window.addEventListener('resize', resizeCanvases);

// ==========================================
// 1. Matrix Digital Rain Layer
// ==========================================
const MATRIX_CHARS = '01♥❤LOVE0110♥100101YOU10100101♥4MANNI1010123456789ABCDEF♥';
const FONT_SIZE = 16;
let columns = 0;
let drops = [];
let dropSpeeds = [];
let columnChars = [];

function initMatrixRain() {
    columns = Math.floor(width / FONT_SIZE);
    drops = [];
    dropSpeeds = [];
    columnChars = [];

    for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100; // staggered start
        dropSpeeds[i] = 0.75 + Math.random() * 1.5;
        columnChars[i] = MATRIX_CHARS.charAt(Math.floor(Math.random() * MATRIX_CHARS.length));
    }
}

function updateAndDrawMatrixRain() {
    // Semi-transparent fade background for smooth trails
    matrixCtx.fillStyle = 'rgba(3, 1, 6, 0.14)';
    matrixCtx.fillRect(0, 0, width, height);

    matrixCtx.font = `bold ${FONT_SIZE}px 'Fira Code', 'Courier New', monospace`;

    for (let i = 0; i < columns; i++) {
        const x = i * FONT_SIZE;
        const y = drops[i] * FONT_SIZE;

        // Randomly mutate character
        if (Math.random() < 0.06) {
            columnChars[i] = MATRIX_CHARS.charAt(Math.floor(Math.random() * MATRIX_CHARS.length));
        }
        const char = columnChars[i];

        // Draw bright head character
        matrixCtx.shadowBlur = 10;
        matrixCtx.shadowColor = '#ff2d75';
        matrixCtx.fillStyle = '#ffffff';
        matrixCtx.fillText(char, x, y);

        // Draw trailing character just above head
        if (y > FONT_SIZE) {
            matrixCtx.shadowBlur = 6;
            matrixCtx.shadowColor = '#ff1493';
            matrixCtx.fillStyle = '#ff69b4';
            const prevChar = MATRIX_CHARS.charAt((i * 7 + Math.floor(drops[i])) % MATRIX_CHARS.length);
            matrixCtx.fillText(prevChar, x, y - FONT_SIZE);
        }

        // Reset shadow
        matrixCtx.shadowBlur = 0;

        // Advance drop
        drops[i] += dropSpeeds[i];

        // Reset column if out of view
        if (drops[i] * FONT_SIZE > height && Math.random() > 0.975) {
            drops[i] = 0;
            dropSpeeds[i] = 0.75 + Math.random() * 1.5;
        }
    }
}

// ==========================================
// 2. Offscreen Sampler for Countdown & Words
// ==========================================
// Offscreen canvas to render text and extract pixel positions
const offCanvas = document.createElement('canvas');
const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });

let glyphPoints = {
    '3': [],
    '2': [],
    '1': [],
    'word1': [],
    'word2': [],
    'word3': [],
    'word4': []
};

function sampleTextPoints(text, fontSize, isDotMatrix = false) {
    const size = 600;
    offCanvas.width = size;
    offCanvas.height = size;
    offCtx.clearRect(0, 0, size, size);

    offCtx.fillStyle = '#ffffff';
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    
    if (isDotMatrix) {
        // Bold impactful font for LED matrix
        offCtx.font = `900 ${fontSize}px 'Montserrat', 'Arial Black', sans-serif`;
    } else {
        // Fluffy countdown font
        offCtx.font = `900 ${fontSize}px 'Montserrat', sans-serif`;
    }
    
    offCtx.fillText(text, size / 2, size / 2);

    const imgData = offCtx.getImageData(0, 0, size, size).data;
    const points = [];
    const step = isDotMatrix ? 12 : 6; // Grid step for dot matrix vs particle cloud

    for (let y = 0; y < size; y += step) {
        for (let x = 0; x < size; x += step) {
            const index = (y * size + x) * 4;
            const alpha = imgData[index + 3];
            if (alpha > 128) {
                // Normalized coordinates relative to center (-0.5 to 0.5)
                points.push({
                    x: (x - size / 2),
                    y: (y - size / 2)
                });
            }
        }
    }
    return points;
}

function regenerateGlyphCaches() {
    const isMobile = width < 600;
    const countdownSize = isMobile ? 220 : 280;
    const wordSize = isMobile ? 100 : 140;

    glyphPoints['3'] = sampleTextPoints('3', countdownSize, false);
    glyphPoints['2'] = sampleTextPoints('2', countdownSize, false);
    glyphPoints['1'] = sampleTextPoints('1', countdownSize, false);

    glyphPoints['word1'] = sampleTextPoints(CONFIG.word1, wordSize, true);
    glyphPoints['word2'] = sampleTextPoints(CONFIG.word2, wordSize, true);
    glyphPoints['word3'] = sampleTextPoints(CONFIG.word3, wordSize, true);
    glyphPoints['word4'] = sampleTextPoints(CONFIG.word4, wordSize, true);
}

// ==========================================
// 3. Countdown Particle Cloud System (3, 2, 1)
// ==========================================
const COUNTDOWN_PARTICLE_COUNT = 900;
let countdownParticles = [];

function initCountdownParticles() {
    countdownParticles = [];
    for (let i = 0; i < COUNTDOWN_PARTICLE_COUNT; i++) {
        countdownParticles.push({
            x: width / 2 + (Math.random() - 0.5) * 50,
            y: height / 2 + (Math.random() - 0.5) * 50,
            targetX: width / 2,
            targetY: height / 2,
            vx: 0,
            vy: 0,
            size: 2.2 + Math.random() * 2.8,
            alpha: 0,
            color: Math.random() > 0.3 ? '#fff5f8' : '#ffc4de',
            seed: Math.random() * 1000
        });
    }
}

function updateCountdownParticles(targetGlyph, progress, isDissolving = false) {
    const points = glyphPoints[targetGlyph] || [];
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < countdownParticles.length; i++) {
        const p = countdownParticles[i];

        if (isDissolving) {
            // Dissolve explosion effect
            p.x += p.vx;
            p.y += p.vy;
            p.alpha = Math.max(0, p.alpha - 0.035);
        } else {
            if (points.length > 0) {
                const pt = points[i % points.length];
                p.targetX = centerX + pt.x;
                p.targetY = centerY + pt.y;

                // Brownian cloud shimmer
                const time = performance.now() * 0.003;
                const jitterX = Math.sin(time + p.seed) * 1.5;
                const jitterY = Math.cos(time + p.seed * 0.7) * 1.5;

                // Easing towards target position
                p.x += (p.targetX + jitterX - p.x) * 0.18;
                p.y += (p.targetY + jitterY - p.y) * 0.18;

                // Smooth fade-in
                p.alpha = Math.min(0.95, p.alpha + 0.08);

                // Prepare scatter velocity when dissolve begins
                const angle = Math.atan2(p.y - centerY, p.x - centerX) + (Math.random() - 0.5) * 0.5;
                const speed = 2 + Math.random() * 6;
                p.vx = Math.cos(angle) * speed;
                p.vy = Math.sin(angle) * speed;
            }
        }
    }
}

function drawCountdownParticles() {
    for (let i = 0; i < countdownParticles.length; i++) {
        const p = countdownParticles[i];
        if (p.alpha <= 0.01) continue;

        fgCtx.save();
        fgCtx.globalAlpha = p.alpha;
        fgCtx.shadowBlur = 12;
        fgCtx.shadowColor = '#ff69b4';
        fgCtx.fillStyle = p.color;

        fgCtx.beginPath();
        fgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        fgCtx.fill();
        fgCtx.restore();
    }
}

// ==========================================
// 4. Dot Matrix / LED Words ("You", "Are", "My", "Love")
// ==========================================
function drawDotMatrixWord(targetKey, timeInPhase, duration) {
    const points = glyphPoints[targetKey] || [];
    if (points.length === 0) return;

    const centerX = width / 2;
    const centerY = height / 2;

    // Pop-in and pulse animation
    let scale = 1.0;
    let alpha = 1.0;
    if (timeInPhase < 0.2) {
        // Quick punchy scale pop
        scale = 0.8 + (timeInPhase / 0.2) * 0.25;
    } else {
        scale = 1.0 + Math.sin(timeInPhase * 6) * 0.02;
    }

    // Fade out near end of word
    if (timeInPhase > duration - 0.25) {
        alpha = Math.max(0, (duration - timeInPhase) / 0.25);
    }

    const dotRadius = width < 600 ? 3.8 : 4.8;

    fgCtx.save();
    fgCtx.translate(centerX, centerY);
    fgCtx.scale(scale, scale);
    fgCtx.globalAlpha = alpha;

    for (let i = 0; i < points.length; i++) {
        const pt = points[i];

        // Glowing outer neon halo
        fgCtx.shadowBlur = 15;
        fgCtx.shadowColor = '#ff1493';
        fgCtx.fillStyle = '#ffffff';

        fgCtx.beginPath();
        fgCtx.arc(pt.x, pt.y, dotRadius, 0, Math.PI * 2);
        fgCtx.fill();

        // Extra white-hot core
        fgCtx.shadowBlur = 4;
        fgCtx.shadowColor = '#ffffff';
        fgCtx.fillStyle = '#ffffff';
        fgCtx.beginPath();
        fgCtx.arc(pt.x, pt.y, dotRadius * 0.5, 0, Math.PI * 2);
        fgCtx.fill();
    }

    fgCtx.restore();
}

// ==========================================
// 5. Big Fluffy Particle Heart & Text
// ==========================================
const HEART_PARTICLE_COUNT = 1600;
let heartParticles = [];
let floatingSparks = [];

// Parametric Heart Equation
function getHeartCoord(t, scale) {
    // Standard Cardioid / Heart Curve
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return { x: x * scale, y: y * scale };
}

function generateHeartParticles() {
    heartParticles = [];
    const isMobile = width < 600;
    const baseScale = isMobile ? (width / 38) : (Math.min(width, height) / 36);

    const colors = ['#ff007f', '#ff1493', '#ff69b4', '#ff85c0', '#ffffff', '#ffa3d1'];

    for (let i = 0; i < HEART_PARTICLE_COUNT; i++) {
        const t = Math.random() * Math.PI * 2;
        const pt = getHeartCoord(t, baseScale);

        // Calculate normal / tangent for fluffy spread perpendicular to the perimeter
        const dt = 0.01;
        const pt2 = getHeartCoord(t + dt, baseScale);
        const tx = pt2.x - pt.x;
        const ty = pt2.y - pt.y;
        const len = Math.sqrt(tx * tx + ty * ty) || 1;
        const nx = -ty / len;
        const ny = tx / len;

        // Gaussian-like normal distribution for fluffy cloud edges
        const spread = (Math.random() + Math.random() + Math.random() - 1.5) * (isMobile ? 26 : 38);
        const tangentSpread = (Math.random() - 0.5) * 8;

        heartParticles.push({
            baseX: pt.x + nx * spread + tx * tangentSpread,
            baseY: pt.y + ny * spread + ty * tangentSpread,
            size: 1.8 + Math.random() * 3.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 0.35 + Math.random() * 0.65,
            phase: Math.random() * Math.PI * 2,
            speed: 1.5 + Math.random() * 2
        });
    }

    // Floating Sparks
    floatingSparks = [];
    for (let i = 0; i < 90; i++) {
        resetFloatingSpark(i);
    }
}

function resetFloatingSpark(index) {
    const isMobile = width < 600;
    const baseScale = isMobile ? (width / 38) : (Math.min(width, height) / 36);
    const t = Math.random() * Math.PI * 2;
    const pt = getHeartCoord(t, baseScale);

    floatingSparks[index] = {
        x: width / 2 + pt.x + (Math.random() - 0.5) * 40,
        y: height / 2 + pt.y + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -0.8 - Math.random() * 1.8,
        size: 1.5 + Math.random() * 2.5,
        alpha: 0.7 + Math.random() * 0.3,
        color: Math.random() > 0.5 ? '#ff69b4' : '#ffffff'
    };
}

function updateAndDrawHeart(currentTime) {
    const centerX = width / 2;
    const centerY = height / 2;

    // Heartbeat Rhythm calculation (~128 BPM energetic lub-dub beat)
    const timeSinceDrop = Math.max(0, currentTime - CONFIG.timings.heartDropStart);
    const beatFrequency = 2.13; // Beats per second
    const beatPhase = (timeSinceDrop * beatFrequency) % 1;

    let beatScale = 1.0;
    if (beatPhase < 0.15) {
        // Lub (primary ventricular beat)
        beatScale += Math.sin((beatPhase / 0.15) * Math.PI) * 0.085;
    } else if (beatPhase >= 0.18 && beatPhase < 0.32) {
        // Dub (secondary beat)
        beatScale += Math.sin(((beatPhase - 0.18) / 0.14) * Math.PI) * 0.045;
    }

    // Draw Heart Particle Cloud
    fgCtx.save();
    fgCtx.translate(centerX, centerY);
    fgCtx.scale(beatScale, beatScale);

    const time = performance.now() * 0.003;

    for (let i = 0; i < heartParticles.length; i++) {
        const p = heartParticles[i];

        // Soft breathing shimmer
        const shimmer = Math.sin(time * p.speed + p.phase);
        const currentAlpha = Math.max(0.15, Math.min(1, p.alpha + shimmer * 0.25));

        fgCtx.save();
        fgCtx.globalAlpha = currentAlpha;
        fgCtx.shadowBlur = 10;
        fgCtx.shadowColor = p.color;
        fgCtx.fillStyle = p.color;

        fgCtx.beginPath();
        fgCtx.arc(p.baseX, p.baseY, p.size, 0, Math.PI * 2);
        fgCtx.fill();
        fgCtx.restore();
    }

    fgCtx.restore();

    // Update and Draw Floating Sparks
    for (let i = 0; i < floatingSparks.length; i++) {
        const spark = floatingSparks[i];
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.alpha -= 0.012;

        if (spark.alpha <= 0) {
            resetFloatingSpark(i);
            continue;
        }

        fgCtx.save();
        fgCtx.globalAlpha = spark.alpha;
        fgCtx.shadowBlur = 8;
        fgCtx.shadowColor = spark.color;
        fgCtx.fillStyle = spark.color;
        fgCtx.beginPath();
        fgCtx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
        fgCtx.fill();
        fgCtx.restore();
    }

    // Draw Center Text Inside Heart: "- I Love ❤️ You Sayang -"
    fgCtx.save();
    fgCtx.translate(centerX, centerY);
    fgCtx.scale(beatScale, beatScale);

    const isMobile = width < 600;
    const fontSize = isMobile ? 22 : 32;
    fgCtx.font = `700 ${fontSize}px 'Montserrat', 'Poppins', sans-serif`;
    fgCtx.textAlign = 'center';
    fgCtx.textBaseline = 'middle';

    const textToDraw = `- ${CONFIG.heartText} -`;

    // Outer intense pink glow
    fgCtx.shadowBlur = 24;
    fgCtx.shadowColor = '#ff1493';
    fgCtx.fillStyle = '#ff69b4';
    fgCtx.fillText(textToDraw, 0, 0);

    // Inner bright white crisp text
    fgCtx.shadowBlur = 6;
    fgCtx.shadowColor = '#ffffff';
    fgCtx.fillStyle = '#ffffff';
    fgCtx.fillText(textToDraw, 0, 0);

    fgCtx.restore();
}

// ==========================================
// 6. Center Glowing Dot / Transitions
// ==========================================
function drawCenterDot(progress) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 5 + Math.sin(progress * Math.PI) * 7;
    const alpha = Math.sin(progress * Math.PI);

    fgCtx.save();
    fgCtx.globalAlpha = alpha;
    fgCtx.shadowBlur = 25;
    fgCtx.shadowColor = '#ffffff';
    fgCtx.fillStyle = '#ffffff';

    fgCtx.beginPath();
    fgCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    fgCtx.fill();

    fgCtx.restore();
}

// ==========================================
// 7. Main Animation Loop
// ==========================================
function animate() {
    requestAnimationFrame(animate);

    // Update background Matrix Rain
    updateAndDrawMatrixRain();

    // Clear foreground layer
    fgCtx.clearRect(0, 0, width, height);

    if (!isStarted) return;

    const t = audio.currentTime;
    const timings = CONFIG.timings;

    // Timeline Phase Router
    if (t >= timings.introStart && t < timings.centerDot1Start) {
        // Just pink matrix rain falling smoothly
    }
    else if (t >= timings.centerDot1Start && t < timings.centerDot1End) {
        // Voice: "udah siap belum? yuk" -> Center glowing dot
        const progress = (t - timings.centerDot1Start) / (timings.centerDot1End - timings.centerDot1Start);
        drawCenterDot(progress);
    }
    else if (t >= timings.count3Start && t < timings.count2Start) {
        // Countdown "3"
        const progress = (t - timings.count3Start) / (timings.count2Start - timings.count3Start);
        updateCountdownParticles('3', progress);
        drawCountdownParticles();
    }
    else if (t >= timings.count2Start && t < timings.count1Start) {
        // Countdown "2"
        const progress = (t - timings.count2Start) / (timings.count1Start - timings.count2Start);
        updateCountdownParticles('2', progress);
        drawCountdownParticles();
    }
    else if (t >= timings.count1Start && t < timings.countdownEnd) {
        // Countdown "1"
        const progress = (t - timings.count1Start) / (timings.countdownEnd - timings.count1Start);
        updateCountdownParticles('1', progress);
        drawCountdownParticles();
    }
    else if (t >= timings.countdownEnd && t < timings.centerDot2Start) {
        // Countdown dissolving
        updateCountdownParticles('1', 1, true);
        drawCountdownParticles();
    }
    else if (t >= timings.centerDot2Start && t < timings.centerDot2End) {
        // Pre-beat anticipation dot
        const progress = (t - timings.centerDot2Start) / (timings.centerDot2End - timings.centerDot2Start);
        drawCenterDot(progress);
    }
    else if (t >= timings.word1Start && t < timings.word1End) {
        // "You"
        drawDotMatrixWord('word1', t - timings.word1Start, timings.word1End - timings.word1Start);
    }
    else if (t >= timings.word2Start && t < timings.word2End) {
        // "Are"
        drawDotMatrixWord('word2', t - timings.word2Start, timings.word2End - timings.word2Start);
    }
    else if (t >= timings.word3Start && t < timings.word3End) {
        // "My"
        drawDotMatrixWord('word3', t - timings.word3Start, timings.word3End - timings.word3Start);
    }
    else if (t >= timings.word4Start && t < timings.word4End) {
        // "Love"
        drawDotMatrixWord('word4', t - timings.word4Start, timings.word4End - timings.word4Start);
    }
    else if (t >= timings.anticipationStart && t < timings.heartDropStart) {
        // Voice buildup: "What's that? Hit 'em with a red light..."
        // Falling matrix rain with gentle anticipation
    }
    else if (t >= timings.heartDropStart) {
        // Beat drop! Fluffy glowing heart & pulsating text
        updateAndDrawHeart(t);
    }
}

// ==========================================
// 8. User Interaction & Controls
// ==========================================
function startExperience() {
    isStarted = true;
    startOverlay.classList.add('fade-out');
    uiControls.classList.remove('hidden');

    initCountdownParticles();
    generateHeartParticles();

    audio.currentTime = 0;
    audio.play().catch((err) => {
        console.warn('Audio play prevented:', err);
    });

    scheduleHideControls();
}

function scheduleHideControls() {
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => {
        if (!editModal.classList.contains('hidden')) return;
        uiControls.classList.add('hidden');
    }, 3500);
}

document.addEventListener('mousemove', () => {
    if (isStarted && editModal.classList.contains('hidden')) {
        uiControls.classList.remove('hidden');
        scheduleHideControls();
    }
});

startBtn.addEventListener('click', startExperience);

// Toggle Play/Pause
playPauseBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        playPauseBtn.textContent = '⏸️';
    } else {
        audio.pause();
        playPauseBtn.textContent = '▶️';
    }
});

// Replay
replayBtn.addEventListener('click', () => {
    initCountdownParticles();
    generateHeartParticles();
    audio.currentTime = 0;
    audio.play();
    playPauseBtn.textContent = '⏸️';
});

// Fullscreen
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
        document.exitFullscreen();
    }
});

// Keyboard shortcuts
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        playPauseBtn.click();
    } else if (e.code === 'KeyF') {
        fullscreenBtn.click();
    } else if (e.code === 'KeyR') {
        replayBtn.click();
    }
});

// Audio Loop / End Handler
audio.addEventListener('ended', () => {
    // Loop playback seamlessly
    audio.currentTime = 0;
    audio.play();
});

// ==========================================
// 9. Customization Modal Logic
// ==========================================
editBtn.addEventListener('click', () => {
    inputHeartText.value = CONFIG.heartText;
    inputWord1.value = CONFIG.word1;
    inputWord2.value = CONFIG.word2;
    inputWord3.value = CONFIG.word3;
    inputWord4.value = CONFIG.word4;

    editModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
    editModal.classList.add('hidden');
    scheduleHideControls();
});

saveModalBtn.addEventListener('click', () => {
    CONFIG.heartText = inputHeartText.value.trim() || 'I Love ❤️ You Sayang';
    CONFIG.word1 = inputWord1.value.trim() || 'You';
    CONFIG.word2 = inputWord2.value.trim() || 'Are';
    CONFIG.word3 = inputWord3.value.trim() || 'My';
    CONFIG.word4 = inputWord4.value.trim() || 'Love';

    localStorage.setItem('matrix_heart_text', CONFIG.heartText);
    localStorage.setItem('matrix_word_1', CONFIG.word1);
    localStorage.setItem('matrix_word_2', CONFIG.word2);
    localStorage.setItem('matrix_word_3', CONFIG.word3);
    localStorage.setItem('matrix_word_4', CONFIG.word4);

    regenerateGlyphCaches();
    editModal.classList.add('hidden');
    scheduleHideControls();
});

resetDefaultsBtn.addEventListener('click', () => {
    inputHeartText.value = 'I Love ❤️ You Sayang';
    inputWord1.value = 'You';
    inputWord2.value = 'Are';
    inputWord3.value = 'My';
    inputWord4.value = 'Love';
});

// ==========================================
// Initialization
// ==========================================
resizeCanvases();
initMatrixRain();
initCountdownParticles();
generateHeartParticles();
animate();
