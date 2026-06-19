import { Estado } from "../../mef.js"

export class Bañandose extends Estado {
    alEntrar() {
        const imagen = this.dueño.imagen
        imagen.textures = this.dueño.animaciones.baño
        imagen.loop = false
        imagen.play()

        this.vecesRestantes = 3 + Math.floor(Math.random() * 3)

        imagen.onComplete = () => {
            this.vecesRestantes--
            if (this.vecesRestantes > 0) {
                imagen.gotoAndPlay(0)
            } else {
                this.dueño.mefAnimacion.cambiarEstado('sentado')
            }
        }
    }

    alSalir() {
        this.dueño.imagen.onComplete = null
    }

    alActualizar() {}
    hacerChequeos() {}
}