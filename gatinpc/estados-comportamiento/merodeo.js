import * as PIXI from "../../pixi.js"
import { Estado } from "../../mef.js"
import * as mover from '../../movimiento.js'

export class Merodeo extends Estado {
    alEntrar() {
        this.indicePunto = 0
        this.VELOCIDAD = this.dueño.VELOCIDAD_GATINPC
        this.últimaAnimación = null

        const destino = this.elegirPuntoRandom()

        this.camino = mover.calcularCamino(
            this.dueño.contenedor.x,
            this.dueño.contenedor.y,
            destino.x,
            destino.y,
            this.dueño.ANCHO_MUNDO,
            this.dueño.ALTO_MUNDO
        )

        if (this.camino.length > 1) {
            this.indicePunto = 1
        }

        this.dueño.empezarACaminar()
    }

    elegirPuntoRandom() {
        return {
            x: Math.random() * this.dueño.ANCHO_MUNDO,
            y: Math.random() * this.dueño.ALTO_MUNDO
        }
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
            this.dueño.actualizarDirección(resultado.dx, resultado.dy)
        }

        if (resultado.llegó) {
            if (resultado.esUltimoPunto) {
                this.dueño.detenerse()
            } else {
                this.indicePunto++
            }
        }
    }

    hacerChequeos() {
        if (this.dueño.jugadorVaAIntercambiar()) {
            this.dueño.mefComportamiento.cambiarEstado('intercambio')
            return
        }

        if (!this.camino || this.indicePunto >= this.camino.length) {
            this.dueño.mefComportamiento.cambiarEstado('espera')
            return
        }
    }
}