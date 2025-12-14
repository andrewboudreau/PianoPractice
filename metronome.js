class Metronome {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.bpm = 120;
        this.beatsPerMeasure = 4;
        this.currentBeat = 0;
        this.nextNoteTime = 0;
        this.scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)
        this.lookahead = 25; // How often to call scheduler (ms)
        this.timerID = null;

        this.initUI();
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
        this.bpmUp.addEventListener('click', () => this.setBpm(this.bpm + 1));
        this.bpmDown.addEventListener('click', () => this.setBpm(this.bpm - 1));
        this.timeSig.addEventListener('change', (e) => this.setTimeSignature(parseInt(e.target.value)));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.toggle();
            } else if (e.code === 'ArrowUp') {
                this.setBpm(this.bpm + 1);
            } else if (e.code === 'ArrowDown') {
                this.setBpm(this.bpm - 1);
            }
        });
    }

    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    setBpm(newBpm) {
        this.bpm = Math.max(30, Math.min(240, newBpm));
        this.bpmDisplay.textContent = this.bpm;
        this.bpmSlider.value = this.bpm;
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

    // Create a click sound using oscillator
    playClick(time, isDownbeat) {
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Higher pitch for downbeat
        osc.frequency.value = isDownbeat ? 1000 : 800;
        osc.type = 'sine';

        // Volume envelope for a sharp click
        gainNode.gain.setValueAtTime(0.5, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

        osc.start(time);
        osc.stop(time + 0.05);
    }

    scheduleNote(beatNumber, time) {
        // Schedule the audio
        this.playClick(time, beatNumber === 0);

        // Schedule UI update (visual feedback)
        const currentTime = this.audioContext.currentTime;
        const delay = (time - currentTime) * 1000;
        setTimeout(() => {
            if (this.isPlaying) {
                this.highlightBeat(beatNumber);
            }
        }, Math.max(0, delay));
    }

    scheduler() {
        // Schedule notes while there are notes to schedule within the lookahead window
        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.currentBeat, this.nextNoteTime);
            this.advanceNote();
        }
    }

    advanceNote() {
        // Advance to next beat
        const secondsPerBeat = 60.0 / this.bpm;
        this.nextNoteTime += secondsPerBeat;

        // Increment beat, wrap around at end of measure
        this.currentBeat = (this.currentBeat + 1) % this.beatsPerMeasure;
    }

    start() {
        this.initAudio();
        this.isPlaying = true;
        this.currentBeat = 0;
        this.nextNoteTime = this.audioContext.currentTime;
        this.playBtn.innerHTML = '&#9632;'; // Stop symbol
        this.playBtn.classList.add('playing');

        // Start the scheduler
        this.timerID = setInterval(() => this.scheduler(), this.lookahead);
    }

    stop() {
        this.isPlaying = false;
        this.playBtn.innerHTML = '&#9654;'; // Play symbol
        this.playBtn.classList.remove('playing');

        if (this.timerID) {
            clearInterval(this.timerID);
            this.timerID = null;
        }

        // Reset visual
        const dots = this.beatIndicator.querySelectorAll('.beat-dot');
        dots.forEach(dot => dot.classList.remove('active', 'downbeat'));
    }

    toggle() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.start();
        }
    }
}

// Initialize metronome when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.metronome = new Metronome();
});
