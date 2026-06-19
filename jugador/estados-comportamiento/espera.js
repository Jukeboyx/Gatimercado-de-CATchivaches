import * as PIXI from "../../pixi.js"
import { Estado } from "../../mef.js"

export class Espera extends Estado {
    alEntrar() {
        this.dueño.mefAnimacion.cambiarEstado('sentado')
    }
}