// Sílaba pool (pt-br simples + comuns). Você pode expandir à vontade.
const SYLLABLES = [
  "ra","ri","ro","re","ru",
  "la","li","lo","le","lu",
  "ma","me","mi","mo","mu",
  "pa","pe","pi","po","pu",
  "ta","te","ti","to","tu",
  "ca","ce","ci","co","cu",
  "ba","be","bi","bo","bu",
  "da","de","di","do","du",
  "na","ne","ni","no","nu",
  "fa","fe","fi","fo","fu",
  "cha","che","chi","cho","chu",
  "bra","bre","bri","bro","bru",
  "pra","pre","pri","pro","pru",
  "tra","tre","tri","tro","tru",
  "gra","gre","gri","gro","gru"
];

const roundEl = document.getElementById('round');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const syllableEl = document.getElementById('syllable');
const timebarEl = document.getElementById('timebar');
const timeleftEl = document.getElementById('timeleft');
const wordInput = document.getElementById('word');
const feedbackEl = document.getElementById('feedback');
const startBtn = document.getElementById('start');
const restartBtn = document.getElementById('restart');
const submitBtn = document.getElementById('submit');

let round = 1;
let score = 0;
let lives = 3;
let currentSyllable = '---';
let timerMs = 10000; // 10s
let timerId = null;
let running = false;

// Dificuldade dinâmica: reduz tempo a cada 3 rounds
function updateDifficulty() {
  const step = Math.floor((round - 1) / 3);
  timerMs = Math.max(4000, 10000 - step * 1000); // mínimo 4s
}

// Escolhe uma sílaba aleatória
function pickSyllable() {
  const idx = Math.floor(Math.random() * SYLLABLES.length);
  currentSyllable = SYLLABLES[idx];
  syllableEl.textContent = currentSyllable.toUpperCase();
}

// Inicia o round com timer
function startRound() {
  running = true;
  updateDifficulty();
  pickSyllable();
  wordInput.value = '';
  wordInput.focus();
  feedback('');
  startTimer(timerMs);
}

// Timer decrescente com barra
function startTimer(ms) {
  clearTimer();
  const start = performance.now();
  const update = () => {
    const elapsed = performance.now() - start;
    const left = Math.max(0, ms - elapsed);
    const pct = Math.max(0, left / ms);
    timebarEl.style.width = `${pct * 100}%`;
    timeleftEl.textContent = `${Math.ceil(left/1000)}s`;
    if (left <= 0) {
      timebarEl.style.width = '0%';
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

// Acabou o tempo: perde vida e avança ou termina
function onTimeout() {
  running = false;
  lives -= 1;
  livesEl.textContent = lives;
  feedback('Tempo esgotado!', false);
  if (lives <= 0) {
    gameOver();
  } else {
    setTimeout(() => {
      round += 1;
      roundEl.textContent = round;
      startRound();
    }, 800);
  }
}

// Valida palavra: contém sílaba, tem letras, não é só espaços, tamanho mínimo
function isValidWord(word, syll) {
  const w = normalize(word);
  const s = normalize(syll);
  if (w.length < 3) return false;
  if (!/^[a-záéíóúâêîôûãõç]+$/i.test(w)) return false; // somente letras comuns pt-br
  return w.includes(s);
}

// Remover acentos para checagem mais justa
function normalize(str) {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // remove diacríticos
}

function submitWord() {
  if (!running) return;
  const word = wordInput.value.trim();
  if (!isValidWord(word, currentSyllable)) {
    feedback('Palavra inválida ou não contém a sílaba.', false);
    // penalização leve: continua o mesmo round, sem perder vida automática
    return;
  }
  // Acertou: pontua e vai para próximo round
  running = false;
  score += Math.max(10, Math.round(timerMs / 1000) * 2); // pontos base + tempo/2
  scoreEl.textContent = score;
  feedback(`Ok: ${word}`, true);
  clearTimer();
  setTimeout(() => {
    round += 1;
    roundEl.textContent = round;
    startRound();
  }, 600);
}

function feedback(msg, ok = null) {
  feedbackEl.textContent = msg;
  feedbackEl.className = 'feedback';
  if (ok === true) feedbackEl.classList.add('ok');
  else if (ok === false) feedbackEl.classList.add('err');
}

function gameOver() {
  clearTimer();
  feedback(`Game Over! Pontos: ${score}`, false);
  syllableEl.textContent = 'FIM';
  running = false;
}

function resetGame() {
  clearTimer();
  round = 1;
  score = 0;
  lives = 3;
  roundEl.textContent = round;
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  feedback('');
  syllableEl.textContent = '---';
  timebarEl.style.width = '100%';
  timeleftEl.textContent = '10s';
}

// Eventos
startBtn.addEventListener('click', () => {
  resetGame();
  startRound();
});

restartBtn.addEventListener('click', () => {
  resetGame();
});

submitBtn.addEventListener('click', submitWord);

wordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') submitWord();
});

// Ajuda: impedir colar espaços vazios
wordInput.addEventListener('input', () => {
  wordInput.value = wordInput.value.replace(/\s+/g, ' ').trimStart();
});
