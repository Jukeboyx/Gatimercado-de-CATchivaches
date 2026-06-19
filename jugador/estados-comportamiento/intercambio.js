import * as PIXI from "../../pixi.js"
import { Estado } from "../../mef.js"

export class Intercambio extends Estado {
    alEntrar() {
        this.dueño.estelaJugador.clear()
        this.dueño.mefAnimacion.cambiarEstado('sentado')
    }
}