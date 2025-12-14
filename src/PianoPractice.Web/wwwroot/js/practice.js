import { AudioScheduler } from './audio-scheduler.js';

class FingerPractice {
    constructor() {
        // Note sequence for one up-down rep: C D E F G F E D C
        this.notes = ['C', 'D', 'E', 'F', 'G', 'F', 'E', 'D', 'C'];
        this.noteIndex = 0;

        // Finger numbers for right hand (thumb=1 on C)
        this.rightHandFingers = { 'C': 1, 'D': 2, 'E': 3, 'F': 4, 'G': 5 };
        // Finger numbers for left hand (pinky=5 on C)
        this.leftHandFingers = { 'C': 5, 'D': 4, 'E': 3, 'F': 2, 'G': 1 };

        this.hand = 'right';
        this.currentHand = 'right';
        this.currentRep = 0;
        this.totalReps = 5;

        this.initUI();
        this.initScheduler();
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
        this.repsInput.addEventListener('change', (e) => this.totalReps = parseInt(e.target.value) || 5);
        this.bpmInput.addEventListener('change', (e) => {
            const bpm = Math.max(30, Math.min(200, parseInt(e.target.value) || 60));
            this.scheduler.setBpm(bpm);
        });

        // Keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.toggle();
            }
        });

        this.updateFingerNumbers();
    }

    initScheduler() {
        this.scheduler = new AudioScheduler({
            bpm: 60,
            onBeat: (time) => this.onBeat(time),
            onStop: () => this.onStop()
        });
    }

    onBeat(time) {
        const note = this.notes[this.noteIndex];

        // Play note sound
        this.scheduler.playNote(time, note, 4);

        // Schedule visual update with current state
        const scheduledNoteIndex = this.noteIndex;
        const scheduledRep = this.currentRep;
        const scheduledHand = this.currentHand;

        this.scheduler.scheduleCallback(time, () => {
            this.updateDisplay(scheduledNoteIndex, scheduledRep, scheduledHand);
        });

        // Advance to next note
        return this.advanceNote();
    }

    onStop() {
        this.playBtn.innerHTML = '&#9654;';
        this.playBtn.classList.remove('playing');

        // Reset visual
        const keys = this.keyboard.querySelectorAll('.key');
        keys.forEach(key => key.classList.remove('active'));
        this.arrowUp.classList.remove('active');
        this.arrowDown.classList.remove('active');
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
                    return false; // Stop the scheduler
                }
            }
        }
        return true; // Continue
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

    complete() {
        this.scheduler.stop();
        this.progressFill.style.width = '100%';
        this.progressText.textContent = 'Complete!';
        this.completeMessage.classList.add('show');
        this.currentRepDisplay.textContent = `${this.totalReps}/${this.totalReps}`;
    }

    start() {
        // Reset state
        this.scheduler.setBpm(parseInt(this.bpmInput.value) || 60);
        this.totalReps = parseInt(this.repsInput.value) || 5;
        this.hand = this.handSelect.value;
        this.currentHand = this.hand === 'left' ? 'left' : 'right';
        this.currentRep = 0;
        this.noteIndex = 0;

        this.updateFingerNumbers();
        this.completeMessage.classList.remove('show');

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
    window.practice = new FingerPractice();
});
