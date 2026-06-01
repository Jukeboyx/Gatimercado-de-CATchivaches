import * as PIXI from '../pixi.js';

import { MEF } from "../MEF.js"
import { Estado } from "../MEF.js"
import * as estado from "./estados.js"
import { Jugador } from '../Jugador/index.js';

export class GatiNPC {
    constructor(posX, posY, idObjetoQueTiene, idObjetoQuePide, jugador, ANCHO_MUNDO = 2000, ALTO_MUNDO = 2000) {
        this.idObjetoQueTiene = idObjetoQueTiene
        this.idObjetoQuePide = idObjetoQuePide
        this.jugador = jugador
        this.ANCHO_MUNDO = ANCHO_MUNDO
        this.ALTO_MUNDO = ALTO_MUNDO

        this.contenedor = new PIXI.Container();
        this.contenedor.x = posX;
        this.contenedor.y = posY;

        this.TAMAÑO_FUENTE = 30
        this.PADDING = 6
        this.DISTANCIA_FRENO = 60

        this.spriteTemporal = new PIXI.Text({
            text: '🐱',
            style: {
                fontSize: this.TAMAÑO_FUENTE,
                padding: this.PADDING
            },
            anchor: 0.5
        });

        this.contenedor.addChild(this.spriteTemporal);

        this.contenedor.eventMode = 'static'
        this.contenedor.cursor = 'pointer'

        this.contenedor.hitArea = new PIXI.Circle(0, 0, 30)

        this.contenedor.on('pointertap', (e) => {
            console.log('clic detectado')
            e.stopPropagation()
            if (this.mef.estadoActual instanceof estado.Enojado) return

            console.log(`¡Miau! Te doy el ítem ${this.idObjetoQueTiene} si me traés ${this.idObjetoQuePide}`);
            if (this.jugador) {
                this.jugador.irHacia(
                    { x: this.contenedor.x, y: this.contenedor.y },
                    this.DISTANCIA_FRENO,
                    this
                );
            }

        })

        this.mef = new MEF(this, {
            merodeo: new estado.Merodeo(this),
            espera: new estado.Espera(this),
            intercambio: new estado.Intercambio(this),
            agradecido: new estado.Agradecido(this),
            enojado: new estado.Enojado(this)
        })

        this.mef.cambiarEstado('merodeo')
    }

    alHacerClic() {
        //this.mef.cambiarEstado('intercambio')
    }
    
    jugadorVaAIntercambiar() {
        const dx = this.jugador.contenedor.x - this.contenedor.x
        const dy = this.jugador.contenedor.y - this.contenedor.y
        const jugadorEstáCerca = Math.sqrt(dx * dx + dy * dy) < this.DISTANCIA_FRENO
        const npcEsObjetivoDelJugador = this.jugador.entidadObjetivo === this

        return jugadorEstáCerca && npcEsObjetivoDelJugador
    }

    actualizar(datos) {
        this.mef.actualizar(datos)
    }
}