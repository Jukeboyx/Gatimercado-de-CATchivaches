import * as PIXI from '../pixi.js';

import { MEF } from "../mef.js"
import * as Comportamiento from "./estados-comportamiento/indice.js"
import * as Animacion from "./estados-animacion/indice.js"
import { Jugador } from '../jugador/index.js';
import { cortarFrames } from '../herramientas-funciones.js';

export class GatiNPC {
    constructor(posX, posY, idObjetoQueTiene, idObjetoQuePide, jugador, ANCHO_MUNDO = 2000, ALTO_MUNDO = 2000) {
        this.idObjetoQueTiene = idObjetoQueTiene
        this.idObjetoQuePide = idObjetoQuePide
        this.jugador = jugador
        this.ANCHO_MUNDO = ANCHO_MUNDO
        this.ALTO_MUNDO = ALTO_MUNDO
        
        this.alIniciarIntercambio = null
        this.alCerrarIntercambio = null
        this.alSeleccionar = null

        this.tiempoCaminando = 0

        this.contenedor = new PIXI.Container();
        this.contenedor.x = posX;
        this.contenedor.y = posY;

        this.VELOCIDAD_GATINPC = 2

        this.TAMAÑO_FUENTE = 30
        this.PADDING = 6
        this.DISTANCIA_FRENO = 60

        const tiposDeGatos = [
            'GatoGris',
            'GatoNegro'
        ]

        this.gatoActual = tiposDeGatos[Math.floor(Math.random() * tiposDeGatos.length)]

        const texturaDeLado = PIXI.Assets.get(`recursos/sprites/${this.gatoActual}DeLado.png`)
        const texturaArriba = PIXI.Assets.get(`recursos/sprites/${this.gatoActual}Arriba.png`)
        const texturaAbajo  = PIXI.Assets.get(`recursos/sprites/${this.gatoActual}Abajo.png`)
        const texturaEspera = PIXI.Assets.get(`recursos/sprites/${this.gatoActual}Espera.png`)
        this.texturaEspera = PIXI.Assets.get(`recursos/sprites/${this.gatoActual}Espera.png`)

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
            
            if (this.mefComportamiento.estadoActual instanceof Comportamiento.Durmiendo) {
                if (Math.random() < 0.5) {
                    this.mefComportamiento.cambiarEstado('espera')
                } else {
                    this.mefComportamiento.cambiarEstado('enojado')
                }
                return
            }
            
            if (this.mefComportamiento.estadoActual instanceof Comportamiento.Enojado) return

            if (this.alSeleccionar) this.alSeleccionar()

            if (this.jugador) {
                this.jugador.irHacia(
                    { x: this.contenedor.x, y: this.contenedor.y },
                    this.DISTANCIA_FRENO,
                    this
                )
            }

        })

        this.mefComportamiento = new MEF(this, {
            merodeo: new Comportamiento.Merodeo(this),
            espera: new Comportamiento.Espera(this),
            intercambio: new Comportamiento.Intercambio(this),
            enojado: new Comportamiento.Enojado(this),
            dormido: new Comportamiento.Dormido(this)
        })

        this.mefAnimacion = new MEF(this, {
            caminando:   new Animacion.Caminando(this),
            sentandose:  new Animacion.Sentandose(this),
            sentado:     new Animacion.Sentado(this),
            pestañeando: new Animacion.Pestañeando(this),
            bañandose:   new Animacion.Bañandose(this),
            exhausto:    new Animacion.Exhausto(this),
            durmiendo:   new Animacion.Durmiendo(this),
        })

        this.mefComportamiento.cambiarEstado('merodeo')
    }

    asignarAccesorio(textura) {
        this.spriteAccesorio = new PIXI.Sprite(textura)
        this.spriteAccesorio.anchor.set(0.5)
        this.spriteAccesorio.y = -20
        this.contenedor.addChild(this.spriteAccesorio)
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

    actualizarDirección(dx, dy) {
        this.mefAnimacion.estadoActual.actualizarDirección(dx, dy)
    }

    // MANEJO DE ANIMACIONES //
    empezarACaminar() {
        this.mefAnimacion.cambiarEstado('caminando')
    }

    detenerse() {
        this.mefAnimacion.cambiarEstado('sentandose')
    }

    dormirse() {
        if (this.tiempoCaminando > 20 * 60) {
            this.mefAnimacion.cambiarEstado('exhausto')
        } else {
            this.mefAnimacion.cambiarEstado('durmiendo')
        }
    }

    actualizar(datos) {
        this.mefComportamiento.actualizar(datos)
        this.mefAnimacion.actualizar(datos)
    }
}