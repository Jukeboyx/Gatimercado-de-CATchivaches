import { Estado } from "../../mef.js"

export class Sentandose extends Estado {
    alEntrar() {
        const imagen = this.dueño.imagen
        imagen.textures = this.dueño.animaciones.sentandose
        imagen.loop = false
        imagen.play()

        imagen.onComplete = () => {
            this.dueño.mefAnimacion.cambiarEstado('sentado')
        }
    }

    alSalir() {
        this.dueño.imagen.onComplete = null
    }
}