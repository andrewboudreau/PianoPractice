# Piano Practice

A web-based piano practice system with tools to help you improve.

**Live demo:** https://andrewboudreau.github.io/PianoPractice/

## Tools

### Metronome

A precise metronome built with the Web Audio API.

**Features:**
- BPM range: 30-240
- Time signatures: 4/4, 3/4, 2/4, 6/8
- Visual beat indicator with downbeat accent
- Keyboard shortcuts: Space (play/stop), Arrow Up/Down (adjust BPM)

**Why Web Audio API?**

JavaScript's `setInterval` can drift by 10-50ms, which is noticeable when playing music. The Web Audio API provides a high-precision clock, and the metronome uses a lookahead scheduler to ensure accurate timing.

### 5-Finger Practice

Guided finger exercises on the C-D-E-F-G position, synced to a metronome.

**Features:**
- Visual keyboard showing which key to play
- Finger number display for correct technique
- Configurable hand (right, left, or both)
- Adjustable reps and BPM
- Progress tracking
- Audio feedback plays the note pitch

**Exercise pattern:** C → D → E → F → G → F → E → D → C (one rep)

## Running Locally

Just open `index.html` in your browser. No build step or server required.

## Tech Stack

- Vanilla JavaScript
- Web Audio API
- No dependencies
