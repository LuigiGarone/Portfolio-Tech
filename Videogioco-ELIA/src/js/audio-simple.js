// Audio semplificato per il gioco NeonBreak
// Questa libreria crea semplici suoni 8-bit in stile retro senza dipendere da file esterni

class Audio8Bit {
    constructor() {
        this.ctx = null;
        this.enabled = false;
        this.masterGain = null;
        this.bpm = 120;
        this.currentMusic = null;
        this.loopIntervalId = null;
    }
    
    // Inizializza l'audio context
    init() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.ctx.destination);
            this.enabled = true;
            console.log("Audio8Bit inizializzato con successo");
            return true;
        } catch (e) {
            console.error("Audio8Bit: Impossibile inizializzare l'audio", e);
            return false;
        }
    }
    
    // Abilita l'audio e riprende la riproduzione se era in pausa
    enable() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        this.enabled = true;
    }
    
    // Disabilita l'audio (mette in muto)
    disable() {
        this.enabled = false;
        if (this.ctx) {
            this.ctx.suspend();
        }
    }
    
    // Imposta il volume generale
    setVolume(value) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, value));
        }
    }
    
    // Genera un tono di oscillatore
    tone(frequency, type, duration, volume = 0.3, startTime = 0) {
        if (!this.ctx || !this.enabled) return null;
        
        const oscillator = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        oscillator.type = type || 'square';
        oscillator.frequency.value = frequency;
        gainNode.gain.value = volume;
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        const now = this.ctx.currentTime;
        oscillator.start(now + startTime);
        
        // Fade out per evitare click/pop
        gainNode.gain.setValueAtTime(volume, now + startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + startTime + duration);
        
        oscillator.stop(now + startTime + duration + 0.05);
        
        return {
            oscillator,
            gainNode,
            duration
        };
    }
    
    // Sound preimpostati
    sfxPaddleHit() {
        if (!this.enabled) return;
        this.tone(300, 'square', 0.05, 0.15);
    }
    
    sfxBrickHit() {
        if (!this.enabled) return;
        this.tone(500, 'square', 0.05, 0.15);
    }
    
    sfxBrickBreak() {
        if (!this.enabled) return;
        this.tone(700, 'square', 0.05, 0.2);
        this.tone(900, 'square', 0.05, 0.2, 0.05);
    }
    
    sfxPowerUp() {
        if (!this.enabled) return;
        this.tone(440, 'square', 0.05, 0.2);
        this.tone(660, 'square', 0.05, 0.2, 0.05);
        this.tone(880, 'square', 0.05, 0.2, 0.1);
    }
    
    sfxLevelUp() {
        if (!this.enabled) return;
        const notes = [440, 554, 659, 880];
        notes.forEach((note, i) => {
            this.tone(note, 'square', 0.1, 0.2, i * 0.1);
        });
    }
    
    sfxGameOver() {
        if (!this.enabled) return;
        this.tone(880, 'sawtooth', 0.1, 0.3, 0);
        this.tone(440, 'sawtooth', 0.1, 0.3, 0.1);
        this.tone(220, 'sawtooth', 0.2, 0.3, 0.2);
        this.tone(110, 'sawtooth', 0.3, 0.3, 0.4);
    }
    
    sfxExtraLife() {
        if (!this.enabled) return;
        this.tone(523, 'sine', 0.1, 0.2, 0);
        this.tone(659, 'sine', 0.1, 0.2, 0.1);
        this.tone(783, 'sine', 0.1, 0.2, 0.2);
        this.tone(1046, 'sine', 0.2, 0.2, 0.3);
    }
    
    // Musica di sottofondo in stile 8-bit
    playBackgroundMusic() {
        if (!this.enabled || this.loopIntervalId) return;
        
        // Definizione dell'arpeggio di base (scala minore cyberpunk)
        const bassNotes = [220, 261.6, 311.1, 220, 261.6, 329.6];
        const arpeggioNotes = [440, 523.2, 622.2, 440, 523.2, 659.2];
        const leadNotes = [880, 1046.4, 1244.4, 880, 1046.4, 1318.4];
        
        // Inizia la sequenza
        let currentBeat = 0;
        const beatsPerMeasure = 8;
        const beatDuration = 60 / this.bpm;
        
        // Loop della musica di sottofondo
        this.loopIntervalId = setInterval(() => {
            if (!this.enabled) return;
            
            // Basso (ogni 2 beat)
            if (currentBeat % 2 === 0) {
                const bassIndex = Math.floor(currentBeat / 2) % bassNotes.length;
                this.tone(bassNotes[bassIndex], 'square', beatDuration * 1.8, 0.2);
            }
            
            // Arpeggio (ogni beat)
            const arpeggioIndex = currentBeat % arpeggioNotes.length;
            this.tone(arpeggioNotes[arpeggioIndex], 'square', beatDuration * 0.8, 0.1);
            
            // Lead (ogni 4 beat)
            if (currentBeat % 4 === 0) {
                const leadIndex = Math.floor(currentBeat / 4) % leadNotes.length;
                this.tone(leadNotes[leadIndex], 'sine', beatDuration * 3, 0.1);
            }
            
            // Drum (ogni 4 beat)
            if (currentBeat % 4 === 0) {
                this.tone(80, 'square', 0.05, 0.2); // Kick
            } else if (currentBeat % 4 === 2) {
                this.tone(600, 'square', 0.02, 0.05); // Snare
            }
            
            // Hi-hat (ogni beat)
            if (currentBeat % 2 === 1) {
                this.tone(1200, 'square', 0.02, 0.05);
            }
            
            currentBeat = (currentBeat + 1) % (beatsPerMeasure * 4); // 4 misure in loop
        }, beatDuration * 1000);
    }
    
    stopBackgroundMusic() {
        if (this.loopIntervalId) {
            clearInterval(this.loopIntervalId);
            this.loopIntervalId = null;
        }
    }
}

// Esporta l'audio manager
window.Audio8Bit = Audio8Bit;