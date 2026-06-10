import * as PIXI from "../../pixi.js"
import { Estado } from "../../mef.js"

export class Intercambio extends Estado {
    alEntrar() {
        if (this.dueño.alIniciarIntercambio) {
            this.dueño.alIniciarIntercambio(this.dueño)
        }
        this.dueño.imagen.textures = this.dueño.animaciones.espera
        this.dueño.imagen.play()
    }

    alActualizar() {
    }

    alSalir() {
    }
}