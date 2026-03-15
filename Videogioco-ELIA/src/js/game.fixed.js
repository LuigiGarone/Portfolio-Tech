// NeonBreak: Cyberpunk Arkanoid - Fixed version
(function() {
    'use strict';
    
    // Log that the script is loaded
    console.log('Game script loaded');
    
    // Wait for DOM to be fully loaded
    window.addEventListener('DOMContentLoaded', init);
    
    // Game state
    const gameState = {
        running: false,
        score: 0,
        lives: 3,
        level: 1,
        bricks: [],
        brickRowCount: 4,
        brickColumnCount: 8,
        powerups: [],
        balls: [],
        gameStartTime: 0
    };
    
    // Game objects
    let canvas, ctx, paddle, mainBall;
    
    // DOM elements
    let scoreEl, levelEl, livesEl, menuScreen, gameOverScreen, 
        highScoresScreen, levelCompleteScreen, finalScoreEl, levelScoreEl, scoresListEl;
    
    // Buttons
    let startButton, highScoresButton, submitScoreButton, 
        restartButton, backButton, nextLevelButton, playerNameInput;
    
    // Constants
    const GAME_WIDTH = 800;
    const GAME_HEIGHT = 540;
    const PADDLE_WIDTH = 100;
    const PADDLE_HEIGHT = 15;
    const BALL_RADIUS = 8;
    const BRICK_WIDTH = 75;
    const BRICK_HEIGHT = 25;
    const BRICK_PADDING = 10;
    const BRICK_TOP_OFFSET = 60;
    const BRICK_LEFT_OFFSET = 35;
    const PADDLE_SPEED = 8;
    
    // High scores
    let highScores = [];
    
    // Powerup types
    const POWERUP_TYPES = {
        EXTEND: 'extend',           // Racchetta più larga
        SHRINK: 'shrink',           // Racchetta più piccola
        SLOW: 'slow',               // Palla più lenta
        FAST: 'fast',               // Palla più veloce
        MULTI_BALL: 'multi-ball',   // Palla multipla (2 palle)
        EXTRA_LIFE: 'extra-life',   // Vita extra
        DOUBLE_BALL: 'double-ball', // Doppia palla (4 palle)
        SUPER_SPEED: 'super-speed', // Super velocità palla
        MEGA_PADDLE: 'mega-paddle', // Racchetta mega grande
        DUAL_PADDLE: 'dual-paddle'  // Doppia racchetta
    };
    
    // Controls
    const keys = {
        left: false,
        right: false,
        space: false,
        escape: false,
        shift: false, // Aggiunto per velocità racchetta aumentata
        w: false,     // Cheat code per vite infinite
        i: false,     // Cheat code per palla che non cade
        p: false      // Toggle per persistent powerups
    };

    // Cheat codes
    const cheats = {
        infiniteLives: false,
        noBallDrop: false,
        persistentPowerups: true,  // Mantieni i power-up tra i livelli (attivo di default)
        secretLevelUnlocked: false // Traccia se il livello segreto è stato sbloccato
    };

    // Variabili per il livello segreto
    let secretLevelSequence = {
        stage: 0,         // Stato della sequenza di attivazione
        paddleRightTime: 0, // Timestamp di quando la racchetta è stata spostata a destra
        clicks: 0,        // Numero di click fatti
        clickTime: 0      // Timestamp dell'ultimo click
    };

    // Audio
    const sounds = {
        paddle: null,
        brick: null,
        powerup: null,
        life: null,
        levelUp: null,
        gameOver: null,
        backgroundMusic: null
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
        ],
        // SECRET LEVEL - Smiley Face
        [
            [0, 1, 1, 0, 0, 1, 1, 0],
            [1, 0, 0, 1, 1, 0, 0, 1],
            [1, 0, 0, 1, 1, 0, 0, 1],
            [0, 1, 1, 0, 0, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [0, 1, 1, 1, 1, 1, 1, 0]
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
        },
        // SECRET LEVEL THEME - Extra colorful
        {
            background: '#000520',
            paddle: '#ff00ff',
            ballGlow: '#ffff00',
            ballFill: '#ffffff',
            brickColors: ['#ff00ff', '#00ffff', '#ffff00'],
            textColor: '#00ff99'
        }
    ];
    
    // Current theme
    let currentTheme = levelThemes[0];
    
    // Animation frame ID for cancellation
    let animationId = null;

    // Seconda racchetta per il powerup dual paddle
    let secondPaddle = null;

    // Fattore di difficoltà che aumenta con i livelli
    let difficultyFactor = 1.0;

    // Sistema audio
    let audioSystem = null;

    // Initialize game
    function init() {
        console.log('Initializing game...');

        try {
            // Inizializza l'audio
            loadSounds();

            // Aggiungi handler per la guida dei power-up
            window.addEventListener('DOMContentLoaded', function() {
                const showGuideBtn = document.getElementById('showPowerupGuide');
                const closeGuideBtn = document.getElementById('closePowerupGuide');
                const powerupGuide = document.getElementById('powerupGuide');

                if (showGuideBtn && closeGuideBtn && powerupGuide) {
                    showGuideBtn.addEventListener('click', function(e) {
                        e.stopPropagation(); // Previene il click sul menu sottostante
                        powerupGuide.style.display = 'block';
                    });

                    closeGuideBtn.addEventListener('click', function() {
                        powerupGuide.style.display = 'none';
                    });
                }
            });
            // Get canvas and context
            canvas = document.getElementById('gameCanvas');
            if (!canvas) {
                throw new Error('Canvas element not found');
            }
            
            ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Could not get 2D context');
            }
            
            console.log('Canvas and context initialized successfully');
            
            // Set canvas dimensions
            canvas.width = GAME_WIDTH;
            canvas.height = GAME_HEIGHT;
            
            // Get DOM elements
            scoreEl = document.getElementById('score');
            levelEl = document.getElementById('level');
            livesEl = document.getElementById('lives');
            menuScreen = document.getElementById('menu');
            gameOverScreen = document.getElementById('gameOver');
            highScoresScreen = document.getElementById('highScores');
            levelCompleteScreen = document.getElementById('levelComplete');
            finalScoreEl = document.getElementById('finalScore');
            levelScoreEl = document.getElementById('levelScore');
            scoresListEl = document.getElementById('scoresList');
            
            // Get buttons
            startButton = document.getElementById('startButton');
            highScoresButton = document.getElementById('highScoresButton');
            submitScoreButton = document.getElementById('submitScore');
            restartButton = document.getElementById('restartButton');
            backButton = document.getElementById('backButton');
            nextLevelButton = document.getElementById('nextLevelButton');
            playerNameInput = document.getElementById('playerName');
            
            // Initialize paddle
            paddle = {
                width: PADDLE_WIDTH,
                height: PADDLE_HEIGHT,
                x: GAME_WIDTH / 2 - PADDLE_WIDTH / 2,
                y: GAME_HEIGHT - PADDLE_HEIGHT - 10,
                speed: PADDLE_SPEED,
                dx: 0
            };
            
            // Initialize ball
            mainBall = {
                radius: BALL_RADIUS,
                x: GAME_WIDTH / 2,
                y: GAME_HEIGHT - PADDLE_HEIGHT - BALL_RADIUS - 10,
                dx: 0,
                dy: 0,
                speed: 5,
                launched: false
            };
            
            // Initialize game state
            gameState.balls = [mainBall];
            
            // Load high scores from localStorage
            try {
                const savedScores = localStorage.getItem('neonbreakScores');
                if (savedScores) {
                    highScores = JSON.parse(savedScores);
                    console.log('Loaded high scores:', highScores.length);
                }
            } catch (e) {
                console.error('Error loading high scores:', e);
                highScores = [];
            }
            
            // Set up event listeners
            setupEventListeners();
            
            // Initialize game
            resetGame();
            
            // Show menu
            showScreen(menuScreen);

            // Avvia la musica di sottofondo nel menu iniziale
            if (audioSystem && audioSystem.enabled) {
                sounds.backgroundMusic.play();
            }

            console.log('Game initialized successfully');
        } catch (error) {
            console.error('Error initializing game:', error);
            alert('Error initializing game: ' + error.message);
        }
    }
    
    // Set up event listeners
    function setupEventListeners() {
        console.log('Setting up event listeners');
        
        // Keyboard events
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        // Mouse click handling for secret level
        canvas.addEventListener('click', handleCanvasClick);
        
        // Button clicks
        if (startButton) {
            startButton.addEventListener('click', handleStartGame);
            console.log('Start button listener added');
        }
        
        if (highScoresButton) highScoresButton.addEventListener('click', handleShowHighScores);
        if (submitScoreButton) submitScoreButton.addEventListener('click', handleSubmitScore);
        if (restartButton) restartButton.addEventListener('click', handleStartGame);
        if (backButton) backButton.addEventListener('click', handleReturnToMenu);
        if (nextLevelButton) nextLevelButton.addEventListener('click', handleStartNextLevel);
    }
    
    // Inizializza il sistema audio
    function loadSounds() {
        try {
            // Crea l'istanza del sistema audio 8-bit
            if (window.Audio8Bit) {
                audioSystem = new Audio8Bit();
                audioSystem.init();

                // Mappa i metodi ai suoni
                sounds.paddle = {
                    play: function() { audioSystem.sfxPaddleHit(); }
                };

                sounds.brick = {
                    play: function() { audioSystem.sfxBrickBreak(); }
                };

                sounds.powerup = {
                    play: function() { audioSystem.sfxPowerUp(); }
                };

                sounds.life = {
                    play: function() { audioSystem.sfxExtraLife(); }
                };

                sounds.levelUp = {
                    play: function() { audioSystem.sfxLevelUp(); }
                };

                sounds.gameOver = {
                    play: function() { audioSystem.sfxGameOver(); }
                };

                sounds.backgroundMusic = {
                    play: function() { audioSystem.playBackgroundMusic(); },
                    stop: function() { audioSystem.stopBackgroundMusic(); }
                };

                // Crea un pulsante per abilitare l'audio
                const audioEnableBtn = document.createElement('button');
                audioEnableBtn.id = 'audio-enable-btn';
                audioEnableBtn.textContent = '🔊 Enable Sound & Music';
                audioEnableBtn.style.position = 'fixed';
                audioEnableBtn.style.top = '5px';
                audioEnableBtn.style.right = '5px';
                audioEnableBtn.style.zIndex = '999';
                audioEnableBtn.style.padding = '8px 12px';
                audioEnableBtn.style.background = '#ff00ff';
                audioEnableBtn.style.color = '#fff';
                audioEnableBtn.style.border = '2px solid #00ffff';
                audioEnableBtn.style.borderRadius = '5px';
                audioEnableBtn.style.cursor = 'pointer';
                audioEnableBtn.style.fontFamily = "'Orbitron', sans-serif";
                audioEnableBtn.style.fontSize = '14px';
                audioEnableBtn.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.5)';

                // Aggiungi il pulsante al body quando il DOM è caricato
                window.addEventListener('DOMContentLoaded', function() {
                    document.body.appendChild(audioEnableBtn);

                    // Configura l'evento click per il pulsante audio
                    audioEnableBtn.addEventListener('click', function() {
                        audioSystem.enable();

                        // Avvia la musica di sottofondo
                        sounds.backgroundMusic.play();

                        // Suona un effetto per feedback
                        sounds.levelUp.play();

                        // Aggiorna il pulsante
                        audioEnableBtn.textContent = '🔊 Sound ON';
                        audioEnableBtn.style.opacity = '0.7';

                        // Rimuovi il pulsante dopo un po'
                        setTimeout(() => {
                            audioEnableBtn.style.opacity = '0.3';
                        }, 2000);
                    });
                });

                console.log('8-bit audio system initialized successfully');
            } else {
                console.error('Audio8Bit class not found');
            }
        } catch (e) {
            console.error('Error initializing audio system:', e);
        }
    }

    // Play sound
    function playSound(name) {
        try {
            // Verifica che il sistema audio sia inizializzato e che il suono esista
            if (audioSystem && sounds[name] && typeof sounds[name].play === 'function') {
                sounds[name].play();
            }
        } catch (e) {
            console.log('Error playing sound:', e);
        }
    }

    // Handle key down events
    function handleKeyDown(e) {
        // Inputs principali
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
        if (e.key === ' ') keys.space = true;
        if (e.key === 'Escape') handleEscapeKey();
        if (e.key === 'Shift') keys.shift = true;

        // Cheat codes
        if (e.key === 'w' || e.key === 'W') {
            keys.w = true;
            toggleInfiniteLives();
        }

        if (e.key === 'i' || e.key === 'I') {
            keys.i = true;
            toggleNoBallDrop();
        }

        if (e.key === 'p' || e.key === 'P') {
            keys.p = true;
            togglePersistentPowerups();
        }

        // Previeni il comportamento predefinito dei tasti di navigazione
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
            e.preventDefault();
        }
    }

    // Handle key up events
    function handleKeyUp(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
        if (e.key === ' ') keys.space = false;
        if (e.key === 'Shift') keys.shift = false;
        if (e.key === 'w' || e.key === 'W') keys.w = false;
        if (e.key === 'i' || e.key === 'I') keys.i = false;
        if (e.key === 'p' || e.key === 'P') keys.p = false;
    }
    
    // Handle Escape key
    function handleEscapeKey() {
        if (gameState.running) {
            pauseGame();

            // Quando si torna al menu con ESC, avvia la musica
            if (audioSystem && audioSystem.enabled) {
                sounds.backgroundMusic.play();
            }

            showScreen(menuScreen);
        } else if (!menuScreen.classList.contains('hidden')) {
            resumeGame();
        }
    }
    
    // Handle start game button click
    function handleStartGame() {
        console.log('Start game button clicked');
        startGame();
    }
    
    // Handle show high scores button click
    function handleShowHighScores() {
        showHighScores();
    }
    
    // Handle submit score button click
    function handleSubmitScore() {
        submitScore();
    }
    
    // Handle return to menu button click
    function handleReturnToMenu() {
        // Avvia la musica di sottofondo nel menu
        if (audioSystem && audioSystem.enabled) {
            sounds.backgroundMusic.play();
        }

        showScreen(menuScreen);
    }
    
    // Handle start next level button click
    function handleStartNextLevel() {
        startNextLevel();
    }

    // Handle canvas click for secret level activation
    function handleCanvasClick(e) {
        // Solo se siamo al livello 3 e la racchetta è stata spostata a destra
        if (gameState.level === 3 && secretLevelSequence.stage === 1) {
            secretLevelSequence.clicks++;

            // Reset del timer dei click se è passato troppo tempo
            const now = Date.now();
            if (now - secretLevelSequence.clickTime > 1000) {
                secretLevelSequence.clicks = 1;
            }

            secretLevelSequence.clickTime = now;

            console.log('Secret level clicks:', secretLevelSequence.clicks);

            // Se abbiamo 2 click entro 1 secondo, attiva il livello segreto
            if (secretLevelSequence.clicks === 2 &&
                now - secretLevelSequence.paddleRightTime < 3000) {

                console.log('Secret level sequence complete!');
                activateSecretLevel();

                // Reset della sequenza
                secretLevelSequence.stage = 0;
                secretLevelSequence.paddleRightTime = 0;
                secretLevelSequence.clicks = 0;
                secretLevelSequence.clickTime = 0;
            }
        }
    }

    // Toggle infinite lives cheat
    function toggleInfiniteLives() {
        if (gameState.running) {
            cheats.infiniteLives = !cheats.infiniteLives;

            // Effetto visivo e sonoro per confermare l'attivazione del cheat
            if (cheats.infiniteLives) {
                // Setta vite a 99 per indicare visivamente che sono infinite
                gameState.lives = 99;
                updateScoreDisplay();

                // Effetto sonoro di power-up
                playSound('life');
                playSound('life'); // Doppio suono per enfatizzare

                // Mostra messaggio di conferma
                showCheatMessage('INFINITE LIVES ACTIVATED!', '#00ff00');
            } else {
                // Ripristina le vite a 3 quando si disattiva
                gameState.lives = 3;
                updateScoreDisplay();

                // Effetto sonoro di disattivazione
                playSound('brick');

                // Mostra messaggio di disattivazione
                showCheatMessage('Infinite Lives Deactivated', '#ff0000');
            }
        }
    }

    // Toggle no ball drop cheat
    function toggleNoBallDrop() {
        if (gameState.running) {
            cheats.noBallDrop = !cheats.noBallDrop;

            // Effetto visivo e sonoro per confermare l'attivazione del cheat
            if (cheats.noBallDrop) {
                // Effetti sonori per attivazione
                playSound('powerup');
                setTimeout(() => playSound('powerup'), 150);

                // Visual effect - add a floor line
                const floorLine = document.createElement('div');
                floorLine.id = 'floor-barrier';
                floorLine.style.position = 'fixed';
                floorLine.style.bottom = '0';
                floorLine.style.left = '0';
                floorLine.style.width = '100%';
                floorLine.style.height = '3px';
                floorLine.style.backgroundColor = '#00ffff';
                floorLine.style.boxShadow = '0 0 10px 2px #00ffff';
                floorLine.style.zIndex = '999';
                document.body.appendChild(floorLine);

                // Animazione di pulsazione
                let growing = true;
                const pulseInterval = setInterval(() => {
                    if (!cheats.noBallDrop) {
                        clearInterval(pulseInterval);
                        return;
                    }

                    const currentHeight = parseInt(floorLine.style.height);
                    if (growing) {
                        floorLine.style.height = (currentHeight + 1) + 'px';
                        if (currentHeight >= 5) growing = false;
                    } else {
                        floorLine.style.height = (currentHeight - 1) + 'px';
                        if (currentHeight <= 2) growing = true;
                    }
                }, 100);

                // Mostra messaggio di conferma
                showCheatMessage('ANTI-GRAVITY FLOOR ACTIVATED!', '#00ffff');
            } else {
                // Rimuovi la linea del pavimento
                const floorLine = document.getElementById('floor-barrier');
                if (floorLine) {
                    document.body.removeChild(floorLine);
                }

                // Effetto sonoro di disattivazione
                playSound('brick');

                // Mostra messaggio di disattivazione
                showCheatMessage('Anti-Gravity Floor Deactivated', '#ff0000');
            }
        }
    }

    // Mostra messaggio di cheat code attivato
        // Toggle persistent powerups cheat
    function togglePersistentPowerups() {
        if (gameState.running) {
            cheats.persistentPowerups = !cheats.persistentPowerups;

            if (cheats.persistentPowerups) {
                // Effetto sonoro di attivazione
                playSound('powerup');

                // Mostra messaggio di attivazione
                showCheatMessage('POWER-UPS PERSISTENCE ON!', '#ffff00');
            } else {
                // Effetto sonoro di disattivazione
                playSound('brick');

                // Mostra messaggio di disattivazione
                showCheatMessage('Power-ups Will Reset Between Levels', '#ff0000');
            }
        }
    }

    // Mostra messaggio di cheat code attivato
    function showCheatMessage(message, color) {
        // Crea elemento per il messaggio
        const cheatMsg = document.createElement('div');
        cheatMsg.textContent = message;
        cheatMsg.style.position = 'fixed';
        cheatMsg.style.top = '50%';
        cheatMsg.style.left = '50%';
        cheatMsg.style.transform = 'translate(-50%, -50%)';
        cheatMsg.style.color = color;
        cheatMsg.style.fontFamily = "'Orbitron', sans-serif";
        cheatMsg.style.fontSize = '24px';
        cheatMsg.style.fontWeight = 'bold';
        cheatMsg.style.textShadow = '0 0 10px ' + color;
        cheatMsg.style.zIndex = '9999';
        cheatMsg.style.pointerEvents = 'none'; // Non interferisce con i click

        // Aggiungi al body
        document.body.appendChild(cheatMsg);

        // Animazione di fade-out
        setTimeout(() => {
            let opacity = 1;
            const fadeInterval = setInterval(() => {
                opacity -= 0.05;
                cheatMsg.style.opacity = opacity;

                if (opacity <= 0) {
                    clearInterval(fadeInterval);
                    document.body.removeChild(cheatMsg);
                }
            }, 50);
        }, 1500);
    }
    
    // Start the game
    function startGame() {
        console.log('Starting game...');
        resetGame();
        gameState.running = true;

        hideAllScreens();

        gameState.gameStartTime = Date.now();

        // Ferma la musica di sottofondo durante il gioco
        if (audioSystem && audioSystem.enabled) {
            sounds.backgroundMusic.stop();
        }

        // Riproduci effetto sonoro di inizio gioco
        playSound('levelUp');

        // Start the game loop
        if (animationId) {
            cancelAnimationFrame(animationId);
        }

        animationId = requestAnimationFrame(gameLoop);
        console.log('Game started');
    }
    
    // Pause the game
    function pauseGame() {
        console.log('Pausing game');
        gameState.running = false;

        // Ferma la musica di sottofondo temporaneamente
        if (audioSystem && audioSystem.enabled) {
            sounds.backgroundMusic.stop();
        }
    }
    
    // Resume the game
    function resumeGame() {
        console.log('Resuming game');
        if (!gameState.running) {
            gameState.running = true;
            hideAllScreens();

            // Durante il gioco la musica deve rimanere spenta
            if (audioSystem && audioSystem.enabled) {
                sounds.backgroundMusic.stop();
            }

            animationId = requestAnimationFrame(gameLoop);
        }
    }
    
    // Reset the game
    function resetGame() {
        console.log('Resetting game state');
        
        // Reset game state
        gameState.score = 0;
        gameState.lives = 3;
        gameState.level = 1;
        gameState.powerups = [];
        
        // Reset paddle
        paddle.width = PADDLE_WIDTH;
        paddle.speed = PADDLE_SPEED;
        
        // Reset ball
        mainBall.speed = 5;
        resetBall(mainBall);
        gameState.balls = [mainBall];
        
        // Reset theme
        currentTheme = levelThemes[0];
        
        // Create bricks for current level
        createBricks();
        
        // Update score display
        updateScoreDisplay();
    }
    
    // Reset ball position
    function resetBall(ball) {
        ball.x = paddle.x + paddle.width / 2;
        ball.y = paddle.y - ball.radius;
        ball.dx = 0;
        ball.dy = 0;
        ball.launched = false;
    }
    
    // Create bricks for current level
    function createBricks() {
        gameState.bricks = [];
        const pattern = levelPatterns[Math.min(gameState.level - 1, levelPatterns.length - 1)];
        gameState.brickRowCount = pattern.length;
        gameState.brickColumnCount = pattern[0].length;
        
        for (let r = 0; r < gameState.brickRowCount; r++) {
            gameState.bricks[r] = [];
            for (let c = 0; c < gameState.brickColumnCount; c++) {
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
                    
                    gameState.bricks[r][c] = {
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
    
    // Start the next level
    function startNextLevel() {
        // Salva gli stati dei power-up attivi
        const oldPaddleWidth = paddle.width;
        const oldSecondPaddle = secondPaddle;
        const hadDualPaddle = secondPaddle !== null;
        const oldBallSpeed = mainBall.speed;

        gameState.level++;

        // Aumenta la difficoltà con il livello
        difficultyFactor = 1.0 + (gameState.level - 1) * 0.15; // 15% di aumento per livello

        // Ripristina la palla principale
        resetBall(mainBall);
        gameState.balls = [mainBall];
        gameState.powerups = [];

        // Suono di cambio livello
        playSound('levelUp');

        if (cheats.persistentPowerups) {
            // Mantieni la velocità della palla
            mainBall.speed = oldBallSpeed;

            // Mantieni la dimensione della racchetta
            paddle.width = oldPaddleWidth;

            // Reimposta la seconda racchetta se era attiva
            if (hadDualPaddle) {
                secondPaddle = {
                    width: oldSecondPaddle.width,
                    height: PADDLE_HEIGHT,
                    x: paddle.x,
                    y: paddle.y - 100, // 100px sopra la racchetta principale
                    speed: PADDLE_SPEED,
                    dx: 0
                };
            }
        } else {
            // Reset a valori di default se i powerup non sono persistenti
            mainBall.speed = 5;
            paddle.width = PADDLE_WIDTH;
            secondPaddle = null;
        }

        // Imposta il tema del livello
        currentTheme = levelThemes[Math.min(gameState.level - 1, levelThemes.length - 1)];

        // Crea i mattoni per il nuovo livello
        createBricks();

        hideAllScreens();

        // Mostra un messaggio di conferma per i power-up mantenuti o reset
        if (cheats.persistentPowerups) {
            if (paddle.width > PADDLE_WIDTH || mainBall.speed !== 5 || hadDualPaddle) {
                let powerUpMessage = 'POWER-UPS MAINTAINED!';
                showCheatMessage(powerUpMessage, '#00ffff');
            }
        } else {
            if (oldPaddleWidth > PADDLE_WIDTH || oldBallSpeed !== 5 || hadDualPaddle) {
                let powerUpMessage = 'POWER-UPS RESET';
                showCheatMessage(powerUpMessage, '#ff9900');
            }
        }

        gameState.running = true;
        updateScoreDisplay();

        if (animationId) {
            cancelAnimationFrame(animationId);
        }

        animationId = requestAnimationFrame(gameLoop);

        console.log('Level', gameState.level, 'started, difficulty factor:', difficultyFactor, 'paddle width:', paddle.width, 'ball speed:', mainBall.speed);
    }
    
    // Launch the ball
    function launchBall() {
        if (!mainBall.launched) {
            mainBall.launched = true;
            mainBall.dx = mainBall.speed * (Math.random() > 0.5 ? 1 : -1);
            mainBall.dy = -mainBall.speed;

            // Suono di lancio
            playSound('paddle');
        }
    }
    
    // Update score display
    function updateScoreDisplay() {
        if (scoreEl) scoreEl.textContent = `Score: ${gameState.score}`;
        if (levelEl) levelEl.textContent = `Level: ${gameState.level}`;
        if (livesEl) livesEl.textContent = `Vite: ${gameState.lives}`;
    }
    
    // Show high scores
    function showHighScores() {
        if (!scoresListEl) return;
        
        scoresListEl.innerHTML = '';
        
        const sortedScores = [...highScores].sort((a, b) => b.score - a.score);
        
        if (sortedScores.length === 0) {
            scoresListEl.innerHTML = '<p>No high scores yet!</p>';
        } else {
            sortedScores.forEach((score, index) => {
                const scoreItem = document.createElement('div');
                scoreItem.classList.add('score-item');
                scoreItem.innerHTML = `
                    <span>${index + 1}. ${score.name}</span>
                    <span>${score.score} (${score.level > 5 ? 'Completed!' : 'Level ' + score.level})</span>
                `;
                scoresListEl.appendChild(scoreItem);
            });
        }
        
        hideAllScreens();
        showScreen(highScoresScreen);
    }
    
    // Submit score
    function submitScore() {
        const playerName = playerNameInput ? (playerNameInput.value.trim() || 'Player') : 'Player';
        
        highScores.push({
            name: playerName,
            score: gameState.score,
            level: gameState.level,
            date: new Date().toISOString()
        });
        
        // Keep only top 10 scores
        highScores.sort((a, b) => b.score - a.score);
        if (highScores.length > 10) {
            highScores.length = 10;
        }
        
        try {
            localStorage.setItem('neonbreakScores', JSON.stringify(highScores));
        } catch (e) {
            console.error('Error saving high scores:', e);
        }
        
        showHighScores();
    }
    
    // Handle game over
    function handleGameOver() {
        gameState.running = false;

        // Avvia la musica di sottofondo nel game over
        if (audioSystem && audioSystem.enabled) {
            sounds.backgroundMusic.play();
        }

        // Riproduci suono game over
        playSound('gameOver');

        if (finalScoreEl) {
            const difficultyBonus = Math.floor(gameState.score * (difficultyFactor - 1) * 0.1);
            const finalScore = gameState.score + difficultyBonus;
            gameState.score = finalScore; // Aggiorna lo score finale

            finalScoreEl.textContent = `Score: ${finalScore} (Level ${gameState.level}, Difficulty x${difficultyFactor.toFixed(1)})`;
        }

        showScreen(gameOverScreen);
    }
    
    // Handle level complete
    function handleLevelComplete() {
        gameState.running = false;
        if (levelScoreEl) levelScoreEl.textContent = `Score: ${gameState.score}`;
        showScreen(levelCompleteScreen);
    }
    
    // Check if level is complete
    function checkLevelComplete() {
        let levelCleared = true;
        
        // Check if any non-indestructible bricks remain
        for (let r = 0; r < gameState.brickRowCount; r++) {
            for (let c = 0; c < gameState.brickColumnCount; c++) {
                const brick = gameState.bricks[r] && gameState.bricks[r][c];
                if (brick && brick.visible && brick.type !== 3) {
                    levelCleared = false;
                    break;
                }
            }
            if (!levelCleared) break;
        }
        
        if (levelCleared) {
            // Add bonus points for completing the level
            const timeBonus = Math.max(0, 30000 - (Date.now() - gameState.gameStartTime));
            const livesBonus = gameState.lives * 100;
            const levelBonus = gameState.level * 500;
            
            gameState.score += Math.floor((timeBonus + livesBonus + levelBonus) / 100);
            updateScoreDisplay();
            
            // Check if all levels are complete
            if (gameState.level >= levelPatterns.length) {
                handleGameOver();
            } else {
                handleLevelComplete();
            }
        }
    }
    
    // Create a new powerup
    function createPowerup(x, y, type) {
        gameState.powerups.push({
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
        // Suono del powerup
        playSound('powerup');

        switch (type) {
            case POWERUP_TYPES.EXTEND:
                paddle.width = Math.min(paddle.width * 1.5, GAME_WIDTH / 2);
                break;

            case POWERUP_TYPES.SHRINK:
                paddle.width = Math.max(paddle.width * 0.7, PADDLE_WIDTH / 2);
                break;

            case POWERUP_TYPES.SLOW:
                gameState.balls.forEach(b => b.speed = Math.max(b.speed * 0.7, 3));
                break;

            case POWERUP_TYPES.FAST:
                gameState.balls.forEach(b => b.speed = Math.min(b.speed * 1.3, 12));
                break;

            case POWERUP_TYPES.MULTI_BALL:
                if (gameState.balls.length < 3) { // Limite a 3 palle
                    // Aggiungi due palle con angoli diversi
                    for (let i = 0; i < 2; i++) {
                        const newBall = {
                            radius: BALL_RADIUS,
                            x: paddle.x + paddle.width / 2,
                            y: paddle.y - BALL_RADIUS,
                            dx: mainBall.speed * (i === 0 ? -0.8 : 0.8),
                            dy: -mainBall.speed,
                            speed: mainBall.speed,
                            launched: true
                        };
                        gameState.balls.push(newBall);
                    }
                }
                break;

            case POWERUP_TYPES.EXTRA_LIFE:
                gameState.lives++;
                updateScoreDisplay();
                playSound('life'); // Suono speciale per vita extra
                break;

            case POWERUP_TYPES.DOUBLE_BALL:
                // Aggiungi 4 palle con angoli diversi
                if (gameState.balls.length < 5) { // Limite a 5 palle totali
                    const angles = [-0.9, -0.3, 0.3, 0.9];
                    for (let i = 0; i < 4; i++) {
                        const newBall = {
                            radius: BALL_RADIUS,
                            x: paddle.x + paddle.width / 2,
                            y: paddle.y - BALL_RADIUS,
                            dx: mainBall.speed * angles[i],
                            dy: -mainBall.speed,
                            speed: mainBall.speed,
                            launched: true
                        };
                        gameState.balls.push(newBall);
                    }
                }
                break;

            case POWERUP_TYPES.SUPER_SPEED:
                // Velocità super aumentata per le palle
                gameState.balls.forEach(b => {
                    b.speed = Math.min(b.speed * 2, 15); // Limite massimo più alto
                    // Assicurati che la direzione sia corretta
                    if (b.dy > 0) b.dy = b.speed;
                    else b.dy = -b.speed;
                });
                break;

            case POWERUP_TYPES.MEGA_PADDLE:
                // Racchetta super larga
                paddle.width = Math.min(paddle.width * 2, GAME_WIDTH * 0.7);
                break;

            case POWERUP_TYPES.DUAL_PADDLE:
                // Crea una seconda racchetta sopra la prima
                secondPaddle = {
                    width: PADDLE_WIDTH * 0.8, // Leggermente più piccola
                    height: PADDLE_HEIGHT,
                    x: paddle.x,
                    y: paddle.y - 100, // 100px sopra la racchetta principale
                    speed: PADDLE_SPEED,
                    dx: 0
                };
                break;
        }
    }
    
    // Create explosion effect when brick is destroyed
    function createSplitEffect(x, y, color) {
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
    
    // Function to warp to secret level
    function activateSecretLevel() {
        // Solo se siamo al livello 3 e non l'abbiamo già sbloccato
        if (gameState.level === 3 && !cheats.secretLevelUnlocked) {
            cheats.secretLevelUnlocked = true;

            // Effetti speciali per l'attivazione del livello segreto
            // Suono speciale
            playSound('powerup');
            setTimeout(() => playSound('life'), 200);
            setTimeout(() => playSound('powerup'), 400);

            // Effetto visivo speciale
            const secretEffect = document.createElement('div');
            secretEffect.style.position = 'fixed';
            secretEffect.style.top = '0';
            secretEffect.style.left = '0';
            secretEffect.style.width = '100%';
            secretEffect.style.height = '100%';
            secretEffect.style.backgroundColor = 'rgba(255, 0, 255, 0.2)';
            secretEffect.style.zIndex = '9999';
            secretEffect.style.transition = 'all 1s';
            secretEffect.style.opacity = '0';
            document.body.appendChild(secretEffect);

            // Effetto di flash
            setTimeout(() => {
                secretEffect.style.opacity = '1';
                setTimeout(() => {
                    secretEffect.style.opacity = '0';
                    setTimeout(() => {
                        document.body.removeChild(secretEffect);

                        // Mostra messaggio di livello segreto
                        showCheatMessage('SECRET LEVEL UNLOCKED!', '#ffff00');

                        // Passa al livello segreto (che è il numero 5 nell'array)
                        const secretLevelIndex = 5;
                        gameState.level = secretLevelIndex;

                        // Reimposta il gioco con il nuovo livello
                        resetBall(mainBall);
                        gameState.balls = [mainBall];
                        gameState.powerups = [];

                        // Applica potenziamenti speciali per il livello segreto
                        paddle.width = PADDLE_WIDTH * 1.5;
                        mainBall.speed = 6;

                        // Tema speciale per il livello segreto
                        currentTheme = levelThemes[secretLevelIndex];

                        // Crea i mattoni per il livello segreto
                        createBricks();

                        // Aggiorna il display
                        updateScoreDisplay();

                        // Bonus di punteggio per aver trovato il livello segreto
                        gameState.score += 5000;
                        updateScoreDisplay();

                        // Messaggio di bonus
                        setTimeout(() => {
                            showCheatMessage('+5000 POINTS BONUS!', '#00ff00');
                        }, 1500);
                    }, 500);
                }, 500);
            }, 100);

            return true;
        }
        return false;
    }

    // Update game state
    function update() {
        // Calcola la velocità della racchetta in base al tasto shift
        const currentPaddleSpeed = keys.shift ? paddle.speed * 1.8 : paddle.speed;

        // Check for secret level activation at level 3
        if (gameState.level === 3) {
            // Verifica la sequenza per il livello segreto
            if (keys.right && secretLevelSequence.stage === 0) {
                secretLevelSequence.paddleRightTime = Date.now();
                secretLevelSequence.stage = 1;
                console.log('Secret level stage 1: paddle moved right');
            } else if (!keys.right && secretLevelSequence.stage === 1) {
                // Se la racchetta non è più a destra e non abbiamo ancora fatto tutti i click
                // necessari entro il tempo, resetta la sequenza
                const now = Date.now();
                if (now - secretLevelSequence.paddleRightTime > 3000 ||
                    secretLevelSequence.clicks < 2) {
                    secretLevelSequence.stage = 0;
                    secretLevelSequence.paddleRightTime = 0;
                    secretLevelSequence.clicks = 0;
                    console.log('Secret level sequence reset');
                }
            }
        }

        // Move paddle based on input
        if (keys.left) {
            paddle.dx = -currentPaddleSpeed;
        } else if (keys.right) {
            paddle.dx = currentPaddleSpeed;
        } else {
            paddle.dx = 0;
        }

        // Launch ball with spacebar
        if (keys.space && !mainBall.launched && gameState.running) {
            launchBall();
        }

        // Move main paddle
        paddle.x += paddle.dx;

        // Boundary check for main paddle
        if (paddle.x < 0) {
            paddle.x = 0;
        } else if (paddle.x + paddle.width > GAME_WIDTH) {
            paddle.x = GAME_WIDTH - paddle.width;
        }

        // Update second paddle if exists
        if (secondPaddle) {
            // La seconda racchetta segue la principale ma con un leggero ritardo
            secondPaddle.x += (paddle.x - secondPaddle.x) * 0.3;

            // Assicurati che rimanga nei limiti
            if (secondPaddle.x < 0) {
                secondPaddle.x = 0;
            } else if (secondPaddle.x + secondPaddle.width > GAME_WIDTH) {
                secondPaddle.x = GAME_WIDTH - secondPaddle.width;
            }
        }
        
        // Update each ball
        for (let i = gameState.balls.length - 1; i >= 0; i--) {
            const ball = gameState.balls[i];
            
            // If ball is not launched, keep it on paddle
            if (!ball.launched) {
                ball.x = paddle.x + paddle.width / 2;
                continue;
            }
            
            // Move ball
            ball.x += ball.dx;
            ball.y += ball.dy;
            
            // Wall collision (right/left)
            if (ball.x + ball.radius > GAME_WIDTH || ball.x - ball.radius < 0) {
                ball.dx = -ball.dx;
                
                // Ensure ball stays in bounds
                if (ball.x + ball.radius > GAME_WIDTH) {
                    ball.x = GAME_WIDTH - ball.radius;
                } else if (ball.x - ball.radius < 0) {
                    ball.x = ball.radius;
                }
            }
            
            // Wall collision (top)
            if (ball.y - ball.radius < 0) {
                ball.dy = -ball.dy;
                ball.y = ball.radius;
            }
            
            // Bottom collision (lose a life or bounce if noBallDrop is active)
            if (ball.y + ball.radius > GAME_HEIGHT) {
                // Anti-gravity floor cheat active - rimbalza la palla
                if (cheats.noBallDrop) {
                    // Rimbalza la palla verso l'alto con un angolo casuale
                    ball.dy = -Math.abs(ball.dy); // Forza movimento verso l'alto

                    // Aggiungi un po' di variazione all'angolo di rimbalzo
                    const randomFactor = 0.2;
                    ball.dx = ball.dx + (Math.random() * randomFactor * 2 - randomFactor);

                    // Assicurati che la palla non attraversi il pavimento
                    ball.y = GAME_HEIGHT - ball.radius;

                    // Effetto visivo per il rimbalzo anti-gravità
                    const bounceEffect = document.createElement('div');
                    bounceEffect.style.position = 'fixed';
                    bounceEffect.style.bottom = '0';
                    bounceEffect.style.left = (ball.x / GAME_WIDTH * 100) + '%';
                    bounceEffect.style.width = '30px';
                    bounceEffect.style.height = '30px';
                    bounceEffect.style.marginLeft = '-15px';
                    bounceEffect.style.backgroundColor = 'transparent';
                    bounceEffect.style.borderRadius = '50%';
                    bounceEffect.style.boxShadow = '0 0 20px 5px #00ffff';
                    bounceEffect.style.zIndex = '998';
                    bounceEffect.style.opacity = '1';
                    document.body.appendChild(bounceEffect);

                    // Animazione dell'effetto di rimbalzo
                    let size = 30;
                    const bounceInterval = setInterval(() => {
                        size -= 3;
                        bounceEffect.style.width = size + 'px';
                        bounceEffect.style.height = size + 'px';
                        bounceEffect.style.marginLeft = (-size/2) + 'px';
                        bounceEffect.style.opacity = size / 30;

                        if (size <= 0) {
                            clearInterval(bounceInterval);
                            document.body.removeChild(bounceEffect);
                        }
                    }, 20);

                    // Play bounce sound
                    playSound('paddle');
                }
                // Normal behavior - lose a life or remove ball
                else {
                    // Remove this ball
                    if (gameState.balls.length > 1) {
                        gameState.balls.splice(i, 1);
                    } else {
                        // Check if infinite lives cheat is active
                        if (!cheats.infiniteLives) {
                            gameState.lives--;
                            updateScoreDisplay();

                            if (gameState.lives <= 0) {
                                handleGameOver();
                                return;
                            }
                        } else {
                            // Effetto visivo per la protezione vita infinita
                            const flashEffect = document.createElement('div');
                            flashEffect.style.position = 'fixed';
                            flashEffect.style.bottom = '0';
                            flashEffect.style.left = '0';
                            flashEffect.style.width = '100%';
                            flashEffect.style.height = '10px';
                            flashEffect.style.backgroundColor = '#00ff00';
                            flashEffect.style.zIndex = '999';
                            flashEffect.style.opacity = '0.7';
                            document.body.appendChild(flashEffect);

                            // Rimuovi dopo breve tempo
                            setTimeout(() => document.body.removeChild(flashEffect), 300);
                        }

                        resetBall(ball);
                    }
                }
            }
            
            // Main paddle collision
            if (
                ball.y + ball.radius > paddle.y &&
                ball.y + ball.radius < paddle.y + paddle.height &&
                ball.x > paddle.x &&
                ball.x < paddle.x + paddle.width
            ) {
                // Calculate hit position on paddle (0-1)
                const hitPosition = (ball.x - paddle.x) / paddle.width;

                // Calculate reflection angle (-60 to 60 degrees)
                const angle = -Math.PI / 3 + hitPosition * (2 * Math.PI / 3);

                ball.dy = -Math.abs(ball.dy);

                // Optionally, change the X direction based on hit position
                ball.dx = ball.speed * Math.sin(angle);

                // Ensure ball moves above paddle
                ball.y = paddle.y - ball.radius;

                // Suono collisione racchetta
                playSound('paddle');

                // Add a small speed increase occasionally, scalato con la difficoltà
                if (Math.random() < 0.1 * difficultyFactor) {
                    ball.speed = Math.min(ball.speed * 1.05, 12 * difficultyFactor);
                }
            }

            // Second paddle collision (if exists)
            if (secondPaddle &&
                ball.y - ball.radius < secondPaddle.y + secondPaddle.height &&
                ball.y + ball.radius > secondPaddle.y &&
                ball.x > secondPaddle.x &&
                ball.x < secondPaddle.x + secondPaddle.width
            ) {
                // Calculate hit position on second paddle (0-1)
                const hitPosition = (ball.x - secondPaddle.x) / secondPaddle.width;

                // Calculate reflection angle (-60 to 60 degrees)
                const angle = Math.PI / 3 - hitPosition * (2 * Math.PI / 3);

                ball.dy = Math.abs(ball.dy); // Direzione verso il basso

                // Optionally, change the X direction based on hit position
                ball.dx = ball.speed * Math.sin(angle);

                // Ensure ball moves below second paddle
                ball.y = secondPaddle.y + secondPaddle.height + ball.radius;

                // Suono collisione racchetta
                playSound('paddle');
            }
            
            // Brick collision
            for (let r = 0; r < gameState.brickRowCount; r++) {
                for (let c = 0; c < gameState.brickColumnCount; c++) {
                    const brick = gameState.bricks[r] && gameState.bricks[r][c];
                    if (brick && brick.visible) {
                        // Check collision with brick
                        if (
                            ball.x + ball.radius > brick.x &&
                            ball.x - ball.radius < brick.x + brick.width &&
                            ball.y + ball.radius > brick.y &&
                            ball.y - ball.radius < brick.y + brick.height
                        ) {
                            // Only bounce if the brick is not indestructible or if it is and the ball hit from the bottom
                            if (brick.type !== 3 || ball.dy < 0) {
                                // Determine ball's hit direction on the brick
                                const hitFromTop = ball.y + ball.radius - brick.y < 10;
                                const hitFromBottom = brick.y + brick.height - (ball.y - ball.radius) < 10;
                                
                                if (hitFromTop || hitFromBottom) {
                                    ball.dy = -ball.dy;
                                } else {
                                    ball.dx = -ball.dx;
                                }
                            }
                            
                            // Reduce brick health if not indestructible
                            if (brick.type !== 3) {
                                brick.health--;
                                
                                if (brick.health <= 0) {
                                    brick.visible = false;
                                    
                                    // Add score based on brick type, scalato con la difficoltà
                                    const baseScore = brick.type * 10;
                                    gameState.score += Math.floor(baseScore * difficultyFactor);
                                    updateScoreDisplay();

                                    // Suono del mattone distrutto
                                    playSound('brick');

                                    // Create split effect
                                    createSplitEffect(
                                        brick.x + brick.width / 2,
                                        brick.y + brick.height / 2,
                                        currentTheme.brickColors[brick.type - 1]
                                    );

                                    // Check if brick has a powerup - probabilità aumentata con la difficoltà
                                    const powerupChance = Math.min(0.15 * difficultyFactor, 0.35); // max 35%
                                    if (brick.powerup || (Math.random() < powerupChance && !brick.powerup)) {
                                        // Se non aveva un powerup ma ne assegniamo uno ora
                                        const powerupType = brick.powerup || (() => {
                                            const powerupTypes = Object.values(POWERUP_TYPES);
                                            return powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
                                        })();

                                        createPowerup(
                                            brick.x + brick.width / 2 - 10,
                                            brick.y + brick.height,
                                            powerupType
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
        for (let i = gameState.powerups.length - 1; i >= 0; i--) {
            const powerup = gameState.powerups[i];
            powerup.y += powerup.dy;
            
            // Check if powerup goes off-screen
            if (powerup.y > GAME_HEIGHT) {
                gameState.powerups.splice(i, 1);
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
                gameState.powerups.splice(i, 1);
                
                // Add points for catching a powerup
                gameState.score += 25;
                updateScoreDisplay();
            }
        }
    }
    
    // Draw the game
    function draw() {
        if (!ctx) return;
        
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
        
        // Draw main paddle
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

        // Draw second paddle if it exists
        if (secondPaddle) {
            ctx.beginPath();
            ctx.rect(secondPaddle.x, secondPaddle.y, secondPaddle.width, secondPaddle.height);

            // Create a gradient for the second paddle
            const secondPaddleGradient = ctx.createLinearGradient(
                secondPaddle.x, secondPaddle.y,
                secondPaddle.x, secondPaddle.y + secondPaddle.height
            );
            secondPaddleGradient.addColorStop(0, '#ff00ff'); // Colore diverso per distinguerla
            secondPaddleGradient.addColorStop(1, '#000000');

            ctx.fillStyle = secondPaddleGradient;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw second paddle glow
            ctx.shadowColor = '#ff00ff';
            ctx.shadowBlur = 10;
            ctx.strokeStyle = '#ff00ff';
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        
        // Draw balls
        gameState.balls.forEach(ball => {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
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
        for (let r = 0; r < gameState.brickRowCount; r++) {
            for (let c = 0; c < gameState.brickColumnCount; c++) {
                const brick = gameState.bricks[r] && gameState.bricks[r][c];
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
                            case POWERUP_TYPES.DOUBLE_BALL:
                                symbol = '∞'; // Simbolo infinito per doppia palla
                                break;
                            case POWERUP_TYPES.SUPER_SPEED:
                                symbol = '⚡'; // Simbolo fulmine per super velocità
                                break;
                            case POWERUP_TYPES.MEGA_PADDLE:
                                symbol = 'W'; // W wide per mega racchetta
                                break;
                            case POWERUP_TYPES.DUAL_PADDLE:
                                symbol = '≡'; // Simbolo di equivalenza per doppia racchetta
                                break;
                        }
                        
                        ctx.fillText(symbol, brick.x + brick.width / 2, brick.y + brick.height / 2);
                    }
                }
            }
        }
        
        // Draw powerups
        for (let i = 0; i < gameState.powerups.length; i++) {
            const powerup = gameState.powerups[i];
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
                case POWERUP_TYPES.DOUBLE_BALL:
                    symbol = '∞'; // Simbolo infinito per doppia palla
                    break;
                case POWERUP_TYPES.SUPER_SPEED:
                    symbol = '⚡'; // Simbolo fulmine per super velocità
                    break;
                case POWERUP_TYPES.MEGA_PADDLE:
                    symbol = 'W'; // W wide per mega racchetta
                    break;
                case POWERUP_TYPES.DUAL_PADDLE:
                    symbol = '≡'; // Simbolo di equivalenza per doppia racchetta
                    break;
            }
            
            ctx.fillText(symbol, powerup.x + powerup.width / 2, powerup.y + powerup.height / 2);
        }
    }
    
    // Game loop
    function gameLoop(timestamp) {
        if (gameState.running) {
            update();
            draw();
            animationId = requestAnimationFrame(gameLoop);
        }
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
    
    // Hide all screens
    function hideAllScreens() {
        if (menuScreen) menuScreen.classList.add('hidden');
        if (gameOverScreen) gameOverScreen.classList.add('hidden');
        if (highScoresScreen) highScoresScreen.classList.add('hidden');
        if (levelCompleteScreen) levelCompleteScreen.classList.add('hidden');
    }
    
    // Show a specific screen
    function showScreen(screen) {
        if (!screen) return;
        
        hideAllScreens();
        screen.classList.remove('hidden');
    }
})();