export class SistemaGrilla {
    constructor(tamañoCelda = 32, anchoMundo, altoMundo) {
        this.tamañoCelda = tamañoCelda
        this.anchoMundo = anchoMundo
        this.altoMundo = altoMundo
        this.celdasBloqueadas = new Set()
    }

    mundoAGrilla(x, y) {
        return {
            x: Math.floor(x / this.tamañoCelda),
            y: Math.floor(y / this.tamañoCelda)
        }
    }

    grillaAMundo(x, y) {
        return {
            x: x * this.tamañoCelda + this.tamañoCelda / 2,
            y: y * this.tamañoCelda + this.tamañoCelda / 2
        }
    }

    snapAlCentro(x, y) {
        const celda = this.mundoAGrilla(x, y)
        return this.grillaAMundo(celda.x, celda.y)
    }
    
    clampAlMundo(x, y, margenCeldas = 2) {
        const margen = margenCeldas * this.tamañoCelda
        return {
            x: Math.min(Math.max(x, margen), this.anchoMundo - margen),
            y: Math.min(Math.max(y, margen), this.altoMundo - margen)
        }
    }

    bloquearCelda(x, y) {
        const clave = `${x},${y}`
        this.celdasBloqueadas.add(clave)
    }

    desbloquearCelda(x, y) {
        const clave = `${x},${y}`
        this.celdasBloqueadas.delete(clave)
    }

    estaBloqueada(x, y) {
        const clave = `${x},${y}`
        return this.celdasBloqueadas.has(clave)
    }

    bloquearBordes() {
        const anchoGrilla = Math.ceil(this.anchoMundo / this.tamañoCelda)
        const altoGrilla = Math.ceil(this.altoMundo / this.tamañoCelda)

        // Bloquear bordes superior e inferior
        for (let x = 0; x < anchoGrilla; x++) {
            this.bloquearCelda(x, 0)
            this.bloquearCelda(x, altoGrilla - 1)
        }

        // Bloquear bordes izquierdo y derecho
        for (let y = 0; y < altoGrilla; y++) {
            this.bloquearCelda(0, y)
            this.bloquearCelda(anchoGrilla - 1, y)
        }
    }

    encontrarCeldaAccesibleMásCercana(x, y) {
        const anchoGrilla = Math.ceil(this.anchoMundo / this.tamañoCelda)
        const altoGrilla = Math.ceil(this.altoMundo / this.tamañoCelda)

        const grillaOrigen = this.mundoAGrilla(x, y)

        // BFS para encontrar la celda accesible más cercana
        const cola = [{ x: grillaOrigen.x, y: grillaOrigen.y, distancia: 0 }]
        const visitados = new Set()
        visitados.add(`${grillaOrigen.x},${grillaOrigen.y}`)

        const direcciones = [
            { x: 0, y: -1 }, { x: 0, y: 1 },
            { x: -1, y: 0 }, { x: 1, y: 0 },
            { x: -1, y: -1 }, { x: 1, y: -1 },
            { x: -1, y: 1 }, { x: 1, y: 1 }
        ]

        while (cola.length > 0) {
            const actual = cola.shift()

            // Si esta celda no está bloqueada, retornarla
            if (!this.estaBloqueada(actual.x, actual.y)) {
                return this.grillaAMundo(actual.x, actual.y)
            }

            // Explorar vecinos
            for (const dir of direcciones) {
                const nuevoX = actual.x + dir.x
                const nuevoY = actual.y + dir.y
                const clave = `${nuevoX},${nuevoY}`

                // Verificar límites
                if (nuevoX < 0 || nuevoX >= anchoGrilla || nuevoY < 0 || nuevoY >= altoGrilla) {
                    continue
                }

                if (!visitados.has(clave)) {
                    visitados.add(clave)
                    cola.push({ x: nuevoX, y: nuevoY, distancia: actual.distancia + 1 })
                }
            }
        }

        // Si no se encontró ninguna celda accesible (caso extremo)
        return { x, y }
    }

    limpiar() {
        this.celdasBloqueadas.clear()
    }
}