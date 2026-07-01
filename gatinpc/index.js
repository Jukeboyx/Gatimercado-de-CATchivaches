import * as PIXI from '../pixi.js';

import { MEF } from "../mef.js"
import * as Comportamiento from "./estados-comportamiento/indice.js"
import * as Animacion from "./estados-animacion/indice.js"
import { Jugador } from '../jugador/index.js';
import { catálogoObjetos } from '../datos.js';

export class GatiNPC {
    constructor(posX, posY, idObjetoQueTiene, idObjetoQuePide, jugador, ANCHO_MUNDO = 2000, ALTO_MUNDO = 2000, obstaculos = []) {
        this.idObjetoQueTiene = idObjetoQueTiene
        this.idObjetoQuePide = idObjetoQuePide
        this.jugador = jugador
        this.ANCHO_MUNDO = ANCHO_MUNDO
        this.ALTO_MUNDO = ALTO_MUNDO
        this.obstaculos = obstaculos
        
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
            'negro',
            'blanco',
            'violeta',
            'naranja'
        ]

        this.colorDeGatoActual = coloresDeGatos[Math.floor(Math.random() * coloresDeGatos.length)]

        const sheet = PIXI.Assets.get(`recursos/sprites/gato_${this.colorDeGatoActual}.json`)

        const animacionesDesdeTag = {}
        for (const [nombreTextura, textura] of Object.entries(sheet.textures)) {
            const partes = nombreTextura.split('_')
            if (partes.length >= 3) {
                const nombreAnimacion = partes[2] // tercera parte es el nombre de animación
                if (!animacionesDesdeTag[nombreAnimacion]) {
                    animacionesDesdeTag[nombreAnimacion] = []
                }
                animacionesDesdeTag[nombreAnimacion].push(textura)
            }
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

        this.texturaEspera = animacionesDesdeTag['sentado'][0]
        
        this.CANTIDAD_FRAMES = 4
        this.ANCHO_FRAME = 64
        this.VELOCIDAD_ANIMACION = 0.1

        this.imagen = new PIXI.AnimatedSprite(this.animaciones.sentado)
        this.imagen.anchor.set(0.5)
        this.imagen.scale.set(3)
        this.imagen.animationSpeed = this.VELOCIDAD_ANIMACION
        this.imagen.play()
        
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

    asignarAccesorio(idObjetoTiene, idObjetoPide) {
        const objetoTiene = catálogoObjetos[idObjetoTiene]
        const objetoPide = catálogoObjetos[idObjetoPide]
        if (!objetoTiene || !objetoPide) return
        
        // Contenedor para el tradeo
        this.contenedorTradeo = new PIXI.Container()
        this.contenedorTradeo.y = -50 // Posición sobre la cabeza
        
        const texturaFondo = PIXI.Assets.get('recursos/sprites/globo.png')
        this.fondoTradeo = new PIXI.Sprite(texturaFondo)
        this.fondoTradeo.anchor.set(0.5)
        this.fondoTradeo.tint = '#BFBFBF'
        this.contenedorTradeo.addChild(this.fondoTradeo)

        // Objeto que el NPC pide (izquierda)
        this.spriteObjetoPide = objetoPide.crearSprite()
        this.spriteObjetoPide.anchor.set(0.5)
        this.spriteObjetoPide.scale.set(0.8)
        this.spriteObjetoPide.x = this.fondoTradeo.width * -0.25
        this.spriteObjetoPide.y = this.fondoTradeo.height * -0.08

        // Sprite de intercambio en el centro
        this.spriteFlecha = new PIXI.Sprite(PIXI.Assets.get('recursos/sprites/intercambio_item.png'))
        this.spriteFlecha.anchor.set(0.5)
        this.spriteFlecha.scale.set(0.8)
        this.spriteFlecha.x = this.fondoTradeo.width * 0.03
        this.spriteFlecha.y = this.fondoTradeo.height * -0.08

        // Objeto que el NPC tiene (derecha)
        this.spriteObjetoTiene = objetoTiene.crearSprite()
        this.spriteObjetoTiene.anchor.set(0.5)
        this.spriteObjetoTiene.scale.set(0.8)
        this.spriteObjetoTiene.x = this.fondoTradeo.width * 0.30
        this.spriteObjetoTiene.y = this.fondoTradeo.height * -0.08
        
        this.contenedorTradeo.addChild(this.spriteObjetoPide)
        this.contenedorTradeo.addChild(this.spriteFlecha)
        this.contenedorTradeo.addChild(this.spriteObjetoTiene)
        this.contenedorTradeo.visible = false // Oculto inicialmente
        
        this.contenedor.addChild(this.contenedorTradeo)
    }

    actualizarAccesorio() {
        if (!this.contenedorTradeo) return
        
        // Verificar si el jugador está cerca para mostrar el tradeo
        if (this.jugador) {
            const dx = this.jugador.contenedor.x - this.contenedor.x
            const dy = this.jugador.contenedor.y - this.contenedor.y
            const distancia = Math.sqrt(dx * dx + dy * dy)
            const DISTANCIA_VISIBILIDAD = 200
            
            this.contenedorTradeo.visible = distancia < DISTANCIA_VISIBILIDAD
        }
        
        // Ajustar posición del contenedor según animación
        const estadoAnimacion = this.mefAnimacion.estadoActual
        if (estadoAnimacion) {
            const nombreEstado = estadoAnimacion.constructor.name
            switch (nombreEstado) {
                case 'Caminando':
                case 'Sentandose':
                case 'Sentado':
                case 'Pestañeando':
                    this.contenedorTradeo.y = -50
                    break
                case 'Bañandose':
                    this.contenedorTradeo.y = -45
                    break
                case 'Exhausto':
                case 'Durmiendo':
                    this.contenedorTradeo.y = -40
                    break
                default:
                    this.contenedorTradeo.y = -50
            }
        }
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
        // Actualizar el tradeo para mostrar los nuevos objetos
        if (this.contenedorTradeo) {
            this.contenedor.removeChild(this.contenedorTradeo)
        }
        this.asignarAccesorio(this.idObjetoQueTiene, this.idObjetoQuePide)
    }

    actualizarDireccion(dx, dy) {
        if (this.mefAnimacion.estadoActual.actualizarDireccion) {
            this.mefAnimacion.estadoActual.actualizarDireccion(dx, dy)
        }
        this.actualizarAccesorio()
    }

    // MANEJO DE ANIMACIONES Y COMPORTAMIENTOS //
    empezarACaminar() {
        this.mefAnimacion.cambiarEstado('caminando')
    }

    empezarADetenerse() {
        if (this.estaExhausto()) {
            this.mefComportamiento.cambiarEstado('durmiendo')
        } else {
            this.mefAnimacion.cambiarEstado('sentandose')
            this.mefComportamiento.cambiarEstado('espera')
        }
    }

    asegurarseDeEstarSentado() {
        const animActual = this.mefAnimacion.estadoActual
        
        if (animActual instanceof Animacion.Sentado || 
            animActual instanceof Animacion.Sentandose ||
            animActual instanceof Animacion.Pestañeando) {
            return
        }
        this.empezarADetenerse()
    }

    estaExhausto() {
        return this.tiempoCaminando > 20 * 60
    }

    dormirse() {
        if (this.estaExhausto()) {
            this.mefAnimacion.cambiarEstado('exhausto')
        } else {
            this.mefAnimacion.cambiarEstado('durmiendo')
        }
    }

    terminarCaminata() {

    }

    actualizar(datos) {
        this.mefComportamiento.actualizar(datos)
        this.mefAnimacion.actualizar(datos)
        this.actualizarAccesorio()
    }
}