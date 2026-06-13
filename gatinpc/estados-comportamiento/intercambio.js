import * as PIXI from "../../pixi.js"
import { Estado } from "../../mef.js"

export class Intercambio extends Estado {
    alEntrar() {
        if (this.dueño.alIniciarIntercambio) {
            this.dueño.alIniciarIntercambio(this.dueño)
        }
        this.dueño.detenerse()
    }

    actualizarDirección(dx, dy) {}

    alActualizar() {
    }

    alSalir() {
    }
}