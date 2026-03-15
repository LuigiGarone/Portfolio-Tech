// Manifest file per i suoni del gioco
// Questi sono suoni predefiniti incorporati nel file per evitare problemi di caricamento
// I suoni sono in formato base64 ma per semplicità sono stati utilizzati placeholder

// In un ambiente reale, questi sarebbero file .mp3 o .wav effettivi
const SOUND_ASSETS = {
    // Suono per collisione con la racchetta
    paddle: 'data:audio/mp3;base64,placeholder',
    
    // Suono per distruzione mattone
    brick: 'data:audio/mp3;base64,placeholder',
    
    // Suono per raccolta power-up
    powerup: 'data:audio/mp3;base64,placeholder',
    
    // Suono per vita extra
    life: 'data:audio/mp3;base64,placeholder',
    
    // Suono per completamento livello
    levelUp: 'data:audio/mp3;base64,placeholder',
    
    // Suono per game over
    gameOver: 'data:audio/mp3;base64,placeholder'
};

// Esporta i suoni
if (typeof module !== 'undefined') {
    module.exports = SOUND_ASSETS;
}