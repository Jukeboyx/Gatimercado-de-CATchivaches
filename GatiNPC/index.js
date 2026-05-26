import * as PIXI from '../pixi.js';

import { MEF } from "../MEF.js"
import { Estado } from "../MEF.js"
import * as estado from "./estados.js"

export class GatiNPC {
    constructor(posX, posY, idObjetoQueTiene, idObjetoQuePide) {
        this.idObjetoQueTiene = idObjetoQueTiene
        this.idObjetoQuePide = idObjetoQuePide

        this.contenedor = new PIXI.Container();
        this.contenedor.x = posX;
        this.contenedor.y = posY;

        this.spriteTemporal = new PIXI.Text({
            text: '🐱',
            style: {
                fontSize: 30,
                padding: 6
            },
            anchor: 0.5
        });

        this.contenedor.addChild(this.spriteTemporal);

        //this.jugador = jugador
        
        this.contenedor.eventMode = 'static'
        this.contenedor.cursor = 'pointer'

        //this.container.hitArea = new PIXI.Rectangle(-10, -10, 80, 80)

        this.contenedor.on('pointertap', () => {
            /* if (this.mef.estadoActual instanceof estado.Espera) {
                this.mef.cambiarEstado('intercambio')
            } */
            console.log(`¡Miau! Te doy el ítem ${this.idObjetoQueTiene} si me traés ${this.idObjetoQuePide}`);

        })

        this.mef = new MEF(this, {
            espera: new estado.Espera(this),
            intercambio: new estado.Intercambio(this)
        })

        this.mef.cambiarEstado('espera')
    }

    alHacerClic() {
        //this.mef.cambiarEstado('intercambio')
    }

    actualizar() {
        if (this.mef) {
            this.mef.actualizar()
        }
    }
}