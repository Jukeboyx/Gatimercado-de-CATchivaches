import * as PIXI from "../../pixi.js"
import { Estado } from "../../mef.js"
import * as mover from '../../movimiento.js'

export class Caminando extends Estado {
    alEntrar(destino) {
        this.destino = destino
        this.indicePunto = 0
        this.VELOCIDAD = 6
        this.últimaAnimación = null
        this.framesSinRecalcular = 0

        this.recalcularCamino()
        this.dueño.empezarACaminar()
    }

    recalcularCamino() {
        this.camino = mover.calcularCamino(
            this.dueño.contenedor.x,
            this.dueño.contenedor.y,
            this.destino.x,
            this.destino.y,
            this.dueño.ANCHO_MUNDO,
            this.dueño.ALTO_MUNDO,
            this.dueño.obstaculos
        )
        this.indicePunto = this.camino.length > 1 ? 1 : 0
    }

    actualizarDestino(destino) {
        this.destino = destino
        this.recalcularCamino()
    }

    actualizarDestinoSiSeMovió() {
        if (!this.dueño.entidadObjetivo) return

        const entidad = this.dueño.entidadObjetivo
        const dx = entidad.contenedor.x - this.dueño.contenedor.x
        const dy = entidad.contenedor.y - this.dueño.contenedor.y
        const distancia = Math.sqrt(dx * dx + dy * dy)

        if (distancia <= this.destino.distanciaFreno) {
            this.dueño.estelaJugador.clear()
            this.dueño.empezarADetenerse()
            return
        }

        this.framesSinRecalcular++

        if (this.framesSinRecalcular < 10) return

        this.framesSinRecalcular = 0
        this.destino = {
            x: entidad.contenedor.x,
            y: entidad.contenedor.y,
            distanciaFreno: this.destino.distanciaFreno
        }
        this.recalcularCamino()
    }

    procesarResultado(resultado) {
        if (!resultado.llegó) return

        if (resultado.esUltimoPunto) {
            this.dueño.estelaJugador.clear()
            this.dueño.empezarADetenerse()
        } else {
            this.indicePunto++
        }
    }

    dibujarRuta() {
        const gráfico = this.dueño.estelaJugador
        gráfico.clear()

        if (!this.camino || this.indicePunto >= this.camino.length) return

        const puntoInicio = Math.min(this.indicePunto + 1, this.camino.length - 1)
        if (puntoInicio >= this.camino.length) return

        gráfico.moveTo(this.camino[puntoInicio].x, this.camino[puntoInicio].y)
        for (let i = puntoInicio; i < this.camino.length - 1; i++) {
            gráfico.lineTo(this.camino[i].x, this.camino[i].y)
        }

        gráfico.stroke({ width: 3, color: 0xffffff, alpha: 0.2})
    }

    
    alActualizar(datos) {
        this.actualizarDestinoSiSeMovió()

        if (!this.camino || this.indicePunto >= this.camino.length) {
            this.dueño.empezarADetenerse()
            return
        }

        const resultado = mover.avanzarEnCamino(
            this.dueño.contenedor,
            this.camino,
            this.indicePunto,
            this.VELOCIDAD,
            this.destino.distanciaFreno || 5,
            datos
        )

        this.dueño.actualizarDireccion(resultado.dx, resultado.dy)
        this.procesarResultado(resultado)

        if (resultado.llegó && resultado.esUltimoPunto) return

        this.dibujarRuta()
    }
}