class FingerPractice {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.bpm = 60;
        this.reps = 5;
        this.hand = 'right'; // 'right', 'left', or 'both'

        // Note sequence for one up-down rep: C D E F G F E D C
        this.notes = ['C', 'D', 'E', 'F', 'G', 'F', 'E', 'D', 'C'];
        this.noteIndex = 0;

        // Finger numbers for right hand (thumb=1 on C)
        this.rightHandFingers = { 'C': 1, 'D': 2, 'E': 3, 'F': 4, 'G': 5 };
        // Finger numbers for left hand (pinky=5 on C)
        this.leftHandFingers = { 'C': 5, 'D': 4, 'E': 3, 'F': 2, 'G': 1 };

        this.currentRep = 0;
        this.currentHand = 'right';
        this.totalReps = 5;

        // Scheduling
        this.nextNoteTime = 0;
        this.scheduleAheadTime = 0.1;
        this.lookahead = 25;
        this.timerID = null;

        this.initUI();
    }

    initUI() {
        this.playBtn = document.getElementById('playBtn');
        this.handSelect = document.getElementById('handSelect');
        this.repsInput = document.getElementById('repsInput');
        this.bpmInput = document.getElementById('bpmInput');
        this.keyboard = document.getElementById('keyboard');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.completeMessage = document.getElementById('completeMessage');
        this.currentHandDisplay = document.getElementById('currentHand');
        this.currentNoteDisplay = document.getElementById('currentNote');
        this.currentFingerDisplay = document.getElementById('currentFinger');
        this.currentRepDisplay = document.getElementById('currentRep');
        this.arrowUp = document.getElementById('arrowUp');
        this.arrowDown = document.getElementById('arrowDown');

        this.playBtn.addEventListener('click', () => this.toggle());
        this.handSelect.addEventListener('change', (e) => this.hand = e.target.value);
        this.repsInput.addEventListener('change', (e) => this.reps = parseInt(e.target.value) || 5);
        this.bpmInput.addEventListener('change', (e) => this.bpm = Math.max(30, Math.min(200, parseInt(e.target.value) || 60)));

        // Keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.toggle();
            }
        });

        this.updateFingerNumbers();
    }

    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    updateFingerNumbers() {
        const fingers = this.currentHand === 'left' ? this.leftHandFingers : this.rightHandFingers;
        const keys = this.keyboard.querySelectorAll('.key');
        keys.forEach(key => {
            const note = key.dataset.note;
            const fingerNum = key.querySelector('.finger-num');
            fingerNum.textContent = fingers[note];
        });
    }

    highlightKey(note) {
        const keys = this.keyboard.querySelectorAll('.key');
        keys.forEach(key => {
            key.classList.remove('active');
            if (key.dataset.note === note) {
                key.classList.add('active');
            }
        });
    }

    updateDisplay(noteIndex, rep, hand) {
        const note = this.notes[noteIndex];
        const fingers = hand === 'left' ? this.leftHandFingers : this.rightHandFingers;
        const finger = fingers[note];

        this.currentHandDisplay.textContent = hand === 'right' ? 'Right' : 'Left';
        this.currentNoteDisplay.textContent = note;
        this.currentFingerDisplay.textContent = finger;
        this.currentRepDisplay.textContent = `${rep}/${this.totalReps}`;

        this.highlightKey(note);

        // Direction: first half (0-4) is going up, second half (5-8) is going down
        const goingUp = noteIndex <= 4;
        this.arrowUp.classList.toggle('active', goingUp);
        this.arrowDown.classList.toggle('active', !goingUp);

        this.updateProgress(noteIndex, rep, hand);
    }

    updateProgress(noteIndex, rep, hand) {
        const handsToPlay = this.hand === 'both' ? 2 : 1;
        const totalNotes = this.totalReps * this.notes.length * handsToPlay;
        const handOffset = (this.hand === 'both' && hand === 'left')
            ? this.totalReps * this.notes.length
            : 0;
        const completedNotes = handOffset + (rep * this.notes.length) + noteIndex;

        const percent = (completedNotes / totalNotes) * 100;
        this.progressFill.style.width = `${percent}%`;

        if (this.hand === 'both') {
            this.progressText.textContent = `${hand === 'right' ? 'Right' : 'Left'} hand - Rep ${rep + 1} of ${this.totalReps}`;
        } else {
            this.progressText.textContent = `Rep ${rep + 1} of ${this.totalReps}`;
        }
    }

    playClick(time, note) {
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Map notes to frequencies (octave 4)
        const frequencies = {
            'C': 261.63,
            'D': 293.66,
            'E': 329.63,
            'F': 349.23,
            'G': 392.00
        };

        osc.frequency.value = frequencies[note];
        osc.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

        osc.start(time);
        osc.stop(time + 0.3);
    }

    scheduleNote(time) {
        const note = this.notes[this.noteIndex];

        // Schedule audio
        this.playClick(time, note);

        // Schedule UI update - capture current state without modifying instance
        const currentTime = this.audioContext.currentTime;
        const delay = (time - currentTime) * 1000;

        const scheduledNoteIndex = this.noteIndex;
        const scheduledRep = this.currentRep;
        const scheduledHand = this.currentHand;

        setTimeout(() => {
            if (this.isPlaying) {
                this.updateDisplay(scheduledNoteIndex, scheduledRep, scheduledHand);
            }
        }, Math.max(0, delay));
    }

    advanceNote() {
        this.noteIndex++;

        // Completed one rep (9 notes: C D E F G F E D C)
        if (this.noteIndex >= this.notes.length) {
            this.noteIndex = 0;
            this.currentRep++;

            // Completed all reps for current hand
            if (this.currentRep >= this.totalReps) {
                // If doing both hands and just finished right, switch to left
                if (this.hand === 'both' && this.currentHand === 'right') {
                    this.currentHand = 'left';
                    this.currentRep = 0;
                    this.updateFingerNumbers();
                } else {
                    // All done!
                    this.complete();
                    return false;
                }
            }
        }
        return true;
    }

    scheduler() {
        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.nextNoteTime);

            const secondsPerBeat = 60.0 / this.bpm;
            this.nextNoteTime += secondsPerBeat;

            if (!this.advanceNote()) {
                return; // Practice complete
            }
        }
    }

    start() {
        this.initAudio();

        // Reset state
        this.bpm = parseInt(this.bpmInput.value) || 60;
        this.totalReps = parseInt(this.repsInput.value) || 5;
        this.hand = this.handSelect.value;
        this.currentHand = this.hand === 'left' ? 'left' : 'right';
        this.currentRep = 0;
        this.noteIndex = 0;

        this.updateFingerNumbers();
        this.completeMessage.classList.remove('show');

        this.isPlaying = true;
        this.nextNoteTime = this.audioContext.currentTime;
        this.playBtn.innerHTML = '&#9632;';
        this.playBtn.classList.add('playing');

        this.timerID = setInterval(() => this.scheduler(), this.lookahead);
    }

    stop() {
        this.isPlaying = false;
        this.playBtn.innerHTML = '&#9654;';
        this.playBtn.classList.remove('playing');

        if (this.timerID) {
            clearInterval(this.timerID);
            this.timerID = null;
        }

        // Reset visual
        const keys = this.keyboard.querySelectorAll('.key');
        keys.forEach(key => key.classList.remove('active'));
        this.arrowUp.classList.remove('active');
        this.arrowDown.classList.remove('active');
    }

    complete() {
        this.stop();
        this.progressFill.style.width = '100%';
        this.progressText.textContent = 'Complete!';
        this.completeMessage.classList.add('show');
        this.currentRepDisplay.textContent = `${this.totalReps}/${this.totalReps}`;
    }

    toggle() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.start();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.practice = new FingerPractice();
});
