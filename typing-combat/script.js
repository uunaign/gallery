const wordList = [
    "CASAS", "TIGRE", "PLANO", "VALOR", "LIMON", "MUERO", "LIBRO", "CIELO", "ARBOL", "FUEGO", 
    "DUELO", "BRAVO", "GATOS", "PIANO", "ARENA", "MUNDO", "QUESO", "HOJAS", "BARCO", "RELOJ", 
    "VISTA", "DOTES", "METRO", "RADIO", "ZORRO", "ACERO", "AGUAS", "ALMAS", "ANTES", "APOYO", 
    "BAILE", "BANCO", "BEBER", "BICHO", "BOLSA", "BOTON", "BRISA", "BRUJO", "CABLE", "CALLE", 
    "CAMPO", "CANAL", "CARRO", "CLAVE", "COCHE", "COSER", "CRUCE", "DATOS", "DICHO", "DIETA", 
    "DISCO", "DONDE", "DRAMA", "ERROR", "ETAPA", "EXITO", "FERIA", "FICHA", "FORMA", 
    "FRASE", "FRUTA", "GANAR", "GLOBO", "GOLPE", "GRITO", "GRUPO", "HABLA", "HIELO", "HUEVO", 
    "ICONO", "IDEAL", "ISLAS", "JABON", "JUEGO", "JUNTO", "LAPIZ", "LARGO", "LENTE", "LISTA", 
    "LLAVE", "LOCAL", "LUCES", "LUGAR", "MAGIA", "MAPAS", "MARCO", "MEDIA", "METAL", "MOTOR", 
    "NARIZ", "NIVEL", "NOTAS", "NUEVO", "ORDEN", "PANEL", "PARTE", "PEDIR", "PERRO", "PESO", 
    "PISTA", "PODER", "PRADO", "PUNTO", "RAMAS", "RATON", "RAYOS", "REGLA", "RIVAL", "ROBOT", 
    "ROCAS", "RUEDA", "SABER", "SELVA", "SERIE", "SIGLO", "SITIO", "SOLAR", "SUELO", "TABLA", 
    "TARDE", "TECLA", "TEXTO", "TIRAR", "TORRE", "TRAMA", "TRENES", "TRUCO", "VALLE", "VUELO"
];
let score = 0;
let lives = 5;
let currentInput = "";
let enemies = [];
let gameActive = false;
const wordLength = 5;

const screen = document.getElementById('terminal-screen');
const typingDisplay = document.getElementById('current-typing');

function startGame() {
    document.getElementById('intro-screen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    gameActive = true;
    spawnLoop();
    update();
}

function spawnLoop() {
    if (!gameActive) return;
    createEnemy();
    let nextSpawn = Math.max(600, 2200 - (score / 5));
    setTimeout(spawnLoop, nextSpawn);
}

function createEnemy() {
    const isLife = Math.random() < 0.08;
    const word = isLife ? "VIDA" : wordList[Math.floor(Math.random() * wordList.length)];
    
    const el = document.createElement('div');
    el.className = isLife ? 'word-enemy life-word' : 'word-enemy';
    el.innerText = word;
    
    const x = Math.random() * (screen.clientWidth - 150);
    el.style.left = Math.max(20, x) + 'px';
    el.style.top = '-40px';
    
    screen.appendChild(el);
    
    enemies.push({
        element: el,
        word: word,
        top: -40,
        speed: 1.1 + (score / 2500),
        isLife: isLife
    });
}

function update() {
    if (!gameActive) return;

    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        e.top += e.speed;
        e.element.style.top = e.top + 'px';

        if (e.top > screen.clientHeight) {
            if (!e.isLife) {
                lives--;
                updateStats();
                if (lives <= 0) gameOver();
            }
            screen.removeChild(e.element);
            enemies.splice(i, 1);
        }
    }
    requestAnimationFrame(update);
}

window.addEventListener('keydown', (e) => {
    if (!gameActive) return;

    if (e.key === 'Backspace') {
        currentInput = currentInput.slice(0, -1);
    } else if (e.key.length === 1 && /[a-zA-ZñÑ]/.test(e.key)) {
        currentInput += e.key.toUpperCase();
    }

    typingDisplay.innerText = currentInput;

    if (currentInput === "VIDA") {
        processHit("VIDA");
    } else if (currentInput.length >= wordLength) {
        processHit(currentInput);
    }
});

function processHit(input) {
    let foundIndex = enemies.findIndex(e => e.word === input);
    
    if (foundIndex !== -1) {
        const enemy = enemies[foundIndex];
        if (enemy.isLife) {
            if (lives < 5) lives++;
        } else {
            score += 100;
        }
        updateStats();
        screen.removeChild(enemy.element);
        enemies.splice(foundIndex, 1);
        
        typingDisplay.style.color = 'white';
        setTimeout(() => typingDisplay.style.color = '', 100);
    }
    
    currentInput = "";
    typingDisplay.innerText = "";
}

function updateStats() {
    document.getElementById('score').innerText = score;
    document.getElementById('lives').innerText = lives;
}

function gameOver() {
    gameActive = false;
    document.getElementById('overlay').classList.remove('hidden');
    document.getElementById('final-score').innerText = score;
}