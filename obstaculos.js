import * as PIXI from './pixi.js';

export const catálogoObstáculos = {
    comercio1: {
        imagen: 'recursos/sprites/comercio1.png',
        escala: 3,
        radioColision: 100
    },
    comercio2: {
        imagen: 'recursos/sprites/comercio2.png',
        escala: 3,
        radioColision: 100
    },
    comercio3: {
        imagen: 'recursos/sprites/comercio3.png',
        escala: 3,
        radioColision: 100
    },
    arbol1: {
        imagen: 'recursos/sprites/arbol1.png',
        escala: 4.5,
        radioColision: 100
    },
    arbol2: {
        imagen: 'recursos/sprites/arbol2.png',
        escala: 4.5,
        radioColision: 100
    },
    arbol3: {
        imagen: 'recursos/sprites/arbol3.png',
        escala: 4.5,
        radioColision: 100
    },
    arbol4: {
        imagen: 'recursos/sprites/arbol4.png',
        escala: 4.5,
        radioColision: 100
    },
    picnic: {
        imagen: 'recursos/sprites/picnic.png',
        escala: 2.8,
        radioColision: 0
    },
    banquito1: {
        imagen: 'recursos/sprites/banquito1.png',
        escala: 2.5,
        radioColision: 100
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
        
        if (distancia < radio + obs.radioColision + 40) {
            return true
        }
    }
    return false
}

export function puntoDentroDeObstáculo(x, y, obstaculos) {
    for (const obs of obstaculos) {
        if (obs.radioColision === 0) continue // picnic no tiene colisión
        const dx = x - obs.x
        const dy = y - obs.y
        const distancia = Math.sqrt(dx * dx + dy * dy)
        
        if (distancia < obs.radioColision) {
            return obs
        }
    }
    return null
}

export function calcularPuntoMásCercano(x, y, obstáculo) {
    const dx = x - obstáculo.x
    const dy = y - obstáculo.y
    const distancia = Math.sqrt(dx * dx + dy * dy)
    
    if (distancia === 0) {
        // Si el punto está exactamente en el centro, mover en dirección arbitraria
        return {
            x: obstáculo.x + obstáculo.radioColision + 10,
            y: obstáculo.y
        }
    }
    
    // Calcular el punto en el borde del obstáculo en la dirección del clic
    const factor = (obstáculo.radioColision + 10) / distancia
    return {
        x: obstáculo.x + dx * factor,
        y: obstáculo.y + dy * factor
    }
}
