import * as PIXI from "../../pixi.js"
import { Estado } from "../../mef.js"

export class Espera extends Estado {
    alEntrar() {
        this.dueño.asegurarseDeEstarSentado()
        this.TIEMPO_ESPERA = 2000 + Math.random() * 4000
        this.tiempoTrancurrido = 0
    }

    alActualizar(datos) {
        this.tiempoTrancurrido += datos * (1000 / 60)
    }
    
    hacerChequeos() {
        if (this.dueño.jugadorVaAIntercambiar()) {
            this.dueño.mefComportamiento.cambiarEstado('intercambio')
            return
        }
        
        if (this.tiempoTrancurrido >= this.TIEMPO_ESPERA) {
            this.dueño.mefComportamiento.cambiarEstado('merodeo')
        }
    }
}