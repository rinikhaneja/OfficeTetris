class Tetris {
    constructor(canvas, nextPieceCanvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.nextPieceCanvas = nextPieceCanvas;
        this.nextPieceCtx = nextPieceCanvas.getContext('2d');
        
        // Set canvas sizes
        this.canvas.width = 300;
        this.canvas.height = 600;
        this.nextPieceCanvas.width = 100;
        this.nextPieceCanvas.height = 100;
        
        // Game constants
        this.BLOCK_SIZE = 30;
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.COLORS = [
            '#FF6B6B', // Red
            '#4ECDC4', // Teal
            '#45B7D1', // Blue
            '#96CEB4', // Green
            '#FFEEAD', // Yellow
            '#D4A5A5', // Pink
            '#9B59B6'  // Purple
        ];
        
        // Game state
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.gameOver = false;
        this.isPaused = false;
        
        // Current and next piece
        this.currentPiece = null;
        this.nextPiece = null;
        
        // Game speed (milliseconds)
        this.dropInterval = 1000;
        this.lastDrop = 0;
        
        // Initialize game
        this.init();
    }
    
    init() {
        this.createNewPiece();
        this.draw();
    }
    
    createNewPiece() {
        const pieces = [
            [[1, 1, 1, 1]], // I
            [[1, 1], [1, 1]], // O
            [[1, 1, 1], [0, 1, 0]], // T
            [[1, 1, 1], [1, 0, 0]], // L
            [[1, 1, 1], [0, 0, 1]], // J
            [[1, 1, 0], [0, 1, 1]], // Z
            [[0, 1, 1], [1, 1, 0]]  // S
        ];
        
        if (!this.nextPiece) {
            this.nextPiece = {
                shape: pieces[Math.floor(Math.random() * pieces.length)],
                color: this.COLORS[Math.floor(Math.random() * this.COLORS.length)],
                x: Math.floor(this.BOARD_WIDTH / 2) - 1,
                y: 0
            };
        }
        
        this.currentPiece = this.nextPiece;
        this.nextPiece = {
            shape: pieces[Math.floor(Math.random() * pieces.length)],
            color: this.COLORS[Math.floor(Math.random() * this.COLORS.length)],
            x: Math.floor(this.BOARD_WIDTH / 2) - 1,
            y: 0
        };
        
        this.drawNextPiece();
        
        if (this.checkCollision()) {
            this.gameOver = true;
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x]) {
                    this.drawBlock(x, y, this.board[y][x]);
                }
            }
        }
        
        // Draw current piece
        if (this.currentPiece) {
            this.currentPiece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        this.drawBlock(
                            this.currentPiece.x + x,
                            this.currentPiece.y + y,
                            this.currentPiece.color
                        );
                    }
                });
            });
        }
    }
    
    drawNextPiece() {
        this.nextPieceCtx.clearRect(0, 0, this.nextPieceCanvas.width, this.nextPieceCanvas.height);
        
        const blockSize = 20;
        const offsetX = (this.nextPieceCanvas.width - this.nextPiece.shape[0].length * blockSize) / 2;
        const offsetY = (this.nextPieceCanvas.height - this.nextPiece.shape.length * blockSize) / 2;
        
        this.nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.nextPieceCtx.fillStyle = this.nextPiece.color;
                    this.nextPieceCtx.fillRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize - 1,
                        blockSize - 1
                    );
                }
            });
        });
    }
    
    drawBlock(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            x * this.BLOCK_SIZE,
            y * this.BLOCK_SIZE,
            this.BLOCK_SIZE - 1,
            this.BLOCK_SIZE - 1
        );
    }
    
    moveDown() {
        this.currentPiece.y++;
        if (this.checkCollision()) {
            this.currentPiece.y--;
            this.freezePiece();
            this.clearLines();
            this.createNewPiece();
        }
        this.draw();
    }
    
    moveLeft() {
        this.currentPiece.x--;
        if (this.checkCollision()) {
            this.currentPiece.x++;
        }
        this.draw();
    }
    
    moveRight() {
        this.currentPiece.x++;
        if (this.checkCollision()) {
            this.currentPiece.x--;
        }
        this.draw();
    }
    
    rotate() {
        const originalShape = this.currentPiece.shape;
        this.currentPiece.shape = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[i]).reverse()
        );
        
        if (this.checkCollision()) {
            this.currentPiece.shape = originalShape;
        }
        this.draw();
    }
    
    checkCollision() {
        return this.currentPiece.shape.some((row, y) => {
            return row.some((value, x) => {
                if (!value) return false;
                
                const newX = this.currentPiece.x + x;
                const newY = this.currentPiece.y + y;
                
                return (
                    newX < 0 ||
                    newX >= this.BOARD_WIDTH ||
                    newY >= this.BOARD_HEIGHT ||
                    (newY >= 0 && this.board[newY][newX])
                );
            });
        });
    }
    
    freezePiece() {
        this.currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const boardY = this.currentPiece.y + y;
                    const boardX = this.currentPiece.x + x;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            });
        });
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                y++;
            }
        }
        
        if (linesCleared > 0) {
            this.linesCleared += linesCleared;
            this.score += this.calculateScore(linesCleared);
            this.updateLevel();
        }
    }
    
    calculateScore(linesCleared) {
        const points = [0, 100, 300, 500, 800];
        return points[linesCleared] * this.level;
    }
    
    updateLevel() {
        const newLevel = Math.floor(this.linesCleared / 10) + 1;
        if (newLevel !== this.level) {
            this.level = newLevel;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
        }
    }
    
    update(timestamp) {
        if (this.gameOver || this.isPaused) return;
        
        if (timestamp - this.lastDrop > this.dropInterval) {
            this.moveDown();
            this.lastDrop = timestamp;
        }
    }
    
    reset() {
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.gameOver = false;
        this.isPaused = false;
        this.dropInterval = 1000;
        this.createNewPiece();
        this.draw();
    }
} 