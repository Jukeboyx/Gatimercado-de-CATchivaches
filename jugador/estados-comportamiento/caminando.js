import * as PIXI from "../../pixi.js"
import { Estado } from "../../mef.js"
import * as mover from '../../movimiento.js'

export class Caminando extends Estado {
    alEntrar(destino) {
        this.destino = destino
        this.indicePunto = 0
        this.VELOCIDAD = 4
        this.últimaAnimación = null
        this.framesSinRecalcular = 0

        this.recalcularCamino()
    }

    recalcularCamino() {
        this.camino = mover.calcularCamino(
            this.dueño.contenedor.x,
            this.dueño.contenedor.y,
            this.destino.x,
            this.destino.y,
            this.dueño.ANCHO_MUNDO,
            this.dueño.ALTO_MUNDO
        )
        this.indicePunto = this.camino.length > 1 ? 1 : 0
    }

    actualizarDestinoSiSeMovió() {
        if (!this.dueño.entidadObjetivo) return

        const entidad = this.dueño.entidadObjetivo
        const dx = entidad.contenedor.x - this.dueño.contenedor.x
        const dy = entidad.contenedor.y - this.dueño.contenedor.y
        const distancia = Math.sqrt(dx * dx + dy * dy)

        if (distancia <= this.destino.distanciaFreno) {
            this.dueño.estelaJugador.clear()
            this.dueño.mef.cambiarEstado('espera')
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

    actualizarAnimación(dx, dy) {
        const escalaBase = Math.abs(this.dueño.imagen.scale.x)
        const imagen = this.dueño.imagen
        const animaciones = this.dueño.animaciones
        const UMBRAL_DIAGONAL = 0.3
        const proporción = Math.abs(dx) / (Math.abs(dx) + Math.abs(dy) + 0.001)
        const movimientoSignificativo = Math.abs(dx) > 1;

        let animaciónNueva
        let escalaX = imagen.scale.x

        if (proporción > 0.5 + UMBRAL_DIAGONAL) {
            animaciónNueva = animaciones.lado
            if (movimientoSignificativo) escalaX = dx < 0 ? -escalaBase : escalaBase
        } else if (proporción < 0.5 - UMBRAL_DIAGONAL) {
            animaciónNueva = dy < 0
                ? animaciones.arriba
                : animaciones.abajo
        } else {
            animaciónNueva = animaciones.lado
            if (movimientoSignificativo) escalaX = dx < 0 ? -escalaBase : escalaBase
        }

        if (animaciónNueva !== this.últimaAnimación) {
            imagen.textures = animaciónNueva
            imagen.play()
            this.últimaAnimación = animaciónNueva
        }
        
        if (animaciónNueva === animaciones.lado && escalaX !== imagen.scale.x) {
            imagen.scale.x = escalaX
        }
    }

    procesarResultado(resultado) {
        if (!resultado.llegó) return

        if (resultado.esUltimoPunto) {
            this.dueño.estelaJugador.clear()
            this.dueño.mef.cambiarEstado('espera')
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
        for (let i = puntoInicio; i < this.camino.length; i++) {
            gráfico.lineTo(this.camino[i].x, this.camino[i].y)
        }

        gráfico.stroke({ width: 2, color: 0xffffff, alpha: 0.2})
    }

    
    alActualizar(datos) {
        this.actualizarDestinoSiSeMovió()

        if (!this.camino || this.indicePunto >= this.camino.length) {
            this.dueño.mef.cambiarEstado('espera')
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

        this.actualizarAnimación(resultado.dx, resultado.dy)
        this.procesarResultado(resultado)

        if (resultado.llegó && resultado.esUltimoPunto) return

        this.dibujarRuta()
    }
}