import { Estado } from "../../mef.js"

export class Pestañeando extends Estado {
    alEntrar() {
        const imagen = this.dueño.imagen
        imagen.textures = this.dueño.animaciones.pestañea
        imagen.loop = false
        imagen.play()

        imagen.onComplete = () => {
            this.dueño.mefAnimacion.cambiarEstado('sentado')
        }
    }

    alSalir() {
        this.dueño.imagen.onComplete = null
    }

    alActualizar() {}
    hacerChequeos() {}
}