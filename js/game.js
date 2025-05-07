document.addEventListener('DOMContentLoaded', () => {
    // Create particles container
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    document.body.appendChild(particlesContainer);

    // Create particles
    function createParticles() {
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random size between 20px and 60px
            const size = Math.random() * 40 + 20;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Random starting position
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            
            // Random animation duration between 15s and 30s
            particle.style.animationDuration = `${Math.random() * 15 + 15}s`;
            
            // Random animation delay
            particle.style.animationDelay = `${Math.random() * 5}s`;
            
            particlesContainer.appendChild(particle);
        }
    }

    createParticles();

    const canvas = document.getElementById('gameCanvas');
    const nextPieceCanvas = document.getElementById('nextPiece');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    const levelProgressElement = document.getElementById('levelProgress');
    const gameMessage = document.getElementById('gameMessage');
    const messageTitle = document.getElementById('messageTitle');
    const messageText = document.getElementById('messageText');
    const messageBtn = document.getElementById('messageBtn');
    
    // Control buttons
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const downBtn = document.getElementById('downBtn');
    const rotateBtn = document.getElementById('rotateBtn');
    
    let game = new Tetris(canvas, nextPieceCanvas);
    let animationId = null;
    let lastTimestamp = 0;
    
    // Game loop
    function gameLoop(timestamp) {
        if (!lastTimestamp) lastTimestamp = timestamp;
        const deltaTime = timestamp - lastTimestamp;
        
        game.update(timestamp);
        updateUI();
        
        if (game.gameOver) {
            showGameOver();
            return;
        }
        
        lastTimestamp = timestamp;
        animationId = requestAnimationFrame(gameLoop);
    }
    
    // Update UI elements
    function updateUI() {
        scoreElement.textContent = game.score;
        levelElement.textContent = game.level;
        levelProgressElement.style.width = `${(game.linesCleared % 10) * 10}%`;
    }
    
    // Show game over message
    function showGameOver() {
        messageTitle.textContent = 'Game Over!';
        messageText.textContent = `Your score: ${game.score}\nLevel reached: ${game.level}`;
        gameMessage.classList.add('active');
    }
    
    // Show level up message
    function showLevelUp() {
        messageTitle.textContent = 'Level Up!';
        messageText.textContent = `Congratulations! You've reached level ${game.level}.\nThe game is getting faster!`;
        gameMessage.classList.add('active');
    }
    
    // Start game
    function startGame() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        game.reset();
        lastTimestamp = 0;
        animationId = requestAnimationFrame(gameLoop);
        startBtn.textContent = 'Restart';
        pauseBtn.disabled = false;
    }
    
    // Pause game
    function togglePause() {
        game.isPaused = !game.isPaused;
        pauseBtn.textContent = game.isPaused ? 'Resume' : 'Pause';
        
        if (!game.isPaused) {
            lastTimestamp = 0;
            animationId = requestAnimationFrame(gameLoop);
        }
    }
    
    // Event listeners
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    messageBtn.addEventListener('click', () => {
        gameMessage.classList.remove('active');
        if (game.gameOver) {
            startGame();
        }
    });
    
    // Control button event listeners
    leftBtn.addEventListener('click', () => {
        if (!game.gameOver && !game.isPaused) {
            game.moveLeft();
        }
    });
    
    rightBtn.addEventListener('click', () => {
        if (!game.gameOver && !game.isPaused) {
            game.moveRight();
        }
    });
    
    downBtn.addEventListener('click', () => {
        if (!game.gameOver && !game.isPaused) {
            game.moveDown();
        }
    });
    
    rotateBtn.addEventListener('click', () => {
        if (!game.gameOver && !game.isPaused) {
            game.rotate();
        }
    });
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (game.gameOver || game.isPaused) return;
        
        switch (e.key) {
            case 'ArrowLeft':
                game.moveLeft();
                break;
            case 'ArrowRight':
                game.moveRight();
                break;
            case 'ArrowDown':
                game.moveDown();
                break;
            case 'ArrowUp':
                game.rotate();
                break;
            case ' ':
                // Hard drop
                while (!game.checkCollision()) {
                    game.currentPiece.y++;
                }
                game.currentPiece.y--;
                game.freezePiece();
                game.clearLines();
                game.createNewPiece();
                game.draw();
                break;
        }
    });
    
    // Touch controls for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    
    canvas.addEventListener('touchmove', (e) => {
        if (game.gameOver || game.isPaused) return;
        
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const deltaX = touchX - touchStartX;
        const deltaY = touchY - touchStartY;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 30) {
                game.moveRight();
                touchStartX = touchX;
            } else if (deltaX < -30) {
                game.moveLeft();
                touchStartX = touchX;
            }
        } else {
            if (deltaY > 30) {
                game.moveDown();
                touchStartY = touchY;
            } else if (deltaY < -30) {
                game.rotate();
                touchStartY = touchY;
            }
        }
    });
    
    // Initialize game
    pauseBtn.disabled = true;
    updateUI();
}); 