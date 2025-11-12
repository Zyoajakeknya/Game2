// === Selector utama ===
const selectors = {
    boardContainer: document.querySelector('.board-container'),
    board: document.querySelector('.board'),
    moves: document.querySelector('.moves'),
    timer: document.querySelector('.timer'),
    start: document.querySelector('button'),
    win: document.querySelector('.win')
};

// === State permainan ===
const state = {
    gameStarted: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null
};

// === Utility ===
const shuffle = array => {
    const clone = [...array];
    for (let i = clone.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone;
};

const pickRandom = (array, items) => {
    const clone = [...array];
    const result = [];
    for (let i = 0; i < items; i++) {
        const random = Math.floor(Math.random() * clone.length);
        result.push(clone.splice(random, 1)[0]);
    }
    return result;
};

// === Generate papan permainan ===
const generateGame = () => {
    const dimensions = selectors.board.getAttribute('data-dimension');
    if (dimensions % 2 !== 0) throw new Error("Dimension must be even.");

    const emojis = ['🥔', '🍒', '🥑', '🌽', '🥕', '🍇', '🍉', '🍌', '🥭', '🍍', '🍓', '🥝'];
    const picks = pickRandom(emojis, (dimensions * dimensions) / 2);
    const items = shuffle([...picks, ...picks]);

    const cards = items.map(item => `
        <div class="card">
            <div class="card-front"></div>
            <div class="card-back">${item}</div>
        </div>
    `).join('');

    const board = document.createElement('div');
    board.classList.add('board');
    board.style.gridTemplateColumns = `repeat(${dimensions}, auto)`;
    board.innerHTML = cards;

    selectors.board.replaceWith(board);
    selectors.board = board; // Update selector
};

// === Mulai permainan ===
const startGame = () => {
    state.gameStarted = true;
    selectors.start.classList.add('disabled');
    state.totalTime = 0;
    state.totalFlips = 0;
    selectors.moves.innerText = '0 moves';
    selectors.timer.innerText = 'time: 0 sec';

    if (state.loop) clearInterval(state.loop);
    state.loop = setInterval(() => {
        state.totalTime++;
        selectors.timer.innerText = `time: ${state.totalTime} sec`;
    }, 1000);
};

// === Balik kartu ke belakang ===
const flipBackCards = () => {
    document.querySelectorAll('.card:not(.matched)').forEach(c => c.classList.remove('flipped'));
    state.flippedCards = 0;
};

// === Balik kartu ===
const flipCard = card => {
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
    if (state.flippedCards >= 2) return;

    card.classList.add('flipped');
    state.flippedCards++;
    state.totalFlips++;
    selectors.moves.innerText = `${state.totalFlips} moves`;

    if (!state.gameStarted) startGame();

    // Cek jika 2 kartu sudah dibuka
    if (state.flippedCards === 2) {
        const flipped = document.querySelectorAll('.flipped:not(.matched)');
        if (flipped[0].innerText === flipped[1].innerText) {
            flipped.forEach(f => f.classList.add('matched'));
            state.flippedCards = 0;
        } else {
            setTimeout(flipBackCards, 800);
        }
    }

    // Cek menang
    if (!document.querySelectorAll('.card:not(.matched)').length) {
        setTimeout(() => {
            clearInterval(state.loop);
            selectors.boardContainer.classList.add('flipped');
            selectors.win.innerHTML = `
                <span class="win-text">
                    🎉 You Won! 🎉<br>
                    with <span class="highlight">${state.totalFlips}</span> moves<br>
                    under <span class="highlight">${state.totalTime}</span> seconds<br><br>
                    <button id="restart">Restart Game</button>
                </span>
            `;

            // Tombol restart
            document.getElementById('restart').addEventListener('click', () => {
                selectors.boardContainer.classList.remove('flipped');
                state.gameStarted = false;
                generateGame();
                attachEventListeners();
            });
        }, 700);
    }
};

// === Event listener utama ===
const attachEventListeners = () => {
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', () => flipCard(card));
    });

    selectors.start.addEventListener('click', () => {
        if (!selectors.start.classList.contains('disabled')) startGame();
    });
};

// === Inisialisasi game ===
generateGame();
attachEventListeners();