import * as PIXI from './pixi.js';

export const catálogoObstáculos = {
    comercio1: {
        imagen: 'recursos/sprites/comercio1.png',
        escala: 3,
        radioColision: 80
    },
    comercio2: {
        imagen: 'recursos/sprites/comercio2.png',
        escala: 3,
        radioColision: 80
    },
    comercio3: {
        imagen: 'recursos/sprites/comercio3.png',
        escala: 3,
        radioColision: 80
    },
    arbol1: {
        imagen: 'recursos/sprites/arbol1.png',
        escala: 4.5,
        radioColision: 70
    },
    arbol2: {
        imagen: 'recursos/sprites/arbol2.png',
        escala: 4.5,
        radioColision: 70
    },
    arbol3: {
        imagen: 'recursos/sprites/arbol3.png',
        escala: 4.5,
        radioColision: 70
    },
    picnic: {
        imagen: 'recursos/sprites/picnic.png',
        escala: 2.8,
        radioColision: 0
    }
}

export function generarPosicionRandom(anchoMundo, altoMundo, margen = 50) {
    return {
        x: Math.random() * (anchoMundo - margen * 2) + margen,
        y: Math.random() * (altoMundo - margen * 2) + margen
    }
}

export function verificarSuperposicion(x, y, radio, obstaculosExistentes) {
    for (const obs of obstaculosExistentes) {
        const dx = x - obs.x
        const dy = y - obs.y
        const distancia = Math.sqrt(dx * dx + dy * dy)
        
        if (distancia < radio + obs.radioColision + 20) {
            return true
        }
    }
    return false
}
