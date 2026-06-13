import { Estado } from "../../mef.js"

export class Durmiendo extends Estado {
    alEntrar() {
        const imagen = this.dueño.imagen
        imagen.textures = this.dueño.animaciones.dormido
        imagen.loop = true
        imagen.play()

        this.tiempoSiesta = (5 + Math.random() * 5) * 60
        this.tiempoTranscurrido = 0
    }

    alActualizar(datos) {
        this.tiempoTranscurrido += datos
    }

    hacerChequeos() {
        if (this.tiempoTranscurrido >= this.tiempoSiesta) {
            this.dueño.mefAnimacion.cambiarEstado('sentado')
        }
    }

    alSalir() {
        this.dueño.tiempoCaminando = 0
    }
}