let dictionary = [];

// Carrega lista de palavras (JSON externo)
fetch("palavras.json")
  .then(res => res.json())
  .then(data => dictionary = data);

const syllables = ["ra","ri","ro","re","ru","la","li","lo","le","lu","ma","me","mi","mo","mu","pa","pe","pi","po","pu","ta","te","ti","to","tu","ca","ce","ci","co","cu","bra","bre","bri","bro","bru"];

let players = [
  { name: "Jogador 1", lives: 3, score: 0 },
  { name: "Jogador 2", lives: 3, score: 0 }
];
let currentPlayer = 0;
let round = 1;
let currentSyllable = "";
let timerMs = 10000;
let timerId = null;
let running = false;

const roundEl = document.getElementById("round");
const turnEl = document.getElementById("turn");
const syllableEl = document.getElementById("syllable");
const timebarEl = document.getElementById("timebar");
const timeleftEl = document.getElementById("timeleft");
const wordInput = document.getElementById("word");
const feedbackEl = document.getElementById("feedback");

function pickSyllable() {
  currentSyllable = syllables[Math.floor(Math.random()*syllables.length)];
  syllableEl.textContent = currentSyllable.toUpperCase();
}

function startRound() {
  running = true;
  pickSyllable();
  wordInput.value = "";
  feedback("");
  turnEl.textContent = `Vez: ${players[currentPlayer].name}`;
  startTimer(timerMs);
}

function startTimer(ms) {
  clearTimer();
  const start = performance.now();
  const update = () => {
    const elapsed = performance.now() - start;
    const left = Math.max(0, ms - elapsed);
    const pct = left / ms;
    timebarEl.style.width = `${pct*100}%`;
    timeleftEl.textContent = `${Math.ceil(left/1000)}s`;
    if (left <= 0) {
      onTimeout();
      return;
    }
    timerId = requestAnimationFrame(update);
  };
  update();
}

function clearTimer() {
  if (timerId) cancelAnimationFrame(timerId);
  timerId = null;
}

function onTimeout() {
  running = false;
  players[currentPlayer].lives--;
  feedback(`${players[currentPlayer].name} perdeu uma vida!`, false);
  if (players[currentPlayer].lives <= 0) {
    feedback(`${players[currentPlayer].name} foi eliminado!`, false);
  }
  nextPlayer();
}

function submitWord() {
  if (!running) return;
  const word = wordInput.value.trim().toLowerCase();
  if (!dictionary.includes(word) || !word.includes(currentSyllable)) {
    feedback("Palavra inválida ou inexistente!", false);
    return;
  }
  players[currentPlayer].score += 10;
  feedback(`${players[currentPlayer].name} acertou: ${word}`, true);
  clearTimer();
  nextPlayer();
}

function nextPlayer() {
  running = false;
  currentPlayer = (currentPlayer+1) % players.length;
  if (players.every(p => p.lives <= 0)) {
    feedback("Fim de jogo!", false);
    return;
  }
  while (players[currentPlayer].lives <= 0) {
    currentPlayer = (currentPlayer+1) % players.length;
  }
  round++;
  roundEl.textContent = `Round: ${round}`;
  setTimeout(startRound, 800);
}

function feedback(msg, ok=null) {
  feedbackEl.textContent = msg;
  feedbackEl.style.color = ok===true ? "lime" : ok===false ? "red" : "white";
}

document.getElementById("start").addEventListener("click", () => {
  round = 1;
  players.forEach(p => { p.lives=3; p.score=0; });
  currentPlayer = 0;
  startRound();
});

document.getElementById("restart").addEventListener("click", () => {
  round = 1;
  players.forEach(p => { p.lives=3; p.score=0; });
  currentPlayer = 0;
  feedback("");
  syllableEl.textContent = "---";
});

document.getElementById("submit").addEventListener("click", submitWord);
wordInput.addEventListener("keydown", e => { if (e.key==="Enter") submitWord(); });
