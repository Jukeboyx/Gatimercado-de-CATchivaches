const TAMAÑO_CELDA = 16;

let obstáculosDinámicos = [];

export function setObstáculos(obstáculos) {
    obstáculosDinámicos = obstáculos;
}

function mundoAGrilla(x, y) {
    return {
        x: Math.floor(x / TAMAÑO_CELDA),
        y: Math.floor(y / TAMAÑO_CELDA)
    };
}

function grillaAMundo(x, y) {
    return {
        x: x * TAMAÑO_CELDA + TAMAÑO_CELDA / 2,
        y: y * TAMAÑO_CELDA + TAMAÑO_CELDA / 2
    };
}

function celdaBloqueada(grillaX, grillaY) {
    const mundoX = grillaX * TAMAÑO_CELDA + TAMAÑO_CELDA / 2;
    const mundoY = grillaY * TAMAÑO_CELDA + TAMAÑO_CELDA / 2;

    for (const obstáculo of obstáculosDinámicos) {
        if (obstáculo.radioColision === 0) continue // picnic no tiene colisión
        
        const dx = mundoX - obstáculo.x;
        const dy = mundoY - obstáculo.y;
        const distancia = Math.sqrt(dx * dx + dy * dy);
        
        // Verificar si el centro de la celda está dentro del obstáculo
        if (distancia < obstáculo.radioColision) {
            return true;
        }
        
        // Verificar si la celda está cerca del borde del obstáculo (considerando el tamaño de la celda)
        // La distancia desde el centro de la celda al borde más cercano es aproximadamente TAMAÑO_CELDA/2
        if (distancia < obstáculo.radioColision + TAMAÑO_CELDA) {
            return true;
        }
    }
    return false;
}

// Heurística: distancia Euclidiana — compatible con movimiento en 8 direcciones
function heurística(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function obtenerVecinos(nodo, anchoGrilla, altoGrilla) {
    const vecinos = [];

    // 8 direcciones: cardinales + diagonales
    const direcciones = [
        { x:  0, y: -1, costo: 1   },  // arriba
        { x:  0, y:  1, costo: 1   },  // abajo
        { x: -1, y:  0, costo: 1   },  // izquierda
        { x:  1, y:  0, costo: 1   },  // derecha
        { x: -1, y: -1, costo: 1.4 },  // diagonal arriba-izquierda
        { x:  1, y: -1, costo: 1.4 },  // diagonal arriba-derecha
        { x: -1, y:  1, costo: 1.4 },  // diagonal abajo-izquierda
        { x:  1, y:  1, costo: 1.4 },  // diagonal abajo-derecha
    ];

    for (const dir of direcciones) {
        const nuevoX = nodo.x + dir.x;
        const nuevoY = nodo.y + dir.y;

        if (nuevoX < 0 || nuevoX >= anchoGrilla || nuevoY < 0 || nuevoY >= altoGrilla) continue;
        if (celdaBloqueada(nuevoX, nuevoY)) continue;

        // Evitar "cortar esquinas" de obstáculos en diagonales
        if (dir.x !== 0 && dir.y !== 0) {
            if (celdaBloqueada(nodo.x + dir.x, nodo.y) || celdaBloqueada(nodo.x, nodo.y + dir.y)) continue;
        }

        vecinos.push({ x: nuevoX, y: nuevoY, costo: dir.costo });
    }

    return vecinos;
}

function reconstruirCamino(cameFrom, actual) {
    const camino = [grillaAMundo(actual.x, actual.y)];
    let nodoActual = actual;

    while (cameFrom.has(`${nodoActual.x},${nodoActual.y}`)) {
        nodoActual = cameFrom.get(`${nodoActual.x},${nodoActual.y}`);
        camino.unshift(grillaAMundo(nodoActual.x, nodoActual.y));
    }

    return camino;
}

export function calcularRuta(origenX, origenY, destinoX, destinoY, ancho, alto) {
    const anchoGrilla = Math.ceil(ancho / TAMAÑO_CELDA);
    const altoGrilla  = Math.ceil(alto  / TAMAÑO_CELDA);

    const inicio = mundoAGrilla(origenX, origenY);
    const fin    = mundoAGrilla(destinoX, destinoY);

    if (celdaBloqueada(inicio.x, inicio.y) || celdaBloqueada(fin.x, fin.y)) return null;

    const abierto    = [];
    const enAbierto  = new Set();   // para chequear pertenencia en O(1)
    const cerrado    = new Set();
    const cameFrom   = new Map();
    const gScore     = new Map();
    const fScore     = new Map();

    const claveInicio = `${inicio.x},${inicio.y}`;
    gScore.set(claveInicio, 0);
    fScore.set(claveInicio, heurística(inicio, fin));
    abierto.push({ x: inicio.x, y: inicio.y, f: fScore.get(claveInicio) });
    enAbierto.add(claveInicio);

    while (abierto.length > 0) {
        abierto.sort((a, b) => a.f - b.f);
        const actual      = abierto.shift();
        const claveActual = `${actual.x},${actual.y}`;
        enAbierto.delete(claveActual);

        if (actual.x === fin.x && actual.y === fin.y) {
            return reconstruirCamino(cameFrom, actual);
        }

        cerrado.add(claveActual);

        for (const vecino of obtenerVecinos(actual, anchoGrilla, altoGrilla)) {
            const claveVecino = `${vecino.x},${vecino.y}`;
            if (cerrado.has(claveVecino)) continue;

            const gTentativo = gScore.get(claveActual) + vecino.costo;

            if (!gScore.has(claveVecino) || gTentativo < gScore.get(claveVecino)) {
                cameFrom.set(claveVecino, actual);
                gScore.set(claveVecino, gTentativo);
                const f = gTentativo + heurística(vecino, fin);
                fScore.set(claveVecino, f);

                if (!enAbierto.has(claveVecino)) {
                    abierto.push({ x: vecino.x, y: vecino.y, f });
                    enAbierto.add(claveVecino);
                }
            }
        }
    }

    return null;
}
