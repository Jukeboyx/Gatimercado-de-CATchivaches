import { Estado } from "../../mef.js"
import * as mover from '../../movimiento.js'

export class Enojado extends Estado {
    alEntrar() {
        this.VELOCIDAD = this.dueño.VELOCIDAD_GATINPC * 3
        this.indicePunto = 0

        const dx = this.dueño.contenedor.x - this.dueño.jugador.contenedor.x
        const dy = this.dueño.contenedor.y - this.dueño.jugador.contenedor.y
        const distancia = Math.sqrt(dx * dx + dy * dy)

        const destino = {
            x: this.dueño.contenedor.x + (dx / distancia) * 600,
            y: this.dueño.contenedor.y + (dy / distancia) * 600
        }

        destino.x = Math.max(0, Math.min(destino.x, this.dueño.ANCHO_MUNDO))
        destino.y = Math.max(0, Math.min(destino.y, this.dueño.ALTO_MUNDO))

        this.camino = mover.calcularCamino(
            this.dueño.contenedor.x,
            this.dueño.contenedor.y,
            destino.x,
            destino.y,
            this.dueño.ANCHO_MUNDO,
            this.dueño.ALTO_MUNDO
        )

        this.indicePunto = this.camino.length > 1 ? 1 : 0

        this.dueño.empezarACaminar()
    }

    alActualizar(datos) {
        const resultado = mover.avanzarEnCamino(
            this.dueño.contenedor,
            this.camino,
            this.indicePunto,
            this.VELOCIDAD,
            5,
            datos
        )

        if (!resultado.llegó) {
            this.dueño.actualizarDireccion(resultado.dx, resultado.dy)
        }

        if (resultado.llegó) {
            if (resultado.esUltimoPunto) {
                this.dueño.empezarADetenerse()
            } else {
                this.indicePunto++
            }
        }
    }

    hacerChequeos() {
        if (!this.camino || this.indicePunto >= this.camino.length) {
            this.dueño.empezarADetenerse()
        }
    }
}