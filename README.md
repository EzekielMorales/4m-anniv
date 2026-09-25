# 💖 4-Month Anniversary Web App for Milk

A private, romantic interactive web experience built to celebrate our 4-month anniversary with my girlfriend, **Milk** 🌸. 

Built with pure vanilla HTML5, CSS3, and JavaScript — featuring a dark cyber neon pink matrix theme, particle animations, and a retro vinyl record player synchronized to **"Best Part"** by Daniel Caesar ft. H.E.R.

🌐 **Live Demo:** [https://ezekielmorales.github.io/4m-anniv/](https://ezekielmorales.github.io/4m-anniv/)  
🔑 **Passcode:** `2405` *(or tap the hint button on screen)*

---

## ✨ The Experience

1. **🔐 Voice Vault Passcode Screen**
   - Cyber Neon Pink padlock with a heart cutout and playful key sounds.
   - Enter `2405` to unlock the surprise.

2. **🌧️ Neon Pink Matrix Rain & Countdown**
   - The song *"Best Part"* begins playing right from the acoustic guitar intro.
   - Falling cyber matrix rain with hidden words (`MILK`, `LOVE`, `♥`, `4M`).
   - Stardust particle countdown: `3` ➔ `2` ➔ `1`.

3. **💡 LED Dot Matrix Lyric Words**
   - Synchronized with Verse 1 vocals:
     `Happy` ➔ `Anniversary` ➔ `4 Month` ➔ `You` ➔ `Are` ➔ `My` ➔ `Love`
   - High-density LED dots with backdrop shadow vignettes for 100% crisp legibility on phones and desktop screens.

4. **💓 Beating Particle Heart**
   - Over 1,600 fluffy glowing particles pulse to the acoustic rhythm.
   - Glows with the message: `- I Love ❤️ You Milk -`.
   - After a few seconds, an interactive floating button invites her to proceed: `[ 💿 ไปฟังแผ่นเสียงต่อกันนะ ➔ ]`.

5. **💿 "Our Record" Vinyl Turntable Player**
   - Smoothly transitions **without stopping or interrupting the music**.
   - Realistic spinning vinyl disc with Milk's photo on the center label.
   - Tonearm needle drops onto the grooves, accompanied by pulsing ambient ripples.
   - **Interactive scrubber bar:** Tap or drag backwards/forwards anytime to replay your favorite parts of the full 03:29 track.
   - Replay button & Return to Heart button to relive the animations anytime.

---

## 🚀 Running Locally

No complicated setup or heavy frameworks needed. Just clone and run!

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine (v16+ recommended).

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ezekielmorales/4m-anniv.git
   cd 4m-anniv
   ```

2. **Start the local server:**
   ```bash
   npm start
   ```
   *(or run `node server.js` directly)*

3. **Open in your browser:**
   Go to [http://localhost:3000](http://localhost:3000)

> 💡 **Tip:** You can also use any static web server (such as Python's `python -m http.server 3000` or VS Code's Live Server extension). `server.js` is included because it supports HTTP `Range` headers for smooth audio scrubbing.

---

## 🛠️ Tech Stack

- **HTML5 & CSS3:** Responsive layout, glassmorphism UI, `@keyframes` neon glows.
- **JavaScript (ES6+):** Pure vanilla JS, no external libraries.
- **HTML5 Canvas API:** Dual-layer hardware-accelerated particle engine (Matrix rain + LED typography + parametric heart).
- **Web Audio API & HTML5 Audio:** Responsive audio playback and custom touch/mouse drag scrubber.
- **Node.js:** Lightweight built-in server supporting byte-range audio streaming.

---

## 📁 Project Structure

```text
4m-anniv/
├── index.html        # Main HTML structure (Passcode, Canvases, Vinyl Player)
├── style.css         # Cyber neon styles, animations & responsive layout
├── script.js         # Particle math, timings, audio sync & turntable logic
├── server.js         # Lightweight local dev server with audio range streaming
├── audio.mp3         # "Best Part" - Daniel Caesar ft. H.E.R. (Full 03:29 track)
├── milk-photo.png    # Milk's photo on the vinyl turntable label
└── README.md         # Project documentation
```

---

Made with 💖 for Milk. Happy 4th Month Anniversary!