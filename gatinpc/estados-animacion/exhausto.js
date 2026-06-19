import { Estado } from "../../mef.js"

export class Exhausto extends Estado {
    alEntrar() {
        const imagen = this.dueño.imagen
        imagen.textures = this.dueño.animaciones.exhausto
        imagen.loop = false
        imagen.play()

        this.tiempoTranscurrido = 0
        this.tiempoSiesta = (10 + Math.random() * 5) * 60

        imagen.onComplete = () => {
            imagen.gotoAndStop(imagen.totalFrames - 1)
        }
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
        this.dueño.imagen.onComplete = null
        this.dueño.tiempoCaminando = 0
    }
}