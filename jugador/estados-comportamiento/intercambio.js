import * as PIXI from "../../pixi.js"
import { Estado } from "../../mef.js"

export class Intercambio extends Estado {
    alEntrar() {
        this.dueño.estelaJugador.clear()
        this.dueño.imagen.textures = this.dueño.animaciones.espera
        this.dueño.imagen.play()
    }
}