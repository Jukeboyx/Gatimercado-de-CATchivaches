import { Estado } from "../../mef.js"

export class Caminando extends Estado {
    alEntrar() {
        this.últimaAnimacion = null
    }

    alActualizar(datos) {
        this.dueño.tiempoCaminando += datos
    }

    actualizarDireccion(dx, dy) {
        const escalaBase = Math.abs(this.dueño.imagen.scale.x)
        const imagen = this.dueño.imagen
        const animaciones = this.dueño.animaciones
        const UMBRAL_DIAGONAL = 0.3
        const proporción = Math.abs(dx) / (Math.abs(dx) + Math.abs(dy) + 0.001)
        const movimientoSignificativo = Math.abs(dx) > 1

        let animacionNueva
        let escalaX = imagen.scale.x

        if (proporción > 0.5 + UMBRAL_DIAGONAL) {
            // Movimiento horizontal predominante
            if (movimientoSignificativo) {
                animacionNueva = dx < 0 ? animaciones.izquierda : animaciones.derecha
                escalaX = escalaBase
            } else {
                animacionNueva = animaciones.derecha
            }
        } else if (proporción < 0.5 - UMBRAL_DIAGONAL) {
            // Movimiento vertical predominante
            animacionNueva = dy < 0 ? animaciones.arriba : animaciones.abajo
        } else {
            // Diagonal - usar derecha
            if (movimientoSignificativo) {
                animacionNueva = dx < 0 ? animaciones.izquierda : animaciones.derecha
                escalaX = escalaBase
            } else {
                animacionNueva = animaciones.derecha
            }
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
    }

    alSalir() {}
}