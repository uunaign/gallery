const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let isPlaying = false;
let currentStep = 0;
let nextStepTime = 0.0;
const scheduleAheadTime = 0.1;
const lookahead = 25.0;

const drumTracks = ['KICK', 'SNARE', 'HIHAT', 'PERC'];
const pianoNotes = [261.63, 329.63, 392.00, 440.00]; 
const totalTracks = drumTracks.length + pianoNotes.length;
const gridState = Array(totalTracks).fill().map(() => Array(16).fill(false));

function playSound(tIdx, time) {
    const gain = audioCtx.createGain();
    const osc = audioCtx.createOscillator();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (tIdx === 0) { 
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
        gain.gain.setValueAtTime(1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
        osc.start(time); osc.stop(time + 0.5);
    } else if (tIdx === 1) { 
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(250, time);
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        osc.start(time); osc.stop(time + 0.2);
    } else if (tIdx === 2) {
        osc.type = 'square';
        osc.frequency.setValueAtTime(10000, time);
        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
        osc.start(time); osc.stop(time + 0.05);
    } else if (tIdx === 3) {
        osc.frequency.setValueAtTime(800, time);
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        osc.start(time); osc.stop(time + 0.1);
    } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(pianoNotes[tIdx-4], time);
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.8);
        osc.start(time); osc.stop(time + 0.8);
    }
}

const gridContainer = document.getElementById('sequencer-grid');
const allTrackNames = [...drumTracks, 'C', 'E', 'G', 'A'];

allTrackNames.forEach((name, tIdx) => {
    const row = document.createElement('div');
    row.className = tIdx >= 4 ? 'track piano-track' : 'track';
    row.innerHTML = `<div class="track-label">${name}</div>`;
    const stepsDiv = document.createElement('div');
    stepsDiv.className = 'steps';
    for (let sIdx = 0; sIdx < 16; sIdx++) {
        const step = document.createElement('div');
        step.className = 'step';
        step.dataset.step = sIdx;
        step.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            gridState[tIdx][sIdx] = !gridState[tIdx][sIdx];
            step.classList.toggle('active');
            if (!isPlaying && gridState[tIdx][sIdx]) {
                if (audioCtx.state === 'suspended') audioCtx.resume();
                playSound(tIdx, audioCtx.currentTime);
            }
        });
        stepsDiv.appendChild(step);
    }
    row.appendChild(stepsDiv);
    gridContainer.appendChild(row);
});

function scheduler() {
    while (nextStepTime < audioCtx.currentTime + scheduleAheadTime) {
        for (let i = 0; i < totalTracks; i++) {
            if (gridState[i][currentStep]) playSound(i, nextStepTime);
        }

        const step = currentStep;
        const time = nextStepTime;
        setTimeout(() => {
            document.querySelectorAll('.step').forEach(s => s.classList.remove('current'));
            document.querySelectorAll(`.step[data-step="${step}"]`).forEach(s => s.classList.add('current'));
        }, (time - audioCtx.currentTime) * 1000);
        
        const bpm = document.getElementById('bpm-input').value;
        nextStepTime += (60.0 / bpm) / 4;
        currentStep = (currentStep + 1) % 16;
    }
    if (isPlaying) setTimeout(scheduler, lookahead);
}

document.getElementById('play-btn').onclick = function() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    isPlaying = !isPlaying;
    this.innerText = isPlaying ? 'STOP' : 'PLAY';
    if (isPlaying) {
        currentStep = 0;
        nextStepTime = audioCtx.currentTime;
        scheduler();
    }
};

document.getElementById('clear-btn').onclick = () => {
    gridState.forEach(row => row.fill(false));
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
};