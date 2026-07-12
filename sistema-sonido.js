import { sound } from './pixi.js';

class AudioManager {
    constructor() {
        // Volúmenes base normalizados (0.0 a 1.0)
        this.bgmVolume = 0.5;
        this.bsmVolume = 0.7;
        this.currentBgm = null;
    }

    // Cargar un archivo de audio específico
    async loadAudio(alias, url) {
        return new Promise((resolve, reject) => {
            sound.add(alias, {
                url,
                preload: true,
                loaded: (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            });
        });
    }

    async desbloquearAudio() {
        if (sound.context.audioContext.state === 'suspended') {
            await sound.context.audioContext.resume();
        }
    }

    // Reproducir música de fondo (BGM)
    playBgm(alias, loop = true) {
        if (this.currentBgm) {
            this.stopBgm(); // Detiene la música actual
        }

        // Reproduce y almacena la instancia
        this.currentBgm = sound.play(alias, {
            loop: loop,
            volume: this.bgmVolume
        });
        
        return this.currentBgm;
    }

    // Detener música de fondo
    stopBgm() {
        if (this.currentBgm) {
            this.currentBgm.stop();
            this.currentBgm = null;
        }
    }

    // Reproducir efectos de sonido (BSM / SFX)
    playBsm(alias) {
        sound.play(alias, {
            volume: this.bsmVolume
        });
    }

    // Ajustar volumen de la música
    setBgmVolume(value) {
        this.bgmVolume = Math.max(0, Math.min(1, value)); // Clamp entre 0 y 1
        if (this.currentBgm) {
            this.currentBgm.volume = this.bgmVolume;
        }
    }

    // Ajustar volumen de efectos
    setBsmVolume(value) {
        this.bsmVolume = Math.max(0, Math.min(1, value));
    }
}

// Exportar la instancia para usarla globalmente en el juego
export const audioManager = new AudioManager();
