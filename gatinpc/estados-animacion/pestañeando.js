import { Estado } from "../../mef.js"

export class Pestañeando extends Estado {
    alEntrar() {
        //console.log('entrando a pestañeando')
        const imagen = this.dueño.imagen
        imagen.textures = this.dueño.animaciones.pestañea
        imagen.loop = false
        imagen.play()
        this.tiempoTranscurrido = 0
    }
    
    alActualizar(datos) {
        this.tiempoTranscurrido += datos * (1000 / 60)
    }

    hacerChequeos() {
        if (this.tiempoTranscurrido > 100) {
            this.dueño.mefAnimacion.cambiarEstado('sentado')
        }
    }

    alSalir() {
        this.dueño.imagen.onComplete = null
    }

}