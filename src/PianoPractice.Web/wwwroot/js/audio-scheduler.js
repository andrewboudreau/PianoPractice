/**
 * AudioScheduler - Precise timing for musical applications using Web Audio API
 *
 * Uses the lookahead scheduler pattern to ensure accurate timing.
 * JavaScript's setInterval can drift, but Web Audio has a high-precision clock.
 */
export class AudioScheduler {
    constructor(options = {}) {
        this.audioContext = null;
        this.isPlaying = false;
        this.bpm = options.bpm || 120;

        // Scheduling parameters
        this.scheduleAheadTime = options.scheduleAheadTime || 0.1; // seconds
        this.lookahead = options.lookahead || 25; // milliseconds

        this.nextNoteTime = 0;
        this.timerID = null;

        // Callback for each beat
        this.onBeat = options.onBeat || null;

        // Callback when stopped
        this.onStop = options.onStop || null;
    }

    /**
     * Initialize or resume the audio context
     * Must be called from a user gesture (click/keypress)
     */
    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        return this.audioContext;
    }

    /**
     * Get the current audio context time
     */
    get currentTime() {
        return this.audioContext ? this.audioContext.currentTime : 0;
    }

    /**
     * Set BPM (beats per minute)
     */
    setBpm(bpm) {
        this.bpm = Math.max(30, Math.min(300, bpm));
    }

    /**
     * Get seconds per beat at current BPM
     */
    get secondsPerBeat() {
        return 60.0 / this.bpm;
    }

    /**
     * Play a click/tick sound
     * @param {number} time - When to play (audio context time)
     * @param {number} frequency - Pitch in Hz
     * @param {number} duration - Length in seconds
     * @param {number} volume - 0 to 1
     */
    playTone(time, frequency = 800, duration = 0.05, volume = 0.5) {
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        osc.frequency.value = frequency;
        osc.type = 'sine';

        gainNode.gain.setValueAtTime(volume, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.start(time);
        osc.stop(time + duration);
    }

    /**
     * Play a note with piano-like envelope
     * @param {number} time - When to play
     * @param {string} note - Note name (C, D, E, F, G, A, B)
     * @param {number} octave - Octave number (default 4)
     */
    playNote(time, note, octave = 4) {
        const frequencies = {
            'C': 261.63, 'D': 293.66, 'E': 329.63, 'F': 349.23,
            'G': 392.00, 'A': 440.00, 'B': 493.88
        };

        // Adjust for octave (octave 4 is base)
        const baseFreq = frequencies[note.toUpperCase()];
        if (!baseFreq) return;

        const freq = baseFreq * Math.pow(2, octave - 4);
        this.playTone(time, freq, 0.3, 0.3);
    }

    /**
     * Schedule a callback synchronized with audio time
     * @param {number} audioTime - The audio context time when this should fire
     * @param {function} callback - Function to call
     */
    scheduleCallback(audioTime, callback) {
        const delay = (audioTime - this.audioContext.currentTime) * 1000;
        setTimeout(() => {
            if (this.isPlaying) {
                callback();
            }
        }, Math.max(0, delay));
    }

    /**
     * Internal scheduler - called repeatedly to schedule upcoming beats
     */
    _scheduler() {
        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            if (this.onBeat) {
                // Returns false to stop, or an object with { continue: false } to stop
                const result = this.onBeat(this.nextNoteTime, this);
                if (result === false || (result && result.continue === false)) {
                    this.stop();
                    return;
                }
            }
            this.nextNoteTime += this.secondsPerBeat;
        }
    }

    /**
     * Start the scheduler
     */
    start() {
        this.initAudio();
        this.isPlaying = true;
        this.nextNoteTime = this.audioContext.currentTime;
        this.timerID = setInterval(() => this._scheduler(), this.lookahead);
    }

    /**
     * Stop the scheduler
     */
    stop() {
        this.isPlaying = false;
        if (this.timerID) {
            clearInterval(this.timerID);
            this.timerID = null;
        }
        if (this.onStop) {
            this.onStop();
        }
    }

    /**
     * Toggle play/stop
     */
    toggle() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.start();
        }
    }
}

// Note frequencies for reference
export const NOTE_FREQUENCIES = {
    'C': 261.63, 'C#': 277.18, 'Db': 277.18,
    'D': 293.66, 'D#': 311.13, 'Eb': 311.13,
    'E': 329.63,
    'F': 349.23, 'F#': 369.99, 'Gb': 369.99,
    'G': 392.00, 'G#': 415.30, 'Ab': 415.30,
    'A': 440.00, 'A#': 466.16, 'Bb': 466.16,
    'B': 493.88
};
