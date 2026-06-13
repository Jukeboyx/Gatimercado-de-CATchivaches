import * as PIXI from "../../pixi.js"
import { Estado } from "../../mef.js"

export class Intercambio extends Estado {
    alEntrar() {
        this.dueño.asegurarseDeEstarSentado()

        if (this.dueño.alIniciarIntercambio) {
            this.dueño.alIniciarIntercambio(this.dueño)
        }
    }

    actualizarDireccion(dx, dy) {}

    alActualizar() {
    }

    alSalir() {
    }
}