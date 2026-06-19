import { Estado } from "../../mef.js"

export class Sentado extends Estado {
    alEntrar() {
        const imagen = this.dueño.imagen
        imagen.textures = this.dueño.animaciones.sentado
        imagen.loop = true
        imagen.play()
    }

    hacerChequeos() {
        if (Math.random() < 0.002) {
            this.dueño.mefAnimacion.cambiarEstado('pestañeando')
        }
        if (Math.random() < 0.0005) {
            this.dueño.mefAnimacion.cambiarEstado('bañandose')
        }
    }
}