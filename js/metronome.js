import { AudioScheduler } from './audio-scheduler.js';

class Metronome {
    constructor() {
        this.beatsPerMeasure = 4;
        this.currentBeat = 0;

        this.initUI();
        this.initScheduler();
    }

    initUI() {
        this.playBtn = document.getElementById('playBtn');
        this.bpmDisplay = document.getElementById('bpmDisplay');
        this.bpmSlider = document.getElementById('bpmSlider');
        this.bpmUp = document.getElementById('bpmUp');
        this.bpmDown = document.getElementById('bpmDown');
        this.timeSig = document.getElementById('timeSig');
        this.beatIndicator = document.getElementById('beatIndicator');

        this.playBtn.addEventListener('click', () => this.toggle());
        this.bpmSlider.addEventListener('input', (e) => this.setBpm(parseInt(e.target.value)));
        this.bpmUp.addEventListener('click', () => this.setBpm(this.scheduler.bpm + 1));
        this.bpmDown.addEventListener('click', () => this.setBpm(this.scheduler.bpm - 1));
        this.timeSig.addEventListener('change', (e) => this.setTimeSignature(parseInt(e.target.value)));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.toggle();
            } else if (e.code === 'ArrowUp') {
                this.setBpm(this.scheduler.bpm + 1);
            } else if (e.code === 'ArrowDown') {
                this.setBpm(this.scheduler.bpm - 1);
            }
        });
    }

    initScheduler() {
        this.scheduler = new AudioScheduler({
            bpm: 120,
            onBeat: (time) => this.onBeat(time),
            onStop: () => this.onStop()
        });
    }

    onBeat(time) {
        const isDownbeat = this.currentBeat === 0;

        // Play click sound
        this.scheduler.playTone(time, isDownbeat ? 1000 : 800, 0.05, 0.5);

        // Schedule visual update
        const beatToHighlight = this.currentBeat;
        this.scheduler.scheduleCallback(time, () => {
            this.highlightBeat(beatToHighlight);
        });

        // Advance beat
        this.currentBeat = (this.currentBeat + 1) % this.beatsPerMeasure;
    }

    onStop() {
        this.playBtn.innerHTML = '&#9654;';
        this.playBtn.classList.remove('playing');

        // Reset visual
        const dots = this.beatIndicator.querySelectorAll('.beat-dot');
        dots.forEach(dot => dot.classList.remove('active', 'downbeat'));
    }

    setBpm(newBpm) {
        const bpm = Math.max(30, Math.min(240, newBpm));
        this.scheduler.setBpm(bpm);
        this.bpmDisplay.textContent = bpm;
        this.bpmSlider.value = bpm;
    }

    setTimeSignature(beats) {
        this.beatsPerMeasure = beats;
        this.currentBeat = 0;
        this.updateBeatIndicator();
    }

    updateBeatIndicator() {
        this.beatIndicator.innerHTML = '';
        for (let i = 0; i < this.beatsPerMeasure; i++) {
            const dot = document.createElement('div');
            dot.className = 'beat-dot';
            this.beatIndicator.appendChild(dot);
        }
    }

    highlightBeat(beatNumber) {
        const dots = this.beatIndicator.querySelectorAll('.beat-dot');
        dots.forEach((dot, i) => {
            dot.classList.remove('active', 'downbeat');
            if (i === beatNumber) {
                dot.classList.add('active');
                if (i === 0) {
                    dot.classList.add('downbeat');
                }
            }
        });
    }

    start() {
        this.currentBeat = 0;
        this.scheduler.start();
        this.playBtn.innerHTML = '&#9632;';
        this.playBtn.classList.add('playing');
    }

    stop() {
        this.scheduler.stop();
    }

    toggle() {
        if (this.scheduler.isPlaying) {
            this.stop();
        } else {
            this.start();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.metronome = new Metronome();
});
