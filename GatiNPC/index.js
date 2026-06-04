import * as PIXI from '../pixi.js';

import { MEF } from "../mef.js"
import * as estado from "./estados.js"
import { Jugador, cortarFrames } from '../Jugador/index.js';

export class GatiNPC {
    constructor(posX, posY, idObjetoQueTiene, idObjetoQuePide, jugador, ANCHO_MUNDO = 2000, ALTO_MUNDO = 2000, menu) {
        this.idObjetoQueTiene = idObjetoQueTiene
        this.idObjetoQuePide = idObjetoQuePide
        this.jugador = jugador
        this.ANCHO_MUNDO = ANCHO_MUNDO
        this.ALTO_MUNDO = ALTO_MUNDO
        this.menu = menu

        this.contenedor = new PIXI.Container();
        this.contenedor.x = posX;
        this.contenedor.y = posY;

        this.TAMAÑO_FUENTE = 30
        this.PADDING = 6
        this.DISTANCIA_FRENO = 60

        const tiposDeGatos = [
            'GatoGris',
            'GatoNegro'
        ]

        this.gatoActual = tiposDeGatos[Math.floor(Math.random() * tiposDeGatos.length)]

        const texturaDeLado = PIXI.Assets.get(`Recursos/Sprites/${this.gatoActual}DeLado.png`)
        const texturaArriba = PIXI.Assets.get(`Recursos/Sprites/${this.gatoActual}Arriba.png`)
        const texturaAbajo  = PIXI.Assets.get(`Recursos/Sprites/${this.gatoActual}Abajo.png`)
        const texturaEspera = PIXI.Assets.get(`Recursos/Sprites/${this.gatoActual}Espera.png`)
        this.texturaEspera = PIXI.Assets.get(`Recursos/Sprites/${this.gatoActual}Espera.png`)

        this.CANTIDAD_FRAMES = 4
        this.ANCHO_FRAME = 64
        this.VELOCIDAD_ANIMACION = 0.1

        this.animaciones = {
            lado: cortarFrames(texturaDeLado, this.CANTIDAD_FRAMES, this.ANCHO_FRAME),
            arriba: cortarFrames(texturaArriba, this.CANTIDAD_FRAMES, this.ANCHO_FRAME),
            abajo: cortarFrames(texturaAbajo, this.CANTIDAD_FRAMES, this.ANCHO_FRAME),
            espera: cortarFrames(texturaEspera, this.CANTIDAD_FRAMES, this.ANCHO_FRAME),
        }

        this.imagen = new PIXI.AnimatedSprite(this.animaciones.espera)
        this.imagen.anchor.set(0.5)
        this.imagen.animationSpeed = this.VELOCIDAD_ANIMACION
        this.imagen.play()
        const escalaSprite = window.innerWidth < 768 ? 2 : 1
        this.imagen.scale.set(escalaSprite)
        
        this.contenedor.addChild(this.imagen)

        this.contenedor.eventMode = 'static'
        this.contenedor.cursor = 'pointer'

        this.contenedor.hitArea = new PIXI.Circle(0, 0, 50)

        this.contenedor.on('pointertap', (e) => {
            e.stopPropagation()
            if (this.mef.estadoActual instanceof estado.Enojado) return

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
    
    jugadorVaAIntercambiar() {
        const dx = this.jugador.contenedor.x - this.contenedor.x
        const dy = this.jugador.contenedor.y - this.contenedor.y
        const jugadorEstáCerca = Math.sqrt(dx * dx + dy * dy) < this.DISTANCIA_FRENO
        const npcEsObjetivoDelJugador = this.jugador.entidadObjetivo === this

        return jugadorEstáCerca && npcEsObjetivoDelJugador
    }

    actualizarObjetos() {
        [this.idObjetoQueTiene, this.idObjetoQuePide] = [this.idObjetoQuePide, this.idObjetoQueTiene]
    }

    actualizar(datos) {
        this.mef.actualizar(datos)
    }
}