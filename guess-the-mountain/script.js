const mountainsData = [
    { name: "Patagonia", options: ["Patagonia", "Alpes", "Andes", "Apalaches"] },
    { name: "Dolomitas", options: ["Dolomitas", "Urales", "Cáucaso", "Atlas"] },
    { name: "Matterhorn", options: ["Matterhorn", "Mont Blanc", "Jungfrau", "Elbrús"] },
    { name: "Fuji", options: ["Fuji", "Kailash", "Teide", "Kilimanjaro"] },
    { name: "El Capitan", options: ["El Capitan", "Half Dome", "Zion", "Denali"] },
    { name: "Everest", options: ["Everest", "K2", "Lhotse", "Makalu"] },
    { name: "Kilimanjaro", options: ["Kilimanjaro", "Kenia", "Vinson", "Meru"] },
    { name: "Table Mountain", options: ["Table Mountain", "Lion's Head", "Uluru", "Peñón"] },
    { name: "Denali", options: ["Denali", "Logan", "Rainier", "Mauna Kea"] },
    { name: "Kirkjufell", options: ["Kirkjufell", "Hekla", "Katla", "Vestrahorn"] }
];

let gameQuestions = [];
let currentIdx = 0;
let score = 0;
let startTime;
let timerInterval;

const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

const startBtn = document.getElementById('start-btn');

startBtn.addEventListener('pointerdown', function(e) {
    e.preventDefault();
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('countdown-screen').classList.remove('hidden');
    
    gameQuestions = shuffle(mountainsData).map(q => ({
        ...q,
        options: shuffle(q.options)
    }));
    
    let count = 3;
    const cdLabel = document.getElementById('countdown-number');
    const interval = setInterval(() => {
        count--;
        if (count === 0) {
            clearInterval(interval);
            startGame();
        } else {
            cdLabel.innerText = count;
        }
    }, 1000);
});

function startGame() {
    document.getElementById('countdown-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 100);
    loadQuestion();
}

function updateTimer() {
    const diff = (Date.now() - startTime) / 1000;
    const m = Math.floor(diff / 60).toString().padStart(2, '0');
    const s = Math.floor(diff % 60).toString().padStart(2, '0');
    document.getElementById('timer-val').innerText = `${m}:${s}`;
}

function loadQuestion() {
    const q = gameQuestions[currentIdx];
    const imgElement = document.getElementById('mountain-img');
    
    imgElement.style.opacity = '0';
    

    const fileName = q.name.toLowerCase().replace(/\s+/g, '-') + ".jpg";
    
    imgElement.src = `assets/mountains/${fileName}?v=${Date.now()}`;
    
    imgElement.onload = () => {
        imgElement.style.opacity = '1';
    };

    imgElement.onerror = () => {
        console.error("Error cargando:", fileName);
    };

    document.getElementById('current-q').innerText = currentIdx + 1;
    const grid = document.getElementById('options-grid');
    grid.innerHTML = '';
    
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        
        btn.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            if (opt === q.name) score++;
            currentIdx++;
            if (currentIdx < gameQuestions.length) loadQuestion();
            else finishGame();
        });
        grid.appendChild(btn);
    });
}

function finishGame() {
    clearInterval(timerInterval);
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');
    
    const finalTime = document.getElementById('timer-val').innerText;
    document.getElementById('final-score').innerText = score;
    document.getElementById('final-time').innerText = finalTime;
    
    document.getElementById('share-btn').onclick = () => {
        const msg = `🏔️ He completado el Mountain Quiz en ${finalTime} con ${score}/10 aciertos.\n\n¿Puedes superarme? Juega aquí:\nhttps://gallery.unaign.xyz`;
        navigator.clipboard.writeText(msg).then(() => {
            alert("¡Resultado copiado!");
        });
    };
}