import * as PIXI from './pixi.js';

export class Obstáculo {
    constructor(tipo, x, y, sprite, celdasBloqueadas) {
        this.tipo = tipo
        this.x = x
        this.y = y
        this.sprite = sprite
        this.celdasBloqueadas = celdasBloqueadas
    }

    registrarEnGrilla(sistemaGrilla) {
        const grillaPos = sistemaGrilla.mundoAGrilla(this.x, this.y)
        
        for (const celdaRelativa of this.celdasBloqueadas) {
            const celdaAbsolutaX = grillaPos.x + celdaRelativa.x
            const celdaAbsolutaY = grillaPos.y + celdaRelativa.y
            sistemaGrilla.bloquearCelda(celdaAbsolutaX, celdaAbsolutaY)
        }
    }

    obtenerCeldasAbsolutas(sistemaGrilla) {
        const grillaPos = sistemaGrilla.mundoAGrilla(this.x, this.y)
        return this.celdasBloqueadas.map(celda => ({
            x: grillaPos.x + celda.x,
            y: grillaPos.y + celda.y
        }))
    }
}

export const catálogoObstáculos = {
    comercio1: {
        imagen: 'recursos/sprites/comercio1.png',
        escala: 3,
        celdasBloqueadas: [{"x":-3,"y":1},{"x":-3,"y":2},{"x":-2,"y":1},{"x":-2,"y":2},{"x":-1,"y":1},{"x":-1,"y":2},{"x":0,"y":1},{"x":0,"y":2},{"x":1,"y":1},{"x":1,"y":2},{"x":2,"y":1},{"x":2,"y":2}]
    },
    comercio2: {
        imagen: 'recursos/sprites/comercio2.png',
        escala: 3,
        celdasBloqueadas: [{"x":-3,"y":1},{"x":-3,"y":2},{"x":-2,"y":0},{"x":-2,"y":1},{"x":-2,"y":2},{"x":-1,"y":1},{"x":-1,"y":2},{"x":0,"y":1},{"x":0,"y":2},{"x":1,"y":1},{"x":1,"y":2},{"x":2,"y":1},{"x":2,"y":2}]
    },
    comercio3: {
        imagen: 'recursos/sprites/comercio3.png',
        escala: 3,
        celdasBloqueadas: [{"x":-2,"y":2},{"x":-1,"y":2},{"x":0,"y":2},{"x":1,"y":2}]
    },
    arbol1: {
        imagen: 'recursos/sprites/arbol1.png',
        escala: 4.5,
        celdasBloqueadas: [{"x":-3,"y":3},{"x":-3,"y":4},{"x":-2,"y":3},{"x":-2,"y":4},{"x":-1,"y":3},{"x":-1,"y":4},{"x":0,"y":3},{"x":0,"y":4},{"x":1,"y":3},{"x":1,"y":4},{"x":2,"y":3},{"x":2,"y":4}]
    },
    arbol2: {
        imagen: 'recursos/sprites/arbol2.png',
        escala: 4.5,
        celdasBloqueadas: [{"x":-1,"y":2},{"x":0,"y":2}]
    },
    arbol3: {
        imagen: 'recursos/sprites/arbol3.png',
        escala: 4.5,
        celdasBloqueadas: [{"x":-1,"y":2},{"x":0,"y":2},{"x":1,"y":2}]
    },
    arbol4: {
        imagen: 'recursos/sprites/arbol4.png',
        escala: 4.5,
        celdasBloqueadas: [{"x":-2,"y":2},{"x":-2,"y":3},{"x":-2,"y":4},{"x":-1,"y":3},{"x":-1,"y":4},{"x":0,"y":3},{"x":0,"y":4},{"x":1,"y":3},{"x":1,"y":4},{"x":2,"y":3},{"x":2,"y":4}]
    },
    picnic: {
        imagen: 'recursos/sprites/picnic.png',
        escala: 2.8,
        celdasBloqueadas: []
    },
    banquito1: {
        imagen: 'recursos/sprites/banquito1.png',
        escala: 2.5,
        celdasBloqueadas: [{"x":-2,"y":0},{"x":-2,"y":1},{"x":-1,"y":0},{"x":-1,"y":1},{"x":0,"y":0},{"x":0,"y":1},{"x":1,"y":0},{"x":1,"y":1}]
    }
}

function generarFootprint(anchoCeldas, altoCeldas, offsetY = 0) {
    const celdas = []
    const mitadAncho = Math.floor(anchoCeldas / 2)
    for (let x = -mitadAncho; x <= mitadAncho; x++) {
        for (let y = offsetY; y < offsetY + altoCeldas; y++) {
            celdas.push({ x, y })
        }
    }
    return celdas
}

export function generarPosicionRandom(sistemaGrilla, anchoMundo, altoMundo, margenCeldas = 2) {
    const anchoGrilla = Math.floor(anchoMundo / sistemaGrilla.tamañoCelda)
    const altoGrilla = Math.floor(altoMundo / sistemaGrilla.tamañoCelda)

    const celdaX = margenCeldas + Math.floor(Math.random() * (anchoGrilla - margenCeldas * 2))
    const celdaY = margenCeldas + Math.floor(Math.random() * (altoGrilla - margenCeldas * 2))

    return sistemaGrilla.grillaAMundo(celdaX, celdaY)
}

export function verificarSuperposicion(x, y, margenCeldas, obstaculosExistentes, tamañoCelda) {
    for (const obs of obstaculosExistentes) {
        const dx = x - obs.x
        const dy = y - obs.y
        const distancia = Math.sqrt(dx * dx + dy * dy)
        
        // Verificar si está cerca del obstáculo basado en la cantidad de celdas bloqueadas
        const radioEstimado = Math.sqrt(obs.celdasBloqueadas.length) * tamañoCelda
        if (distancia < margenCeldas + radioEstimado + 40) {
            return true
        }
    }
    return false
}
