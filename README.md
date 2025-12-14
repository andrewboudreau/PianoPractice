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

## Running Locally

Just open `index.html` in your browser. No build step or server required.

## Tech Stack

- Vanilla JavaScript
- Web Audio API
- No dependencies
