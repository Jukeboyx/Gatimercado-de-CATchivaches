import { Estado } from "../../mef.js"

export class Sentado extends Estado {
    alEntrar() {
        console.log('entrando a sentado')
        const imagen = this.dueño.imagen
        imagen.textures = this.dueño.animaciones.sentado
        imagen.loop = true
        imagen.play()

        this.dueño.tiempoCaminando = Math.max(0, this.dueño.tiempoCaminando)
    }

    alActualizar(datos) {
        this.dueño.tiempoCaminando = Math.max(
            0,
            this.dueño.tiempoCaminando - datos / 2
        )

    }
    
    alSalir() {}
    hacerChequeos() {
        if (Math.random() < 0.002) {
            this.dueño.mefAnimacion.cambiarEstado('pestañeando')
        }
    }
}