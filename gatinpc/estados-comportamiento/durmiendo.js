import { Estado } from "../../mef.js"

export class Dormido extends Estado {
    alEntrar() {
        this.dueño.dormirse()
    }

    hacerChequeos() {
        if (this.dueño.jugadorVaAIntercambiar()) {
            this.dueño.mefComportamiento.cambiarEstado('intercambio')
        }
    }

    alSalir() {
    }
}