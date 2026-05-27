import { obstáculos } from './datos.js';

const TAMAÑO_CELDA = 16;

/**
 * Convierte coordenadas del mundo a coordenadas de grilla
 */
function mundoAGrilla(x, y) {
    return {
        x: Math.floor(x / TAMAÑO_CELDA),
        y: Math.floor(y / TAMAÑO_CELDA)
    };
}

/**
 * Convierte coordenadas de grilla a coordenadas del mundo (centro de la celda)
 */
function grillaAMundo(x, y) {
    return {
        x: x * TAMAÑO_CELDA + TAMAÑO_CELDA / 2,
        y: y * TAMAÑO_CELDA + TAMAÑO_CELDA / 2
    };
}

/**
 * Verifica si una celda de la grilla está bloqueada por un obstáculo
 */
function celdaBloqueada(grillaX, grillaY) {
    const mundoX = grillaX * TAMAÑO_CELDA;
    const mundoY = grillaY * TAMAÑO_CELDA;
    
    for (const obstáculo of obstáculos) {
        if (mundoX < obstáculo.x + obstáculo.ancho &&
            mundoX + TAMAÑO_CELDA > obstáculo.x &&
            mundoY < obstáculo.y + obstáculo.alto &&
            mundoY + TAMAÑO_CELDA > obstáculo.y) {
            return true;
        }
    }
    return false;
}

/**
 * Distancia Manhattan entre dos nodos
 */
function distanciaManhattan(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * Distancia Euclidiana entre dos nodos
 */
function distanciaEuclidiana(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

/**
 * Obtiene los vecinos válidos de un nodo
 */
function obtenerVecinos(nodo, anchoGrilla, altoGrilla) {
    const vecinos = [];
    const direcciones = [
        { x: 0, y: -1 },  // arriba
        { x: 0, y: 1 },   // abajo
        { x: -1, y: 0 },  // izquierda
        { x: 1, y: 0 }    // derecha
    ];
    
    for (const dir of direcciones) {
        const nuevoX = nodo.x + dir.x;
        const nuevoY = nodo.y + dir.y;
        
        if (nuevoX >= 0 && nuevoX < anchoGrilla &&
            nuevoY >= 0 && nuevoY < altoGrilla &&
            !celdaBloqueada(nuevoX, nuevoY)) {
            vecinos.push({ x: nuevoX, y: nuevoY });
        }
    }
    
    return vecinos;
}

/**
 * Reconstruye el camino desde el nodo final hasta el inicial
 */
function reconstruirCamino(cameFrom, actual) {
    const camino = [grillaAMundo(actual.x, actual.y)];
    let nodoActual = actual;
    
    while (cameFrom.has(`${nodoActual.x},${nodoActual.y}`)) {
        nodoActual = cameFrom.get(`${nodoActual.x},${nodoActual.y}`);
        camino.unshift(grillaAMundo(nodoActual.x, nodoActual.y));
    }
    
    return camino;
}

/**
 * Calcula una ruta usando el algoritmo A*
 * @param {number} origenX - Coordenada X de origen
 * @param {number} origenY - Coordenada Y de origen
 * @param {number} destinoX - Coordenada X de destino
 * @param {number} destinoY - Coordenada Y de destino
 * @param {number} ancho - Ancho del mapa
 * @param {number} alto - Alto del mapa
 * @returns {Array|null} - Array de puntos {x, y} con el camino, o null si no hay ruta
 */
export function calcularRuta(origenX, origenY, destinoX, destinoY, ancho, alto) {
    const anchoGrilla = Math.ceil(ancho / TAMAÑO_CELDA);
    const altoGrilla = Math.ceil(alto / TAMAÑO_CELDA);
    
    const inicio = mundoAGrilla(origenX, origenY);
    const fin = mundoAGrilla(destinoX, destinoY);
    
    // Verificar si el origen o destino están bloqueados
    if (celdaBloqueada(inicio.x, inicio.y) || celdaBloqueada(fin.x, fin.y)) {
        return null;
    }
    
    // Conjunto abierto (nodos a explorar)
    const abierto = [];
    // Conjunto cerrado (nodos ya explorados)
    const cerrado = new Set();
    // Mapa para reconstruir el camino
    const cameFrom = new Map();
    // Costo desde el inicio hasta cada nodo
    const gScore = new Map();
    // Costo estimado total (g + h)
    const fScore = new Map();
    
    const claveInicio = `${inicio.x},${inicio.y}`;
    gScore.set(claveInicio, 0);
    fScore.set(claveInicio, distanciaManhattan(inicio, fin));
    abierto.push({ x: inicio.x, y: inicio.y, f: fScore.get(claveInicio) });
    
    while (abierto.length > 0) {
        // Encontrar el nodo con menor fScore
        abierto.sort((a, b) => a.f - b.f);
        const actual = abierto.shift();
        const claveActual = `${actual.x},${actual.y}`;
        
        // Si llegamos al destino
        if (actual.x === fin.x && actual.y === fin.y) {
            return reconstruirCamino(cameFrom, actual);
        }
        
        cerrado.add(claveActual);
        
        // Explorar vecinos
        const vecinos = obtenerVecinos(actual, anchoGrilla, altoGrilla);
        
        for (const vecino of vecinos) {
            const claveVecino = `${vecino.x},${vecino.y}`;
            
            if (cerrado.has(claveVecino)) {
                continue;
            }
            
            const gTentativo = gScore.get(claveActual) + 1;
            
            if (!gScore.has(claveVecino) || gTentativo < gScore.get(claveVecino)) {
                cameFrom.set(claveVecino, actual);
                gScore.set(claveVecino, gTentativo);
                const h = distanciaManhattan(vecino, fin);
                fScore.set(claveVecino, gTentativo + h);
                
                // Agregar a abierto si no está
                const enAbierto = abierto.find(n => n.x === vecino.x && n.y === vecino.y);
                if (!enAbierto) {
                    abierto.push({ x: vecino.x, y: vecino.y, f: gTentativo + h });
                }
            }
        }
    }
    
    // No se encontró camino
    return null;
}
