import * as PIXI from '../pixi.js';

import { MEF } from "../mef.js"
import * as Comportamiento from "./estados-comportamiento/indice.js"
import * as Animacion from "./estados-animacion/indice.js"
import { Jugador } from '../jugador/index.js';
import { catálogoObjetos } from '../datos.js';

export class GatiNPC {
    constructor(posX, posY, idObjetoQueTiene, idObjetoQuePide, jugador, ANCHO_MUNDO = 2000, ALTO_MUNDO = 2000, sistemaGrilla = null, colorGato = null, capaGlobos = null) {
        this.idObjetoQueTiene = idObjetoQueTiene
        this.idObjetoQuePide = idObjetoQuePide
        this.jugador = jugador
        this.ANCHO_MUNDO = ANCHO_MUNDO
        this.ALTO_MUNDO = ALTO_MUNDO
        this.sistemaGrilla = sistemaGrilla
        this.capaGlobos = capaGlobos // Contenedor de mundoContenedor donde vive el globo, para que no lo tape el sorteo por Y de árboles/gatos
        
        this.alIniciarIntercambio = null
        this.alCerrarIntercambio = null
        this.alSeleccionar = null

        this.tiempoCaminando = 0

        this.contenedor = new PIXI.Container()
        this.contenedor.x = posX;
        this.contenedor.y = posY;
        
        this.contenedorVisual = new PIXI.Container()
        this.contenedorVisual.sortableChildren = true
        this.contenedor.addChild(this.contenedorVisual)

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
 
        this.colorDeGatoActual = colorGato || coloresDeGatos[Math.floor(Math.random() * coloresDeGatos.length)]

        const sheet = PIXI.Assets.get(`recursos/sprites/gato_${this.colorDeGatoActual}.json`)
        console.log(sheet)

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
        
        // Configurar la imagen del gatito
        this.imagen = new PIXI.AnimatedSprite(this.animaciones.sentado)
        this.imagen.anchor.set(0.5, 0.9)
        this.imagen.scale.set(3)
        this.imagen.animationSpeed = this.VELOCIDAD_ANIMACION
        this.imagen.play()
        this.contenedorVisual.addChild(this.imagen)
        
        // Configurar los accesorios del gatito
        let spriteshetAccesorios = PIXI.Assets.get(`recursos/sprites/accesorios.json`)
        
        let accesoriosTexturas = Object.values(spriteshetAccesorios.textures)
        this.accesorios = new PIXI.AnimatedSprite(accesoriosTexturas)
        this.contenedorVisual.addChild(this.accesorios)
        this.accesorios.scale.set(3)
        this.accesorios.anchor.set(0.5, 1.15)
        this.tipoAccesorioBase = Math.floor(Math.random() * 12) // Tipo de accesorio (0-11)
        this.accesorios.gotoAndStop(this.tipoAccesorioBase)

        //console.log(PIXI.Assets.get(`recursos/sprites/accesorios.json`))

        this.contenedor.eventMode = 'static'
        this.contenedor.cursor = 'pointer'
        this.contenedor.hitArea = new PIXI.Circle(0, 0, 50)
        this.contenedor.interactiveChildren = false

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

    mostrarGloboIntercambios(idObjetoTiene, idObjetoPide) {
        const objetoTiene = catálogoObjetos[idObjetoTiene]
        const objetoPide = catálogoObjetos[idObjetoPide]
        if (!objetoTiene || !objetoPide) return
        
        // Contenedor para el tradeo
        this.contenedorTradeo = new PIXI.Container()
        
        const texturaFondo = PIXI.Assets.get('recursos/sprites/globo.png')
        this.fondoTradeo = new PIXI.Sprite(texturaFondo)
        this.fondoTradeo.anchor.set(0.5, 1.2)
        this.fondoTradeo.tint = '#BFBFBF'
        this.contenedorTradeo.addChild(this.fondoTradeo)
        
        // Objeto que el NPC pide (izquierda)
        this.spriteObjetoPide = objetoPide.crearSprite()
        this.spriteObjetoPide.anchor.set(0.5)
        this.spriteObjetoPide.scale.set(0.8)
        this.spriteObjetoPide.x = this.fondoTradeo.width * -0.25
        this.spriteObjetoPide.y = this.fondoTradeo.height * -0.78

        // Sprite de intercambio en el centro
        this.spriteFlecha = new PIXI.Sprite(PIXI.Assets.get('recursos/sprites/intercambio_item.png'))
        this.spriteFlecha.anchor.set(0.5)
        this.spriteFlecha.scale.set(0.8)
        this.spriteFlecha.x = this.fondoTradeo.width * 0.03
        this.spriteFlecha.y = this.fondoTradeo.height * -0.78

        // Objeto que el NPC tiene (derecha)
        this.spriteObjetoTiene = objetoTiene.crearSprite()
        this.spriteObjetoTiene.anchor.set(0.5)
        this.spriteObjetoTiene.scale.set(0.8)
        this.spriteObjetoTiene.x = this.fondoTradeo.width * 0.30
        this.spriteObjetoTiene.y = this.fondoTradeo.height * -0.78
        
        this.contenedorTradeo.addChild(this.spriteObjetoPide)
        this.contenedorTradeo.addChild(this.spriteFlecha)
        this.contenedorTradeo.addChild(this.spriteObjetoTiene)
        
        this.contenedorTradeo.visible = false

        if (this.capaGlobos) {
            this.capaGlobos.addChild(this.contenedorTradeo)
        } else {
            this.contenedorVisual.addChild(this.contenedorTradeo)
        }
    }

    actualizarGloboIntercambios() {
    if (!this.contenedorTradeo) return
    
    // Verificar si el jugador está cerca para mostrar el tradeo
    if (this.jugador) {
        const dx = this.jugador.contenedor.x - this.contenedor.x
        const dy = this.jugador.contenedor.y - this.contenedor.y
        const distancia = Math.sqrt(dx * dx + dy * dy)
        const DISTANCIA_VISIBILIDAD = 200
        
        this.contenedorTradeo.visible = distancia < DISTANCIA_VISIBILIDAD
        
        // Verificar si el jugador tiene el item que pide el gato
        const tieneItem = this.jugador.inventario && this.jugador.inventario.objetosActuales.includes(this.idObjetoQuePide)
        
        // Cambiar color del fondo según si tiene el item
        this.fondoTradeo.tint = tieneItem ? '#ffffff' : '#989898'
    }
}

    static ALTURAS_VISUALES = {
        Caminando: -50,
        Sentandose: -50,
        Sentado: -50,
        Pestañeando: -50,
        Bañandose: -45,
        Exhausto: -40,
        Durmiendo: -40,
    }

    actualizarPosicionVisual() {
        if (!this.contenedorTradeo) return
        const nombreEstado = this.mefAnimacion.estadoActual?.constructor.name
        const alturaOffset = GatiNPC.ALTURAS_VISUALES[nombreEstado] ?? -50

        if (this.capaGlobos) {
            // capaGlobos es hermano de este.contenedor dentro de mundoContenedor,
            // así que comparten el mismo espacio de coordenadas: alcanza con sumar el offset
            this.contenedorTradeo.x = this.contenedor.x
            this.contenedorTradeo.y = this.contenedor.y + alturaOffset
        } else {
            this.contenedorTradeo.y = alturaOffset
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
        if (this.contenedorTradeo && this.contenedorTradeo.parent) {
            this.contenedorTradeo.parent.removeChild(this.contenedorTradeo)
        }
        this.mostrarGloboIntercambios(this.idObjetoQueTiene, this.idObjetoQuePide)
    }

    actualizarDireccion(dx, dy) {
        if (this.mefAnimacion.estadoActual.actualizarDireccion) {
            this.mefAnimacion.estadoActual.actualizarDireccion(dx, dy)
        }
        this.actualizarPosicionAccesorio(dx, dy)
        this.actualizarGloboIntercambios()
    }

    actualizarPosicionAccesorio(dx, dy) {
    // === CONFIGURACIÓN DE POSICIÓN DEL ACCESORIO ===
    const DESPLAZAMIENTOS = {
        arriba: { x: 0, y: -8 },
        abajo: { x: 0, y: 11 },
        izquierda: { x: -16, y: 7 },
        derecha: { x: 19, y: 10 },
        bañandose: { x: 0, y: 0 },
        durmiendo: { x: 100, y: 100 },
        exhausto: { x: 100, y: 100 },
        porDefecto: { x: 101.5, y: 100 }
    }

    const UMBRAL_DIAGONAL = 0.3
    const proporción = Math.abs(dx) / (Math.abs(dx) + Math.abs(dy) + 0.001)
    const movimientoSignificativo = Math.abs(dx) > 1 || Math.abs(dy) > 1

    let desplazamiento = DESPLAZAMIENTOS.porDefecto
    let frameAccesorio = this.tipoAccesorioBase

    // Verificar si estamos en un estado especial
    const estadoAnimacion = this.mefAnimacion.estadoActual

    if (estadoAnimacion) {
        const nombreEstado = estadoAnimacion.constructor.name

        switch (nombreEstado) {
            case 'Bañandose':
                desplazamiento = DESPLAZAMIENTOS.bañandose
                frameAccesorio = this.tipoAccesorioBase
                break

            case 'Durmiendo':
                desplazamiento = DESPLAZAMIENTOS.durmiendo
                frameAccesorio = this.tipoAccesorioBase
                break

            case 'Exhausto':
                desplazamiento = DESPLAZAMIENTOS.exhausto
                frameAccesorio = this.tipoAccesorioBase
                break

            default:
                if (movimientoSignificativo) {

                    if (proporción > 0.5 + UMBRAL_DIAGONAL) {
                        // Movimiento horizontal predominante

                        if (dx < 0) {
                            // Izquierda
                            desplazamiento = DESPLAZAMIENTOS.izquierda
                            frameAccesorio = this.tipoAccesorioBase + 24
                        } else {
                            // Derecha
                            desplazamiento = DESPLAZAMIENTOS.derecha
                            frameAccesorio = this.tipoAccesorioBase + 12
                        }

                    } else if (proporción < 0.5 - UMBRAL_DIAGONAL) {
                        // Movimiento vertical predominante

                        if (dy < 0) {
                            desplazamiento = DESPLAZAMIENTOS.arriba
                            frameAccesorio = this.tipoAccesorioBase + 36
                        } else {
                            desplazamiento = DESPLAZAMIENTOS.abajo
                            frameAccesorio = this.tipoAccesorioBase
                        }

                    } else {
                        // Movimiento diagonal

                        if (dx < 0) {
                            // Diagonal hacia la izquierda
                            desplazamiento = DESPLAZAMIENTOS.izquierda
                            frameAccesorio = this.tipoAccesorioBase + 24
                        } else {
                            // Diagonal hacia la derecha
                            desplazamiento = DESPLAZAMIENTOS.derecha
                            frameAccesorio = this.tipoAccesorioBase + 12
                        }

                    }
                }
                break
        }
    }

    this.accesorios.x = desplazamiento.x
    this.accesorios.y = desplazamiento.y
    this.accesorios.gotoAndStop(frameAccesorio)
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

        // En intercambio solo sentamos la animación; empezarADetenerse() cambia el comportamiento a espera
        // y provoca un bucle espera↔intercambio que dispara el maullido muchas veces por frame.
        if (this.mefComportamiento.estadoActual instanceof Comportamiento.Intercambio) {
            this.mefAnimacion.cambiarEstado('sentandose')
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
        this.actualizarPosicionVisual()
        this.actualizarGloboIntercambios()
    }
}