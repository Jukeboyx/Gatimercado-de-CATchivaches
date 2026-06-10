import * as PIXI from "../../pixi.js"
import { Estado } from "../../mef.js"

export class Espera extends Estado {
    alEntrar() {
        this.dueño.imagen.textures = this.dueño.animaciones.espera
        this.dueño.imagen.play()
    }
}