import { Estado } from "../../mef.js"

export class Caminando extends Estado {
    alEntrar() {
        this.últimaAnimacion = null
    }

    alActualizar(datos) {
        this.dueño.tiempoCaminando += datos
    }

    actualizarDirección(dx, dy) {
        const escalaBase = Math.abs(this.dueño.imagen.scale.x)
        const imagen = this.dueño.imagen
        const animaciones = this.dueño.animaciones
        const UMBRAL_DIAGONAL = 0.3
        const proporción = Math.abs(dx) / (Math.abs(dx) + Math.abs(dy) + 0.001)
        const movimientoSignificativo = Math.abs(dx) > 1

        let animacionNueva
        let escalaX = imagen.scale.x

        if (proporción > 0.5 + UMBRAL_DIAGONAL) {
            animacionNueva = animaciones.derecha
            if (movimientoSignificativo) escalaX = dx < 0 ? -escalaBase : escalaBase
        } else if (proporción < 0.5 - UMBRAL_DIAGONAL) {
            animacionNueva = dy < 0 ? animaciones.arriba : animaciones.abajo
        } else {
            animacionNueva = animaciones.derecha
            if (movimientoSignificativo) escalaX = dx < 0 ? -escalaBase : escalaBase
        }

        if (animacionNueva !== this.últimaAnimacion) {
            imagen.textures = animacionNueva
            imagen.play()
            this.últimaAnimacion = animacionNueva
        }

        if (escalaX !== imagen.scale.x) {
            imagen.scale.x = escalaX
        }
    }

    hacerChequeos() {
        if (this.dueño.tiempoCaminando > 20 * 60) {
            this.dueño.mefAnimacion.cambiarEstado('exhausto')
        }
    }

    alSalir() {}
}