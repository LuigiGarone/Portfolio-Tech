console.log('Script loaded');
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    // DOM elements
    const canvas = document.getElementById('gameCanvas');
    console.log('Canvas element found:', canvas);

    if (!canvas) {
        console.error('Canvas element not found!');
        alert('Error: Canvas element not found. The game cannot start.');
        return;
    }

    const ctx = canvas.getContext('2d');

    if (!ctx) {
        console.error('Could not get 2D context from canvas!');
        alert('Error: Could not get 2D context. The game cannot start.');
        return;
    }

    console.log('Canvas context obtained successfully');
    const scoreEl = document.getElementById('score');
    const levelEl = document.getElementById('level');
    const livesEl = document.getElementById('lives');
    const menu = document.getElementById('menu');
    const gameOverScreen = document.getElementById('gameOver');
    const highScoresScreen = document.getElementById('highScores');
    const levelCompleteScreen = document.getElementById('levelComplete');
    const finalScoreEl = document.getElementById('finalScore');
    const levelScoreEl = document.getElementById('levelScore');
    const scoresListEl = document.getElementById('scoresList');
    
    // Buttons
    const startButton = document.getElementById('startButton');
    const highScoresButton = document.getElementById('highScoresButton');
    const submitScoreButton = document.getElementById('submitScore');
    const restartButton = document.getElementById('restartButton');
    const backButton = document.getElementById('backButton');
    const nextLevelButton = document.getElementById('nextLevelButton');
    const playerNameInput = document.getElementById('playerName');
    
    // Game constants
    const GAME_WIDTH = 800;
    const GAME_HEIGHT = 540; // Excluding header
    const PADDLE_WIDTH = 100;
    const PADDLE_HEIGHT = 15;
    const BALL_RADIUS = 8;
    const BRICK_WIDTH = 75;
    const BRICK_HEIGHT = 25;
    const BRICK_PADDING = 10;
    const BRICK_TOP_OFFSET = 60;
    const BRICK_LEFT_OFFSET = 35;
    const PADDLE_SPEED = 8;
    
    // Game variables
    let gameRunning = false;
    let score = 0;
    let lives = 3;
    let level = 1;
    let bricks = [];
    let brickRowCount = 4;
    let brickColumnCount = 8;
    let highScores = JSON.parse(localStorage.getItem('neonbreakScores')) || [];
    let gameStartTime = 0;
    
    // Paddle object
    const paddle = {
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        x: GAME_WIDTH / 2 - PADDLE_WIDTH / 2,
        y: GAME_HEIGHT - PADDLE_HEIGHT - 10,
        speed: PADDLE_SPEED,
        dx: 0
    };
    
    // Ball object
    const ball = {
        radius: BALL_RADIUS,
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT - PADDLE_HEIGHT - BALL_RADIUS - 10,
        dx: 0,
        dy: 0,
        speed: 5,
        launched: false
    };
    
    // Powerup types
    const POWERUP_TYPES = {
        EXTEND: 'extend',
        SHRINK: 'shrink',
        SLOW: 'slow',
        FAST: 'fast',
        MULTI_BALL: 'multi-ball',
        EXTRA_LIFE: 'extra-life'
    };
    
    // Powerups array
    let powerups = [];
    
    // Multi-balls array
    let balls = [ball];
    
    // Control keys
    const keys = {
        left: false,
        right: false,
        space: false,
        escape: false
    };
    
    // Level patterns - 1 is normal brick, 2 is strong brick, 3 is unbreakable brick
    const levelPatterns = [
        // Level 1 - Basic pattern
        [
            [0, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 1, 0, 0, 1, 0, 1]
        ],
        // Level 2 - Stronger bricks in the middle
        [
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 2, 2, 2, 2, 2, 2, 1],
            [1, 2, 1, 1, 1, 1, 2, 1],
            [1, 1, 1, 0, 0, 1, 1, 1]
        ],
        // Level 3 - Wall with gaps
        [
            [1, 1, 1, 0, 0, 1, 1, 1],
            [1, 2, 1, 1, 1, 1, 2, 1],
            [1, 2, 2, 2, 2, 2, 2, 1],
            [3, 0, 1, 1, 1, 1, 0, 3]
        ],
        // Level 4 - Fortress
        [
            [2, 2, 2, 2, 2, 2, 2, 2],
            [2, 1, 1, 1, 1, 1, 1, 2],
            [2, 1, 3, 1, 1, 3, 1, 2],
            [2, 2, 2, 0, 0, 2, 2, 2]
        ],
        // Level 5 - Ultimate challenge
        [
            [3, 2, 2, 2, 2, 2, 2, 3],
            [2, 3, 1, 3, 3, 1, 3, 2],
            [2, 1, 3, 1, 1, 3, 1, 2],
            [2, 2, 2, 2, 2, 2, 2, 2]
        ]
    ];
    
    // Cyberpunk color themes for each level
    const levelThemes = [
        {
            background: '#120024',
            paddle: '#00ffff',
            ballGlow: '#00ffff',
            ballFill: '#ffffff',
            brickColors: ['#ff00ff', '#ff0055', '#00ffff'],
            textColor: '#00ff8c'
        },
        {
            background: '#100025',
            paddle: '#14ff00',
            ballGlow: '#14ff00',
            ballFill: '#ffffff',
            brickColors: ['#ff3800', '#14ff00', '#ffea00'],
            textColor: '#ff3800'
        },
        {
            background: '#001433',
            paddle: '#ff00ff',
            ballGlow: '#ff00ff',
            ballFill: '#ffffff',
            brickColors: ['#00d4ff', '#ffea00', '#ff00ff'],
            textColor: '#00d4ff'
        },
        {
            background: '#230035',
            paddle: '#00ffdd',
            ballGlow: '#00ffdd',
            ballFill: '#ffffff',
            brickColors: ['#ff00c8', '#00ffdd', '#ffea00'],
            textColor: '#ffea00'
        },
        {
            background: '#000000',
            paddle: '#ff0000',
            ballGlow: '#ff0000',
            ballFill: '#ffffff',
            brickColors: ['#ff0000', '#0000ff', '#ffff00'],
            textColor: '#00ff00'
        }
    ];
    
    // Current theme
    let currentTheme = levelThemes[0];
    
    // Setup the canvas
    function setupCanvas() {
        console.log('Setting up canvas');
        console.log('Canvas element:', canvas);

        if (!canvas) {
            console.error('Canvas element not found!');
            return;
        }

        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;
        console.log('Canvas dimensions set:', canvas.width, 'x', canvas.height);

        // Make sure canvas is visible
        canvas.style.display = 'block';
        canvas.style.backgroundColor = '#120024';
    }
    
    // Reset ball position
    function resetBall(ballObj = ball) {
        ballObj.x = paddle.x + paddle.width / 2;
        ballObj.y = paddle.y - ballObj.radius;
        ballObj.dx = 0;
        ballObj.dy = 0;
        ballObj.launched = false;
    }
    
    // Create bricks for current level
    function createBricks() {
        bricks = [];
        const pattern = levelPatterns[Math.min(level - 1, levelPatterns.length - 1)];
        brickRowCount = pattern.length;
        brickColumnCount = pattern[0].length;
        
        for (let r = 0; r < brickRowCount; r++) {
            bricks[r] = [];
            for (let c = 0; c < brickColumnCount; c++) {
                const brickType = pattern[r][c];
                if (brickType > 0) {
                    const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_LEFT_OFFSET;
                    const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_TOP_OFFSET;
                    
                    // Determine if this brick should have a power-up (10% chance)
                    const hasPowerup = Math.random() < 0.1 && brickType !== 3;
                    let powerupType = null;
                    if (hasPowerup) {
                        const powerupTypes = Object.values(POWERUP_TYPES);
                        powerupType = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
                    }
                    
                    bricks[r][c] = {
                        x: brickX,
                        y: brickY,
                        width: BRICK_WIDTH,
                        height: BRICK_HEIGHT,
                        type: brickType,
                        health: brickType === 3 ? Infinity : brickType,
                        visible: true,
                        powerup: powerupType
                    };
                }
            }
        }
    }
    
    // Reset game state
    function resetGame() {
        score = 0;
        lives = 3;
        level = 1;
        paddle.width = PADDLE_WIDTH;
        paddle.speed = PADDLE_SPEED;
        ball.speed = 5;
        balls = [ball];
        resetBall();
        powerups = [];
        currentTheme = levelThemes[0];
        createBricks();
        updateScoreDisplay();
    }
    
    // Start a new game
    function startGame() {
        console.log('startGame function called');
        resetGame();
        gameRunning = true;
        console.log('Setting gameRunning to:', gameRunning);
        menu.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        highScoresScreen.classList.add('hidden');
        levelCompleteScreen.classList.add('hidden');
        gameStartTime = Date.now();
        console.log('Requesting animation frame for gameLoop');
        requestAnimationFrame(gameLoop);
    }
    
    // Start the next level
    function startNextLevel() {
        level++;
        resetBall();
        balls = [ball];
        powerups = [];
        paddle.width = PADDLE_WIDTH;
        currentTheme = levelThemes[Math.min(level - 1, levelThemes.length - 1)];
        createBricks();
        levelCompleteScreen.classList.add('hidden');
        updateScoreDisplay();
    }
    
    // Update score display
    function updateScoreDisplay() {
        scoreEl.textContent = \`Score: \${score}\`;
        levelEl.textContent = \`Level: \${level}\`;
        livesEl.textContent = \`Lives: \${lives}\`;
    }
    
    // Handle game over
    function gameOver() {
        gameRunning = false;
        finalScoreEl.textContent = \`Score: \${score}\`;
        gameOverScreen.classList.remove('hidden');
    }
    
    // Handle level complete
    function levelComplete() {
        gameRunning = false;
        levelScoreEl.textContent = \`Score: \${score}\`;
        levelCompleteScreen.classList.remove('hidden');
    }
    
    // Show high scores
    function showHighScores() {
        scoresListEl.innerHTML = '';
        
        const sortedScores = [...highScores].sort((a, b) => b.score - a.score);
        
        if (sortedScores.length === 0) {
            scoresListEl.innerHTML = '<p>No high scores yet!</p>';
        } else {
            sortedScores.forEach((score, index) => {
                const scoreItem = document.createElement('div');
                scoreItem.classList.add('score-item');
                scoreItem.innerHTML = \`
                    <span>\${index + 1}. \${score.name}</span>
                    <span>\${score.score} (\${score.level > 5 ? 'Completed!' : 'Level ' + score.level})</span>
                \`;
                scoresListEl.appendChild(scoreItem);
            });
        }
        
        menu.classList.add('hidden');
        highScoresScreen.classList.remove('hidden');
    }
    
    // Submit score
    function submitScore() {
        const playerName = playerNameInput.value.trim() || 'Player';
        
        highScores.push({
            name: playerName,
            score: score,
            level: level,
            date: new Date().toISOString()
        });
        
        // Keep only top 10 scores
        highScores.sort((a, b) => b.score - a.score);
        if (highScores.length > 10) {
            highScores.length = 10;
        }
        
        localStorage.setItem('neonbreakScores', JSON.stringify(highScores));
        
        gameOverScreen.classList.add('hidden');
        showHighScores();
    }
    
    // Return to main menu
    function returnToMenu() {
        menu.classList.remove('hidden');
        gameOverScreen.classList.add('hidden');
        highScoresScreen.classList.add('hidden');
        levelCompleteScreen.classList.add('hidden');
    }
    
    // Launch the ball
    function launchBall() {
        if (!ball.launched) {
            ball.launched = true;
            ball.dx = ball.speed * (Math.random() > 0.5 ? 1 : -1);
            ball.dy = -ball.speed;
        }
    }
    
    // Create a new powerup
    function createPowerup(x, y, type) {
        powerups.push({
            x,
            y,
            width: 20,
            height: 20,
            type,
            dy: 2 // Speed at which powerup falls
        });
    }
    
    // Apply a powerup effect
    function applyPowerup(type) {
        switch (type) {
            case POWERUP_TYPES.EXTEND:
                paddle.width = Math.min(paddle.width * 1.5, GAME_WIDTH / 2);
                break;
            case POWERUP_TYPES.SHRINK:
                paddle.width = Math.max(paddle.width * 0.7, PADDLE_WIDTH / 2);
                break;
            case POWERUP_TYPES.SLOW:
                balls.forEach(b => b.speed = Math.max(b.speed * 0.7, 3));
                break;
            case POWERUP_TYPES.FAST:
                balls.forEach(b => b.speed = Math.min(b.speed * 1.3, 12));
                break;
            case POWERUP_TYPES.MULTI_BALL:
                if (balls.length < 3) { // Limit to 3 balls max
                    // Add two new balls at different angles
                    for (let i = 0; i < 2; i++) {
                        const newBall = {
                            radius: BALL_RADIUS,
                            x: paddle.x + paddle.width / 2,
                            y: paddle.y - BALL_RADIUS,
                            dx: ball.speed * (i === 0 ? -0.8 : 0.8),
                            dy: -ball.speed,
                            speed: ball.speed,
                            launched: true
                        };
                        balls.push(newBall);
                    }
                }
                break;
            case POWERUP_TYPES.EXTRA_LIFE:
                lives++;
                updateScoreDisplay();
                break;
        }
    }
    
    // Create split effect
    function createSplitEffect(x, y, color) {
        // In a real game, this would create particles for explosion effect
        // Simplified for this example
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
    
    // Draw the game
    function draw() {
        // Clear the canvas
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        // Set background (gradient)
        const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
        gradient.addColorStop(0, currentTheme.background);
        gradient.addColorStop(1, '#000000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        // Draw grid lines for cyberpunk effect
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        // Horizontal grid lines
        for (let y = 0; y < GAME_HEIGHT; y += 20) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(GAME_WIDTH, y);
            ctx.stroke();
        }
        
        // Vertical grid lines
        for (let x = 0; x < GAME_WIDTH; x += 20) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, GAME_HEIGHT);
            ctx.stroke();
        }
        
        // Draw paddle
        ctx.beginPath();
        ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
        
        // Create a gradient for the paddle
        const paddleGradient = ctx.createLinearGradient(
            paddle.x, paddle.y,
            paddle.x, paddle.y + paddle.height
        );
        paddleGradient.addColorStop(0, currentTheme.paddle);
        paddleGradient.addColorStop(1, '#000000');
        
        ctx.fillStyle = paddleGradient;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw paddle glow
        ctx.shadowColor = currentTheme.paddle;
        ctx.shadowBlur = 10;
        ctx.strokeStyle = currentTheme.paddle;
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Draw balls
        balls.forEach(ballObj => {
            ctx.beginPath();
            ctx.arc(ballObj.x, ballObj.y, ballObj.radius, 0, Math.PI * 2);
            ctx.fillStyle = currentTheme.ballFill;
            ctx.fill();
            
            // Draw ball glow
            ctx.shadowColor = currentTheme.ballGlow;
            ctx.shadowBlur = 15;
            ctx.strokeStyle = currentTheme.ballGlow;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.shadowBlur = 0;
        });
        
        // Draw bricks
        for (let r = 0; r < brickRowCount; r++) {
            for (let c = 0; c < brickColumnCount; c++) {
                const brick = bricks[r] && bricks[r][c];
                if (brick && brick.visible) {
                    ctx.beginPath();
                    ctx.rect(brick.x, brick.y, brick.width, brick.height);
                    
                    // Get color based on brick type
                    let color = currentTheme.brickColors[brick.type - 1] || '#ffffff';
                    
                    // Create a gradient for the brick
                    const brickGradient = ctx.createLinearGradient(
                        brick.x, brick.y,
                        brick.x, brick.y + brick.height
                    );
                    brickGradient.addColorStop(0, color);
                    brickGradient.addColorStop(1, shadeColor(color, -50));
                    
                    ctx.fillStyle = brickGradient;
                    ctx.fill();
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    
                    // Add glow effect for special bricks
                    if (brick.type > 1) {
                        ctx.shadowColor = color;
                        ctx.shadowBlur = 10;
                        ctx.strokeStyle = color;
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                    }
                    
                    // Draw a symbol if brick has a powerup
                    if (brick.powerup) {
                        ctx.font = '15px Orbitron';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = '#ffffff';
                        
                        let symbol = '?';
                        switch (brick.powerup) {
                            case POWERUP_TYPES.EXTEND:
                                symbol = '+';
                                break;
                            case POWERUP_TYPES.SHRINK:
                                symbol = '-';
                                break;
                            case POWERUP_TYPES.SLOW:
                                symbol = 'S';
                                break;
                            case POWERUP_TYPES.FAST:
                                symbol = 'F';
                                break;
                            case POWERUP_TYPES.MULTI_BALL:
                                symbol = 'M';
                                break;
                            case POWERUP_TYPES.EXTRA_LIFE:
                                symbol = '♥';
                                break;
                        }
                        
                        ctx.fillText(symbol, brick.x + brick.width / 2, brick.y + brick.height / 2);
                    }
                }
            }
        }
        
        // Draw powerups
        for (let i = 0; i < powerups.length; i++) {
            const powerup = powerups[i];
            ctx.beginPath();
            ctx.rect(powerup.x, powerup.y, powerup.width, powerup.height);
            
            let powerupColor;
            switch (powerup.type) {
                case POWERUP_TYPES.EXTEND:
                    powerupColor = '#00ff00';
                    break;
                case POWERUP_TYPES.SHRINK:
                    powerupColor = '#ff0000';
                    break;
                case POWERUP_TYPES.SLOW:
                    powerupColor = '#0000ff';
                    break;
                case POWERUP_TYPES.FAST:
                    powerupColor = '#ffff00';
                    break;
                case POWERUP_TYPES.MULTI_BALL:
                    powerupColor = '#00ffff';
                    break;
                case POWERUP_TYPES.EXTRA_LIFE:
                    powerupColor = '#ff00ff';
                    break;
                default:
                    powerupColor = '#ffffff';
            }
            
            ctx.fillStyle = powerupColor;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Add glow effect
            ctx.shadowColor = powerupColor;
            ctx.shadowBlur = 10;
            ctx.strokeStyle = powerupColor;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.shadowBlur = 0;
            
            // Draw a symbol for the powerup type
            ctx.font = '15px Orbitron';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffffff';
            
            let symbol = '?';
            switch (powerup.type) {
                case POWERUP_TYPES.EXTEND:
                    symbol = '+';
                    break;
                case POWERUP_TYPES.SHRINK:
                    symbol = '-';
                    break;
                case POWERUP_TYPES.SLOW:
                    symbol = 'S';
                    break;
                case POWERUP_TYPES.FAST:
                    symbol = 'F';
                    break;
                case POWERUP_TYPES.MULTI_BALL:
                    symbol = 'M';
                    break;
                case POWERUP_TYPES.EXTRA_LIFE:
                    symbol = '♥';
                    break;
            }
            
            ctx.fillText(symbol, powerup.x + powerup.width / 2, powerup.y + powerup.height / 2);
        }
    }
    
    // Update game state
    function update() {
        // Move paddle
        paddle.x += paddle.dx;
        
        // Boundary check for paddle
        if (paddle.x < 0) {
            paddle.x = 0;
        } else if (paddle.x + paddle.width > GAME_WIDTH) {
            paddle.x = GAME_WIDTH - paddle.width;
        }
        
        // Move and check all balls
        for (let i = balls.length - 1; i >= 0; i--) {
            const ballObj = balls[i];
            
            if (!ballObj.launched) {
                ballObj.x = paddle.x + paddle.width / 2;
                continue;
            }
            
            // Move ball
            ballObj.x += ballObj.dx;
            ballObj.y += ballObj.dy;
            
            // Wall collision (right/left)
            if (ballObj.x + ballObj.radius > GAME_WIDTH || ballObj.x - ballObj.radius < 0) {
                ballObj.dx = -ballObj.dx;
                
                // Ensure ball stays in bounds
                if (ballObj.x + ballObj.radius > GAME_WIDTH) {
                    ballObj.x = GAME_WIDTH - ballObj.radius;
                } else if (ballObj.x - ballObj.radius < 0) {
                    ballObj.x = ballObj.radius;
                }
            }
            
            // Wall collision (top)
            if (ballObj.y - ballObj.radius < 0) {
                ballObj.dy = -ballObj.dy;
                ballObj.y = ballObj.radius;
            }
            
            // Bottom collision (lose a life)
            if (ballObj.y + ballObj.radius > GAME_HEIGHT) {
                // Remove this ball
                if (balls.length > 1) {
                    balls.splice(i, 1);
                } else {
                    lives--;
                    updateScoreDisplay();
                    
                    if (lives <= 0) {
                        gameOver();
                        return;
                    }
                    
                    resetBall(ballObj);
                }
            }
            
            // Paddle collision
            if (
                ballObj.y + ballObj.radius > paddle.y &&
                ballObj.y + ballObj.radius < paddle.y + paddle.height &&
                ballObj.x > paddle.x &&
                ballObj.x < paddle.x + paddle.width
            ) {
                // Calculate hit position on paddle (0-1)
                const hitPosition = (ballObj.x - paddle.x) / paddle.width;
                
                // Calculate reflection angle (-60 to 60 degrees)
                const angle = -Math.PI / 3 + hitPosition * (2 * Math.PI / 3);
                
                ballObj.dy = -Math.abs(ballObj.dy);
                
                // Optionally, change the X direction based on hit position
                ballObj.dx = ballObj.speed * Math.sin(angle);
                
                // Ensure ball moves above paddle
                ballObj.y = paddle.y - ballObj.radius;
                
                // Add a small speed increase occasionally
                if (Math.random() < 0.1) {
                    ballObj.speed = Math.min(ballObj.speed * 1.05, 12);
                }
            }
            
            // Brick collision
            for (let r = 0; r < brickRowCount; r++) {
                for (let c = 0; c < brickColumnCount; c++) {
                    const brick = bricks[r] && bricks[r][c];
                    if (brick && brick.visible) {
                        // Check collision with brick
                        if (
                            ballObj.x + ballObj.radius > brick.x &&
                            ballObj.x - ballObj.radius < brick.x + brick.width &&
                            ballObj.y + ballObj.radius > brick.y &&
                            ballObj.y - ballObj.radius < brick.y + brick.height
                        ) {
                            // Only bounce if the brick is not indestructible or if it is and the ball hit from the bottom
                            if (brick.type !== 3 || ballObj.dy < 0) {
                                // Determine ball's hit direction on the brick
                                const hitFromTop = ballObj.y + ballObj.radius - brick.y < 10;
                                const hitFromBottom = brick.y + brick.height - (ballObj.y - ballObj.radius) < 10;
                                
                                if (hitFromTop || hitFromBottom) {
                                    ballObj.dy = -ballObj.dy;
                                } else {
                                    ballObj.dx = -ballObj.dx;
                                }
                            }
                            
                            // Reduce brick health if not indestructible
                            if (brick.type !== 3) {
                                brick.health--;
                                
                                if (brick.health <= 0) {
                                    brick.visible = false;
                                    
                                    // Add score based on brick type
                                    score += brick.type * 10;
                                    updateScoreDisplay();
                                    
                                    // Create split effect
                                    createSplitEffect(
                                        brick.x + brick.width / 2,
                                        brick.y + brick.height / 2,
                                        currentTheme.brickColors[brick.type - 1]
                                    );
                                    
                                    // Check if brick has a powerup
                                    if (brick.powerup) {
                                        createPowerup(
                                            brick.x + brick.width / 2 - 10,
                                            brick.y + brick.height,
                                            brick.powerup
                                        );
                                    }
                                    
                                    // Check if level is complete
                                    checkLevelComplete();
                                }
                            }
                            
                            // Break since ball hit a brick
                            break;
                        }
                    }
                }
            }
        }
        
        // Update powerups
        for (let i = powerups.length - 1; i >= 0; i--) {
            const powerup = powerups[i];
            powerup.y += powerup.dy;
            
            // Check if powerup goes off-screen
            if (powerup.y > GAME_HEIGHT) {
                powerups.splice(i, 1);
                continue;
            }
            
            // Check for collision with paddle
            if (
                powerup.y + powerup.height > paddle.y &&
                powerup.y < paddle.y + paddle.height &&
                powerup.x + powerup.width > paddle.x &&
                powerup.x < paddle.x + paddle.width
            ) {
                // Apply powerup effect
                applyPowerup(powerup.type);
                
                // Remove the powerup
                powerups.splice(i, 1);
                
                // Add points for catching a powerup
                score += 25;
                updateScoreDisplay();
            }
        }
        
        // Handle keyboard input
        if (keys.left) {
            paddle.dx = -paddle.speed;
        } else if (keys.right) {
            paddle.dx = paddle.speed;
        } else {
            paddle.dx = 0;
        }
        
        if (keys.space && !ball.launched && gameRunning) {
            launchBall();
        }
    }
    
    // Check if level is complete
    function checkLevelComplete() {
        let levelCleared = true;
        
        // Check if any non-indestructible bricks remain
        for (let r = 0; r < brickRowCount; r++) {
            for (let c = 0; c < brickColumnCount; c++) {
                const brick = bricks[r] && bricks[r][c];
                if (brick && brick.visible && brick.type !== 3) {
                    levelCleared = false;
                    break;
                }
            }
            if (!levelCleared) break;
        }
        
        if (levelCleared) {
            // Add bonus points for completing the level
            const timeBonus = Math.max(0, 30000 - (Date.now() - gameStartTime));
            const livesBonus = lives * 100;
            const levelBonus = level * 500;
            
            score += timeBonus + livesBonus + levelBonus;
            updateScoreDisplay();
            
            // Check if all levels are complete
            if (level >= levelPatterns.length) {
                gameOver();
            } else {
                levelComplete();
            }
        }
    }
    
    // Game loop
    function gameLoop() {
        console.log('gameLoop called, gameRunning:', gameRunning);
        if (gameRunning) {
            update();
            draw();
            requestAnimationFrame(gameLoop);
        } else {
            console.log('Game not running, gameLoop stopping');
        }
    }
    
    // Initialize the game
    function init() {
        setupCanvas();
        resetGame();
        
        // Event listeners for keyboard
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') keys.left = true;
            if (e.key === 'ArrowRight') keys.right = true;
            if (e.key === ' ') keys.space = true;
            if (e.key === 'Escape') {
                if (gameRunning) {
                    gameRunning = false;
                    menu.classList.remove('hidden');
                } else if (!menu.classList.contains('hidden')) {
                    gameRunning = true;
                    menu.classList.add('hidden');
                    requestAnimationFrame(gameLoop);
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft') keys.left = false;
            if (e.key === 'ArrowRight') keys.right = false;
            if (e.key === ' ') keys.space = false;
        });
        
        // Event listeners for buttons with debugging
        console.log('Setting up button event listeners');
        console.log('startButton:', startButton);
        startButton.addEventListener('click', function() {
            console.log('Start button clicked');
            startGame();
        });
        highScoresButton.addEventListener('click', showHighScores);
        submitScoreButton.addEventListener('click', submitScore);
        restartButton.addEventListener('click', startGame);
        backButton.addEventListener('click', returnToMenu);
        nextLevelButton.addEventListener('click', startNextLevel);
        
        // Show menu
        menu.classList.remove('hidden');
    }
    
    // Helper function to shade a color
    function shadeColor(color, percent) {
        let R = parseInt(color.substring(1, 3), 16);
        let G = parseInt(color.substring(3, 5), 16);
        let B = parseInt(color.substring(5, 7), 16);
        
        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);
        
        R = R < 255 ? R : 255;
        G = G < 255 ? G : 255;
        B = B < 255 ? B : 255;
        
        R = Math.round(R);
        G = Math.round(G);
        B = Math.round(B);
        
        const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
        const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
        const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));
        
        return "#" + RR + GG + BB;
    }
    
    // Start the game when the DOM is fully loaded
    init();
});