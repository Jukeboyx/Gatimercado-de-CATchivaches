import * as PIXI from "../../pixi.js"
import { Estado } from "../../mef.js"

export class Espera extends Estado {
    alEntrar() {
        this.dueño.imagen.textures = this.dueño.animaciones.espera
        this.dueño.imagen.play()
        this.TIEMPO_ESPERA = 2000 + Math.random() * 4000
        this.tiempoTrancurrido = 0
    }

    alActualizar(datos) {
        this.tiempoTrancurrido += datos * (1000 / 60)
    }
    
    hacerChequeos() {
        if (this.dueño.jugadorVaAIntercambiar()) {
            this.dueño.mef.cambiarEstado('intercambio')
            return
        }
        
        if (this.tiempoTrancurrido >= this.TIEMPO_ESPERA) {
            this.dueño.mef.cambiarEstado('merodeo')
        }
    }
}