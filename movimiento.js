//Movement, buena canción de Hozier

import { calcularRuta } from './pathfinding.js'

export function calcularCamino(origenX, origenY, destinoX, destinoY, anchoMundo, altoMundo) {
    const ruta = calcularRuta(origenX, origenY, destinoX, destinoY, anchoMundo, altoMundo)
    if (ruta && ruta.length > 0) {
        return ruta
    }
    return [{ x: destinoX, y: destinoY }]
}

export function avanzarEnCamino(contenedor, camino, indicePunto, velocidad, distanciaFreno, datos) {
    const puntoActual = camino[indicePunto]
    const dx = puntoActual.x - contenedor.x
    const dy = puntoActual.y - contenedor.y
    const distancia = Math.sqrt(dx * dx + dy * dy)
    const esUltimoPunto = indicePunto === camino.length - 1
    const freno = esUltimoPunto ? distanciaFreno : (velocidad * datos)

    if (distancia <= freno) {
        return { llegó: true, esUltimoPunto, dx, dy, distancia }  
    }

    contenedor.x += (dx / distancia) * velocidad * datos
    contenedor.y += (dy / distancia) * velocidad * datos

    return { llegó: false, esUltimoPunto, dx, dy, distancia }
}