import { SistemaGrilla } from './sistema-grilla.js';

// Cola de prioridad (montículo binario mínimo) — reemplaza el sort() + shift()
// El elemento con menor "f" siempre queda en la raíz (índice 0)
class ColaPrioridad {
    constructor() {
        this.elementos = []
    }

    estaVacia() {
        return this.elementos.length === 0
    }

    insertar(elemento) {
        this.elementos.push(elemento)
        this.burbujearHaciaArriba(this.elementos.length - 1)
    }

    extraerMinimo() {
        const minimo = this.elementos[0]
        const ultimo = this.elementos.pop()

        if (this.elementos.length > 0) {
            this.elementos[0] = ultimo
            this.burbujearHaciaAbajo(0)
        }

        return minimo
    }

    burbujearHaciaArriba(indice) {
        while (indice > 0) {
            const indicePadre = Math.floor((indice - 1) / 2)
            if (this.elementos[indicePadre].f <= this.elementos[indice].f) break

            ;[this.elementos[indicePadre], this.elementos[indice]] =
                [this.elementos[indice], this.elementos[indicePadre]]
            indice = indicePadre
        }
    }

    burbujearHaciaAbajo(indice) {
        const cantidad = this.elementos.length

        while (true) {
            let menor = indice
            const izquierda = 2 * indice + 1
            const derecha = 2 * indice + 2

            if (izquierda < cantidad && this.elementos[izquierda].f < this.elementos[menor].f) {
                menor = izquierda
            }
            if (derecha < cantidad && this.elementos[derecha].f < this.elementos[menor].f) {
                menor = derecha
            }
            if (menor === indice) break

            ;[this.elementos[menor], this.elementos[indice]] =
                [this.elementos[indice], this.elementos[menor]]
            indice = menor
        }
    }
}
let sistemaGrilla = null;

export function setSistemaGrilla(sgrilla) {
    sistemaGrilla = sgrilla;
}

function mundoAGrilla(x, y) {
    return sistemaGrilla.mundoAGrilla(x, y);
}

function grillaAMundo(x, y) {
    return sistemaGrilla.grillaAMundo(x, y);
}

function celdaBloqueada(grillaX, grillaY) {
    return sistemaGrilla.estaBloqueada(grillaX, grillaY);
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
    const tamañoCelda = sistemaGrilla.tamañoCelda;
    const anchoGrilla = Math.ceil(ancho / tamañoCelda);
    const altoGrilla  = Math.ceil(alto  / tamañoCelda);

    const inicio = mundoAGrilla(origenX, origenY);
    const fin    = mundoAGrilla(destinoX, destinoY);

    if (celdaBloqueada(inicio.x, inicio.y) || celdaBloqueada(fin.x, fin.y)) return null;

    const cola      = new ColaPrioridad();
    const cerrado   = new Set();
    const cameFrom  = new Map();
    const gScore    = new Map();
    const fScore    = new Map();

    const claveInicio = `${inicio.x},${inicio.y}`;
    const fInicio = heurística(inicio, fin);
    gScore.set(claveInicio, 0);
    fScore.set(claveInicio, fInicio);
    cola.insertar({ x: inicio.x, y: inicio.y, f: fInicio });

    let iteraciones = 0
    while (!cola.estaVacia()) {
        iteraciones++
        const actual      = cola.extraerMinimo();
        const claveActual = `${actual.x},${actual.y}`;

        // Esta entrada puede ser una versión vieja (insertamos duplicados
        // en vez de "actualizar" el heap, que sería más costoso)
        if (actual.f > fScore.get(claveActual)) continue;
        if (cerrado.has(claveActual)) continue;

        if (actual.x === fin.x && actual.y === fin.y) {
            const camino = reconstruirCamino(cameFrom, actual);
            console.log(`A* — iteraciones: ${iteraciones}, celdas en camino: ${camino.length}`)
            return camino;
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
                cola.insertar({ x: vecino.x, y: vecino.y, f });
            }
        }
    }

    return null;
}
