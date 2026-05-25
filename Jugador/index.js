import * as PIXI from '../pixi.js';

import { MEF } from "../MEF.js"
import * as estado from "./estados.js"

export class Jugador {
    constructor(textura, app) {
        this.app = app

        this.textura = new PIXI.Sprite(textura)
        this.textura.anchor.set(0.5)

        this.container = new PIXI.Container()
        this.container.addChild(this.textura)

        this.container.x = app.screen.width / 2
        this.container.y = app.screen.height / 2

        this.mef = new MEF(this, {
            espera: new estado.Espera(this),
            caminando: new estado.Caminando(this),
            intercambio: new estado.Intercambio(this)
        })

        this.mef.cambiarEstado('espera')
    }

    irHacia(punto) {
        this.mef.cambiarEstado('caminando', { x: punto.x, y: punto.y})
    }

    actualizar(datos) {
        this.mef.actualizar(datos)
    }
}