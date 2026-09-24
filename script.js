/**
 * Matrix Love Code for Milk 💖
 * Theme: Original Dark Cyber Neon Pink Matrix + Voice Vault Passcode (PIN: 2405)
 * Soundtrack: Best Part - Daniel Caesar ft. H.E.R.
 * High-Definition Legibility Engine for LED Dot Matrix Words
 */

// Auto-clean any previous default if it was 'Sayang' or 'Best Part'
if (!localStorage.getItem('matrix_heart_text') || localStorage.getItem('matrix_heart_text').includes('Sayang')) {
    localStorage.setItem('matrix_heart_text', 'I Love ❤️ You Milk');
}
localStorage.setItem('matrix_song', 'audio.m4a');

// Default sequence of words requested by user
const DEFAULT_WORDS = ['Happy', 'Anniversary', '4 Month', 'You', 'Are', 'My', 'Love'];

// ==========================================
// Configuration & State
// ==========================================
const CONFIG = {
    correctPin: '2405',
    currentSong: 'audio.m4a', // Best Part by Daniel Caesar ft. H.E.R.

    // Custom Messages
    heartText: localStorage.getItem('matrix_heart_text') || 'I Love ❤️ You Milk',
    words: DEFAULT_WORDS,

    // Song Timings synchronized with Best Part
    timings: {
        introStart: 0.0,
        centerDot1Start: 1.0,
        centerDot1End: 2.3,
        count3Start: 2.4,
        count2Start: 3.6,
        count1Start: 4.8,
        countdownEnd: 5.9,
        wordsStart: 6.0,
        wordsEnd: 17.55,
        heartDropStart: 17.6 // "If life is a movie, oh you're the best part... ❤️" -> Heart
    }
};

let wordTimeSlots = [];
function computeWordTimeSlots() {
    const totalWords = CONFIG.words.length;
    const startTime = CONFIG.timings.wordsStart;
    const endTime = CONFIG.timings.wordsEnd;
    const durationPerWord = (endTime - startTime) / totalWords;

    wordTimeSlots = CONFIG.words.map((word, idx) => ({
        index: idx,
        key: 'word_' + idx,
        text: word,
        start: startTime + idx * durationPerWord,
        end: startTime + (idx + 1) * durationPerWord,
        duration: durationPerWord
    }));
}

// ==========================================
// DOM Elements
// ==========================================
const matrixCanvas = document.getElementById('matrix-canvas');
const matrixCtx = matrixCanvas.getContext('2d');

const fgCanvas = document.getElementById('fg-canvas');
const fgCtx = fgCanvas.getContext('2d');

const audio = document.getElementById('bgm');

// Lockscreen DOM
const lockScreen = document.getElementById('lock-screen');
const lockIconBox = document.getElementById('lock-icon-box');
const pinIndicators = document.getElementById('pin-indicators');
const pinSlots = document.querySelectorAll('.pin-slot');
const keyButtons = document.querySelectorAll('.key-btn');
const hintBtn = document.getElementById('hint-btn');

// UI Controls
const uiControls = document.getElementById('ui-controls');
const playPauseBtn = document.getElementById('play-pause-btn');
const replayBtn = document.getElementById('replay-btn');
const lockAgainBtn = document.getElementById('lock-again-btn');
const editBtn = document.getElementById('edit-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');

// Modal Elements
const editModal = document.getElementById('edit-modal');
const inputHeartText = document.getElementById('input-heart-text');
const inputWord1 = document.getElementById('input-word-1');
const inputWord2 = document.getElementById('input-word-2');
const inputWord3 = document.getElementById('input-word-3');
const inputWord4 = document.getElementById('input-word-4');
const selectSong = document.getElementById('select-song');
const saveModalBtn = document.getElementById('save-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const resetDefaultsBtn = document.getElementById('reset-defaults-btn');

let width = window.innerWidth;
let height = window.innerHeight;
let isStarted = false;
let controlsTimeout = null;
let currentPin = '';
let isUnlocking = false;

// Set audio track
audio.src = CONFIG.currentSong;

// ==========================================
// Sound Synthesis (Web Audio API)
// ==========================================
let audioCtx = null;
function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playKeyClickSound() {
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(620, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.09, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
    } catch (e) {}
}

function playErrorSound() {
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(140, ctx.currentTime + 0.22);
        gain.gain.setValueAtTime(0.14, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
    } catch (e) {}
}

function playUnlockChime() {
    try {
        const ctx = getAudioContext();
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            const startTime = ctx.currentTime + idx * 0.08;
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.12, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.26);
        });
    } catch (e) {}
}

// ==========================================
// Passcode Lock Screen Logic
// ==========================================
function updatePinIndicators() {
    pinSlots.forEach((slot, idx) => {
        if (idx < currentPin.length) {
            slot.classList.add('filled');
        } else {
            slot.classList.remove('filled');
        }
    });
}

function handleKeyPress(key) {
    if (isUnlocking) return;

    if (key === 'del') {
        if (currentPin.length > 0) {
            playKeyClickSound();
            currentPin = currentPin.slice(0, -1);
            updatePinIndicators();
        }
    } else if (/^[0-9]$/.test(key)) {
        if (currentPin.length < 4) {
            playKeyClickSound();
            currentPin += key;
            updatePinIndicators();

            if (currentPin.length === 4) {
                verifyPin();
            }
        }
    }
}

function verifyPin() {
    if (currentPin === CONFIG.correctPin) {
        isUnlocking = true;
        playUnlockChime();
        lockIconBox.classList.add('open');

        setTimeout(() => {
            unlockExperience();
        }, 550);
    } else {
        playErrorSound();
        pinIndicators.classList.add('shake');

        setTimeout(() => {
            pinIndicators.classList.remove('shake');
            currentPin = '';
            updatePinIndicators();
        }, 500);
    }
}

function unlockExperience() {
    lockScreen.classList.add('unlocked');
    startExperience();
}

function lockExperienceAgain() {
    isStarted = false;
    audio.pause();
    audio.currentTime = 0;
    currentPin = '';
    isUnlocking = false;
    updatePinIndicators();
    lockIconBox.classList.remove('open');
    lockScreen.classList.remove('unlocked');
    uiControls.classList.add('hidden');
    fgCtx.clearRect(0, 0, width, height);
}

keyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const key = btn.getAttribute('data-key');
        handleKeyPress(key);
    });
});

hintBtn.addEventListener('click', () => {
    playKeyClickSound();
    currentPin = CONFIG.correctPin;
    updatePinIndicators();
    setTimeout(() => {
        verifyPin();
    }, 200);
});

window.addEventListener('keydown', (e) => {
    if (!isStarted && !isUnlocking) {
        if (e.key >= '0' && e.key <= '9') {
            handleKeyPress(e.key);
        } else if (e.key === 'Backspace') {
            handleKeyPress('del');
        }
        return;
    }

    if (e.code === 'Space') {
        e.preventDefault();
        playPauseBtn.click();
    } else if (e.code === 'KeyF') {
        fullscreenBtn.click();
    } else if (e.code === 'KeyR') {
        replayBtn.click();
    }
});

// ==========================================
// Canvas Setup & Resizing
// ==========================================
function resizeCanvases() {
    width = window.innerWidth;
    height = window.innerHeight;
    
    matrixCanvas.width = width;
    matrixCanvas.height = height;
    
    fgCanvas.width = width;
    fgCanvas.height = height;

    initMatrixRain();
    computeWordTimeSlots();
    regenerateGlyphCaches();
    generateHeartParticles();
}

window.addEventListener('resize', resizeCanvases);

// ==========================================
// 1. Pink Cyber Matrix Digital Rain Layer
// ==========================================
const MATRIX_CHARS = '01♥❤LOVE0110♥100101MILK10100101♥4MANNI1010123456789ABCDEF♥';
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
        drops[i] = Math.random() * -100;
        dropSpeeds[i] = 0.75 + Math.random() * 1.5;
        columnChars[i] = MATRIX_CHARS.charAt(Math.floor(Math.random() * MATRIX_CHARS.length));
    }
}

function updateAndDrawMatrixRain() {
    matrixCtx.fillStyle = 'rgba(3, 1, 6, 0.14)';
    matrixCtx.fillRect(0, 0, width, height);

    matrixCtx.font = `bold ${FONT_SIZE}px 'Fira Code', 'Courier New', monospace`;

    for (let i = 0; i < columns; i++) {
        const x = i * FONT_SIZE;
        const y = drops[i] * FONT_SIZE;

        if (Math.random() < 0.06) {
            columnChars[i] = MATRIX_CHARS.charAt(Math.floor(Math.random() * MATRIX_CHARS.length));
        }
        const char = columnChars[i];

        // Draw bright white/hot-pink head character
        matrixCtx.shadowBlur = 10;
        matrixCtx.shadowColor = '#ff2d75';
        matrixCtx.fillStyle = '#ffffff';
        matrixCtx.fillText(char, x, y);

        // Draw trailing character
        if (y > FONT_SIZE) {
            matrixCtx.shadowBlur = 6;
            matrixCtx.shadowColor = '#ff1493';
            matrixCtx.fillStyle = '#ff69b4';
            const prevChar = MATRIX_CHARS.charAt((i * 7 + Math.floor(drops[i])) % MATRIX_CHARS.length);
            matrixCtx.fillText(prevChar, x, y - FONT_SIZE);
        }

        matrixCtx.shadowBlur = 0;
        drops[i] += dropSpeeds[i];

        if (drops[i] * FONT_SIZE > height && Math.random() > 0.975) {
            drops[i] = 0;
            dropSpeeds[i] = 0.75 + Math.random() * 1.5;
        }
    }
}

// ==========================================
// 2. High-Definition Sampler for Countdown & Words
// ==========================================
const offCanvas = document.createElement('canvas');
const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });

let glyphPoints = {
    '3': null,
    '2': null,
    '1': null
};

function sampleTextPoints(text, isDotMatrix = false) {
    const isMobile = width < 600;
    const baseCanvasSize = 800;
    offCanvas.width = baseCanvasSize;
    offCanvas.height = baseCanvasSize;
    offCtx.clearRect(0, 0, baseCanvasSize, baseCanvasSize);

    offCtx.fillStyle = '#ffffff';
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';

    const points = [];

    if (!isDotMatrix) {
        // Countdown (3, 2, 1)
        const countdownSize = isMobile ? 240 : 300;
        offCtx.font = `900 ${countdownSize}px 'Montserrat', sans-serif`;
        offCtx.fillText(text, baseCanvasSize / 2, baseCanvasSize / 2);

        const imgData = offCtx.getImageData(0, 0, baseCanvasSize, baseCanvasSize).data;
        const step = 6;
        for (let y = 0; y < baseCanvasSize; y += step) {
            for (let x = 0; x < baseCanvasSize; x += step) {
                const idx = (y * baseCanvasSize + x) * 4;
                if (imgData[idx + 3] > 128) {
                    points.push({
                        x: x - baseCanvasSize / 2,
                        y: y - baseCanvasSize / 2
                    });
                }
            }
        }
        return { points, text, lines: [text], fontSize: countdownSize, lineSpacing: 0 };
    } else {
        // High-Density LED Matrix Words (Crystal Clear & 100% Legible)
        let fontSize;
        let lineSpacing = 0;
        const lines = text.includes('\n') ? text.split('\n') : [text];

        if (lines.length > 1) {
            fontSize = isMobile ? 75 : 105;
            lineSpacing = fontSize * 1.05;
        } else {
            // Single punchy word / phrase (e.g. "Happy", "Anniversary", "4 Month", "You", "Are", "My", "Love")
            if (text.length <= 4) {
                fontSize = isMobile ? 120 : 160;
            } else {
                fontSize = isMobile ? 85 : 125;
            }
        }

        offCtx.font = `900 ${fontSize}px 'Montserrat', 'Arial Black', sans-serif`;

        // Safeguard: Ensure the longest line never exceeds the canvas width
        const maxTextWidth = baseCanvasSize * 0.82;
        while (fontSize > 36) {
            let maxLineW = 0;
            for (const line of lines) {
                const w = offCtx.measureText(line).width;
                if (w > maxLineW) maxLineW = w;
            }
            if (maxLineW <= maxTextWidth) break;
            fontSize -= 3;
            offCtx.font = `900 ${fontSize}px 'Montserrat', 'Arial Black', sans-serif`;
        }

        if (lines.length === 1) {
            offCtx.fillText(lines[0], baseCanvasSize / 2, baseCanvasSize / 2);
        } else {
            const startY = baseCanvasSize / 2 - ((lines.length - 1) * lineSpacing) / 2;
            lines.forEach((line, i) => {
                offCtx.fillText(line, baseCanvasSize / 2, startY + i * lineSpacing);
            });
        }

        const imgData = offCtx.getImageData(0, 0, baseCanvasSize, baseCanvasSize).data;
        // High density sampling step: 6px on mobile, 7px on desktop for solid, unbroken strokes
        const step = isMobile ? 6 : 7;
        const dotRadius = step * 0.46;

        for (let y = 0; y < baseCanvasSize; y += step) {
            for (let x = 0; x < baseCanvasSize; x += step) {
                const idx = (y * baseCanvasSize + x) * 4;
                if (imgData[idx + 3] > 90) {
                    points.push({
                        x: x - baseCanvasSize / 2,
                        y: y - baseCanvasSize / 2,
                        r: dotRadius
                    });
                }
            }
        }
        return { points, text, lines, fontSize, lineSpacing };
    }
}

function regenerateGlyphCaches() {
    glyphPoints = {
        '3': sampleTextPoints('3', false),
        '2': sampleTextPoints('2', false),
        '1': sampleTextPoints('1', false)
    };

    CONFIG.words.forEach((word, idx) => {
        glyphPoints['word_' + idx] = sampleTextPoints(word, true);
    });
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
    const data = glyphPoints[targetGlyph];
    const points = data ? data.points : [];
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < countdownParticles.length; i++) {
        const p = countdownParticles[i];

        if (isDissolving) {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha = Math.max(0, p.alpha - 0.035);
        } else {
            if (points.length > 0) {
                const pt = points[i % points.length];
                p.targetX = centerX + pt.x;
                p.targetY = centerY + pt.y;

                const time = performance.now() * 0.003;
                const jitterX = Math.sin(time + p.seed) * 1.5;
                const jitterY = Math.cos(time + p.seed * 0.7) * 1.5;

                p.x += (p.targetX + jitterX - p.x) * 0.18;
                p.y += (p.targetY + jitterY - p.y) * 0.18;
                p.alpha = Math.min(0.95, p.alpha + 0.08);

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
    const data = glyphPoints[targetKey];
    if (!data || !data.points || data.points.length === 0) return;

    const points = data.points;
    const centerX = width / 2;
    const centerY = height / 2;

    // Calculate bounding box of sampled points to auto-fit any mobile screen width
    let minX = 0, maxX = 0;
    for (let i = 0; i < points.length; i++) {
        if (points[i].x < minX) minX = points[i].x;
        if (points[i].x > maxX) maxX = points[i].x;
    }
    const glyphWidth = Math.max(1, maxX - minX);
    const maxAllowedWidth = width * 0.88;
    const fitScale = glyphWidth > maxAllowedWidth ? maxAllowedWidth / glyphWidth : 1.0;

    let scale = fitScale;
    let alpha = 1.0;

    // Smooth fade in & subtle punch forward
    if (timeInPhase < 0.20) {
        alpha = Math.min(1.0, timeInPhase / 0.20);
        scale *= 0.88 + (timeInPhase / 0.20) * 0.17;
    } else {
        scale *= 1.0 + Math.sin(timeInPhase * 4) * 0.02;
    }

    // Smooth fade out
    if (timeInPhase > duration - 0.26) {
        alpha = Math.max(0, (duration - timeInPhase) / 0.26);
    }

    fgCtx.save();
    fgCtx.translate(centerX, centerY);
    fgCtx.scale(scale, scale);
    fgCtx.globalAlpha = alpha;

    // 1. CLEARANCE BACKDROP: Soft dark radial vignette directly behind the text
    // Stops falling matrix rain columns from cutting through the letters
    const bgRadius = Math.max(glyphWidth * 0.65, 220);
    const bgGrad = fgCtx.createRadialGradient(0, 0, 10, 0, 0, bgRadius);
    bgGrad.addColorStop(0, 'rgba(3, 1, 6, 0.90)');
    bgGrad.addColorStop(0.68, 'rgba(3, 1, 6, 0.75)');
    bgGrad.addColorStop(1, 'rgba(3, 1, 6, 0)');
    fgCtx.fillStyle = bgGrad;
    fgCtx.beginPath();
    fgCtx.arc(0, 0, bgRadius, 0, Math.PI * 2);
    fgCtx.fill();

    // 2. SUBTLE BACKING TEXT SILHOUETTE:
    // Ensures letter strokes connect flawlessly and are 100% crystal-clear to read!
    fgCtx.font = `900 ${data.fontSize}px 'Montserrat', 'Arial Black', sans-serif`;
    fgCtx.textAlign = 'center';
    fgCtx.textBaseline = 'middle';
    fgCtx.fillStyle = 'rgba(255, 20, 147, 0.22)';
    fgCtx.shadowBlur = 18;
    fgCtx.shadowColor = 'rgba(255, 20, 147, 0.50)';

    if (data.lines.length === 1) {
        fgCtx.fillText(data.text, 0, 0);
    } else {
        const startY = -((data.lines.length - 1) * data.lineSpacing) / 2;
        data.lines.forEach((line, i) => {
            fgCtx.fillText(line, 0, startY + i * data.lineSpacing);
        });
    }

    // 3. CRISP HIGH-DENSITY LED GLOWING DOTS:
    for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        const r = pt.r || 3.2;

        // Glowing outer neon halo
        fgCtx.shadowBlur = 12;
        fgCtx.shadowColor = '#ff1493';
        fgCtx.fillStyle = '#ffffff';

        fgCtx.beginPath();
        fgCtx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
        fgCtx.fill();

        // Extra white-hot core
        fgCtx.shadowBlur = 2;
        fgCtx.shadowColor = '#ffffff';
        fgCtx.fillStyle = '#ffffff';
        fgCtx.beginPath();
        fgCtx.arc(pt.x, pt.y, r * 0.45, 0, Math.PI * 2);
        fgCtx.fill();
    }

    fgCtx.restore();
}

// ==========================================
// 5. Big Fluffy Particle Heart & Text for Milk
// ==========================================
const HEART_PARTICLE_COUNT = 1650;
let heartParticles = [];
let floatingSparks = [];

function getHeartCoord(t, scale) {
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

        const dt = 0.01;
        const pt2 = getHeartCoord(t + dt, baseScale);
        const tx = pt2.x - pt.x;
        const ty = pt2.y - pt.y;
        const len = Math.sqrt(tx * tx + ty * ty) || 1;
        const nx = -ty / len;
        const ny = tx / len;

        const spread = (Math.random() + Math.random() + Math.random() - 1.5) * (isMobile ? 26 : 38);
        const tangentSpread = (Math.random() - 0.5) * 8;

        heartParticles.push({
            baseX: pt.x + nx * spread + tx * tangentSpread,
            baseY: pt.y + ny * spread + ty * tangentSpread,
            size: 1.8 + Math.random() * 3.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 0.35 + Math.random() * 0.65,
            phase: Math.random() * Math.PI * 2,
            speed: 1.2 + Math.random() * 1.8
        });
    }

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

    const timeSinceDrop = Math.max(0, currentTime - CONFIG.timings.heartDropStart);
    const beatFrequency = 1.27; // ~76 BPM acoustic beat of Best Part
    const beatPhase = (timeSinceDrop * beatFrequency) % 1;

    let beatScale = 1.0;
    if (beatPhase < 0.20) {
        beatScale += Math.sin((beatPhase / 0.20) * Math.PI) * 0.08;
    } else if (beatPhase >= 0.24 && beatPhase < 0.42) {
        beatScale += Math.sin(((beatPhase - 0.24) / 0.18) * Math.PI) * 0.045;
    }

    fgCtx.save();
    fgCtx.translate(centerX, centerY);
    fgCtx.scale(beatScale, beatScale);

    const time = performance.now() * 0.003;

    for (let i = 0; i < heartParticles.length; i++) {
        const p = heartParticles[i];
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

    // Floating Sparks
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

    // Center Text: "- I Love ❤️ You Milk -"
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

    updateAndDrawMatrixRain();
    fgCtx.clearRect(0, 0, width, height);

    if (!isStarted) return;

    const t = audio.currentTime;
    const timings = CONFIG.timings;

    if (t >= timings.introStart && t < timings.centerDot1Start) {
        // Pink matrix rain with guitar intro
    }
    else if (t >= timings.centerDot1Start && t < timings.centerDot1End) {
        const progress = (t - timings.centerDot1Start) / (timings.centerDot1End - timings.centerDot1Start);
        drawCenterDot(progress);
    }
    else if (t >= timings.count3Start && t < timings.count2Start) {
        const progress = (t - timings.count3Start) / (timings.count2Start - timings.count3Start);
        updateCountdownParticles('3', progress);
        drawCountdownParticles();
    }
    else if (t >= timings.count2Start && t < timings.count1Start) {
        const progress = (t - timings.count2Start) / (timings.count1Start - timings.count2Start);
        updateCountdownParticles('2', progress);
        drawCountdownParticles();
    }
    else if (t >= timings.count1Start && t < timings.countdownEnd) {
        const progress = (t - timings.count1Start) / (timings.countdownEnd - timings.count1Start);
        updateCountdownParticles('1', progress);
        drawCountdownParticles();
    }
    else if (t >= timings.countdownEnd && t < timings.wordsStart) {
        updateCountdownParticles('1', 1, true);
        drawCountdownParticles();
    }
    else if (t >= timings.wordsStart && t < timings.wordsEnd) {
        for (let i = 0; i < wordTimeSlots.length; i++) {
            const slot = wordTimeSlots[i];
            if (t >= slot.start && t < slot.end) {
                drawDotMatrixWord('word_' + i, t - slot.start, slot.duration);
                break;
            }
        }
    }
    else if (t >= timings.wordsEnd && t < timings.heartDropStart) {
        // Transition beat right before the chorus beat drop
    }
    else if (t >= timings.heartDropStart) {
        updateAndDrawHeart(t);
    }
}

// ==========================================
// 8. Experience Controls & UI
// ==========================================
function startExperience() {
    isStarted = true;
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

// Lock Screen Again (if button exists)
if (lockAgainBtn) {
    lockAgainBtn.addEventListener('click', lockExperienceAgain);
}

// Fullscreen
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
        document.exitFullscreen();
    }
});

// Audio Loop
audio.addEventListener('ended', () => {
    audio.currentTime = 0;
    audio.play();
});

// ==========================================
// 9. Customization Modal Logic (Optional)
// ==========================================
if (editBtn) {
    editBtn.addEventListener('click', () => {
    inputHeartText.value = CONFIG.heartText;
    inputWord1.value = CONFIG.word1;
    inputWord2.value = CONFIG.word2;
    inputWord3.value = CONFIG.word3;
    inputWord4.value = CONFIG.word4;
    selectSong.value = CONFIG.currentSong;

    editModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
    editModal.classList.add('hidden');
    scheduleHideControls();
});

saveModalBtn.addEventListener('click', () => {
    CONFIG.heartText = inputHeartText.value.trim() || 'I Love ❤️ You Milk';
    CONFIG.word1 = inputWord1.value.trim() || 'You';
    CONFIG.word2 = inputWord2.value.trim() || 'Are';
    CONFIG.word3 = inputWord3.value.trim() || 'My';
    CONFIG.word4 = inputWord4.value.trim() || 'Love';
    
    const newSong = selectSong.value;
    if (newSong !== CONFIG.currentSong) {
        CONFIG.currentSong = newSong;
        localStorage.setItem('matrix_song', newSong);
        audio.src = newSong;
        if (isStarted) {
            audio.currentTime = 0;
            audio.play();
        }
    }

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
    inputHeartText.value = 'I Love ❤️ You Milk';
    inputWord1.value = 'You';
    inputWord2.value = 'Are';
    inputWord3.value = 'My';
    inputWord4.value = 'Love';
    selectSong.value = 'audio.m4a';
});
}

// ==========================================
// Initialization
// ==========================================
resizeCanvases();
initMatrixRain();
initCountdownParticles();
generateHeartParticles();
animate();
