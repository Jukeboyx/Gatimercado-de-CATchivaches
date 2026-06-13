import * as PIXI from '../pixi.js';

import { MEF } from "../mef.js"
import * as Comportamiento from "./estados-comportamiento/indice.js"
import * as Animacion from "./estados-animacion/indice.js"
import { Jugador } from '../jugador/index.js';

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

        const coloresDeGatos = [
            'gris',
            'negro'
        ]

        this.colorDeGatoActual = coloresDeGatos[Math.floor(Math.random() * coloresDeGatos.length)]

        const sheet = PIXI.Assets.get(`recursos/sprites/gato_${this.colorDeGatoActual}.json`)

        const construirAnimacion = (desde, hasta) => {
            const frames = []
            for (let i = desde; i <= hasta; i++) {
                frames.push(sheet.textures[`gato_${this.colorDeGatoActual}_${tag.name}_${i - desde}`])
            }
            return frames
        }

        const animacionesDesdeTag = {}
        for (const tag of sheet.data.meta.frameTags) {
            const frames = []
            for (let i = tag.from; i <= tag.to; i++) {
                frames.push(sheet.textures[`gato_${this.colorDeGatoActual}_${tag.name}_${i - tag.from}`])
            }
            animacionesDesdeTag[tag.name] = frames
        }

        this.animaciones = {
            abajo:      animacionesDesdeTag['abajo'],
            derecha:    animacionesDesdeTag['derecha'],
            arriba:     animacionesDesdeTag['arriba'],
            izquierda:  animacionesDesdeTag['izquierda'],
            sentandose: animacionesDesdeTag['sentandose'],
            sentado:    animacionesDesdeTag['sentado'],
            pestañea:   animacionesDesdeTag['pestañea'],
            baño:       animacionesDesdeTag['baño'],
            exhausto:   animacionesDesdeTag['exhausto'],
            dormido:    animacionesDesdeTag['dormido'],
        }

        this.CANTIDAD_FRAMES = 4
        this.ANCHO_FRAME = 64
        this.VELOCIDAD_ANIMACION = 0.1

        this.imagen = new PIXI.AnimatedSprite(this.animaciones.sentado)
        this.imagen.anchor.set(0.5)
        this.imagen.scale.set(3)
        this.imagen.animationSpeed = this.VELOCIDAD_ANIMACION
        this.imagen.play()
        // const escalaSprite = window.innerWidth < 768 ? 2 : 1
        // this.imagen.scale.set(escalaSprite)
        
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
            durmiendo: new Comportamiento.Durmiendo(this)
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
        this.spriteAccesorio.scale.set(3)
        this.spriteAccesorio.y = 10
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

    actualizarDireccion(dx, dy) {
        if (this.mefAnimacion.estadoActual.actualizarDireccion) {
            this.mefAnimacion.estadoActual.actualizarDireccion(dx, dy)
        }
    }

    // MANEJO DE ANIMACIONES //
    empezarACaminar() {
        this.mefAnimacion.cambiarEstado('caminando')
    }

    empezarADetenerse() {
        console.trace('empezarADetenerse')
        this.mefAnimacion.cambiarEstado('sentandose')
    }

    asegurarseDeEstarSentado() {
        const animActual = this.mefAnimacion.estadoActual
        console.log('asegurarseDeEstarSentado, estado actual:', animActual.constructor.name)
        if (animActual instanceof Animacion.Sentado || 
            animActual instanceof Animacion.Sentandose ||
            animActual instanceof Animacion.Pestañeando) {
            return
        }
        this.empezarADetenerse()
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