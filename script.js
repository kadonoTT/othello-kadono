const size = 8;
let board = Array(size).fill().map(() => Array(size).fill(null));
let currentPlayer = 'black';
let directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1],  // 上, 下, 左, 右
    [-1, -1], [-1, 1], [1, -1], [1, 1] // 斜め
];

// 盤面の初期化
initializeBoard();

// 初期盤面を生成し、中央4マスに石を置く
function initializeBoard() {
    let boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            let cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', handleClick);
            boardDiv.appendChild(cell);
        }
    }

    board[3][3] = 'white';
    board[3][4] = 'black';
    board[4][3] = 'black';
    board[4][4] = 'white';
    renderBoard();
    updateScore();
    highlightValidMoves();
}

// 盤面の描画
function renderBoard() {
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            let cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
            cell.classList.remove('black', 'white', 'valid');
            if (board[row][col] === 'black') {
                cell.classList.add('black');
            } else if (board[row][col] === 'white') {
                cell.classList.add('white');
            }
        }
    }
}

// プレイヤーのクリックを処理する
function handleClick(event) {
    let row = parseInt(event.target.dataset.row);
    let col = parseInt(event.target.dataset.col);
    if (isValidMove(row, col, currentPlayer)) {
        makeMove(row, col, currentPlayer, board);
        currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
        updateScore();
        renderBoard();

        if (currentPlayer === 'white') {
            npcMove();
        }
    }
}

// 石を配置して、石をひっくり返す処理
function makeMove(row, col, player, board) {
    board[row][col] = player;
    for (let direction of directions) {
        let cellsToFlip = [];
        let r = row + direction[0];
        let c = col + direction[1];
        while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] && board[r][c] !== player) {
            cellsToFlip.push([r, c]);
            r += direction[0];
            c += direction[1];
        }
        if (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === player) {
            for (let cell of cellsToFlip) {
                board[cell[0]][cell[1]] = player;
            }
        }
    }
}

// 有効な手かを確認する
function isValidMove(row, col, player) {
    if (board[row][col] !== null) return false;

    for (let direction of directions) {
        let r = row + direction[0];
        let c = col + direction[1];
        let foundOpponent = false;
        while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] && board[r][c] !== player) {
            foundOpponent = true;
            r += direction[0];
            c += direction[1];
        }
        if (foundOpponent && r >= 0 && r < size && c >= 0 && c < size && board[r][c] === player) {
            return true;
        }
    }
    return false;
}

// 有効な手をハイライトする
function highlightValidMoves() {
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            let cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
            if (isValidMove(row, col, currentPlayer)) {
                cell.classList.add('valid');
            }
        }
    }
}

// スコアの更新
function updateScore() {
    let blackScore = 0;
    let whiteScore = 0;
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (board[row][col] === 'black') {
                blackScore++;
            } else if (board[row][col] === 'white') {
                whiteScore++;
            }
        }
    }
    document.getElementById('blackScore').textContent = `Black: ${blackScore}`;
    document.getElementById('whiteScore').textContent = `White: ${whiteScore}`;
}

// NPCの手番
function npcMove() {
    setTimeout(() => {
        let bestMove = null;
        let bestScore = -Infinity;

        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (isValidMove(row, col, 'white')) {
                    let simulatedBoard = JSON.parse(JSON.stringify(board));
                    makeMove(row, col, 'white', simulatedBoard);
                    let score = minimax(simulatedBoard, 5, false, -Infinity, Infinity, 'white');
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = { row, col };
                    }
                }
            }
        }

        if (bestMove) {
            makeMove(bestMove.row, bestMove.col, 'white', board);
            currentPlayer = 'black';
            renderBoard();
            updateScore();
            highlightValidMoves();
        }
    }, 50);
}

// ミニマックスアルゴリズム (探索の深さを5に設定)
function minimax(simulatedBoard, depth, maximizingPlayer, alpha, beta, player) {
    if (depth === 0 || isGameOver(simulatedBoard)) {
        return evaluateBoard(simulatedBoard);
    }

    if (maximizingPlayer) {
        let maxEval = -Infinity;
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (isValidMove(row, col, player)) {
                    let newBoard = JSON.parse(JSON.stringify(simulatedBoard));
                    makeMove(row, col, player, newBoard);
                    let eval = minimax(newBoard, depth - 1, false, alpha, beta, switchPlayer(player));
                    maxEval = Math.max(maxEval, eval);
                    alpha = Math.max(alpha, eval);
                    if (beta <= alpha) break; // βカット
                }
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (isValidMove(row, col, player)) {
                    let newBoard = JSON.parse(JSON.stringify(simulatedBoard));
                    makeMove(row, col, player, newBoard);
                    let eval = minimax(newBoard, depth - 1, true, alpha, beta, switchPlayer(player));
                    minEval = Math.min(minEval, eval);
                    beta = Math.min(beta, eval);
                    if (beta <= alpha) break; // αカット
                }
            }
        }
        return minEval;
    }
}

// 盤面の評価 (角やエッジを重視)
function evaluateBoard(board) {
    let score = 0;
    const cornerPositions = [
        [0, 0], [0, size - 1], [size - 1, 0], [size - 1, size - 1]
    ];
    const edgePositions = [];

    // 角の評価
    for (let [r, c] of cornerPositions) {
        if (board[r][c] === 'white') score += 50;
        else if (board[r][c] === 'black') score -= 50;
    }

    // エッジの評価 (上下左右の端)
    for (let i = 1; i < size - 1; i++) {
        edgePositions.push([0, i], [size - 1, i], [i, 0], [i, size - 1]);
    }
    for (let [r, c] of edgePositions) {
        if (board[r][c] === 'white') score += 10;
        else if (board[r][c] === 'black') score -= 10;
    }

    // 石の数の評価
    let blackScore = 0, whiteScore = 0;
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (board[row][col] === 'black') blackScore++;
            if (board[row][col] === 'white') whiteScore++;
        }
    }

    // 終局状態での得点調整
    if (isGameOver(board)) {
        score += (whiteScore - blackScore) * 5; // 終局時は得点に重み付け
    }

    return score + (whiteScore - blackScore);
}

// ゲームが終了したかどうかの判定
function isGameOver(board) {
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (isValidMove(row, col, 'black') || isValidMove(row, col, 'white')) {
                return false;
            }
        }
    }
    return true;
}

// プレイヤーの切り替え
function switchPlayer(player) {
    return player === 'black' ? 'white' : 'black';
}
