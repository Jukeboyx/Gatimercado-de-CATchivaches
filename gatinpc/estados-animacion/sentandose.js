import { Estado } from "../../mef.js"

export class Sentandose extends Estado {
    alEntrar() {
        //console.log('Entro a sentandose')
        const imagen = this.dueño.imagen
        imagen.textures = this.dueño.animaciones['sentandose']
        imagen.loop = false
        imagen.play()
        this.completado = false

        imagen.onComplete = () => {
            //console.log('Terminó animación sentándose')
            this.completado = true
        }
    }
    
    hacerChequeos() {
        if (this.completado) {
            this.dueño.mefAnimacion.cambiarEstado('sentado')
        }
    }

    alSalir() {
        this.dueño.imagen.onComplete = null
    }

    alActualizar() {}
}