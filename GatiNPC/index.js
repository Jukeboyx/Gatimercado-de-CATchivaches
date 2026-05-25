import * as PIXI from '../pixi.js';

import { MEF } from "../MEF.js"
import { Estado } from "../MEF.js"
import * as estado from "./estados.js"

export class GatiNPC {
    constructor(idObjetoQueTiene, idObjetoQuePide, texturaGato, jugador) {
        this.idObjetoQueTiene = idObjetoQueTiene
        this.idObjetoQuePide = idObjetoQuePide
        this.jugador = jugador
        this.textura = new PIXI.Sprite(texturaGato)
        this.container = new PIXI.Container();
        this.container.eventMode = 'static'
        this.container.addChild(this.textura)
        this.container.hitArea = new PIXI.Rectangle(-10, -10, 80, 80)

        this.container.on('pointertap', () => {
            if (this.mef.estadoActual instanceof GatiEstadoEspera) {
                this.mef.cambiarEstado('intercambio')
            }
        })

        this.mef = new MEF(this, {
            espera: new estado.Espera(this),
            intercambio: new estado.Intercambio(this)
        })

        this.mef.cambiarEstado('espera')
    }

    actualizar() {
        if (this.mef) {
            this.mef.actualizar()
        }
    }
}