import * as PIXI from '../pixi.js';

import { MEF } from "../mef.js"
import * as Comportamiento from "./estados-comportamiento/indice.js"
import * as Animacion from "./estados-animacion/indice.js"


export class Jugador {
    constructor(mundoContenedor, ANCHO_MUNDO = 2000, ALTO_MUNDO = 2000, obstaculos = []) {
        this.mundoContenedor = mundoContenedor
        this.ANCHO_MUNDO = ANCHO_MUNDO
        this.ALTO_MUNDO = ALTO_MUNDO
        this.obstaculos = obstaculos

        this.estelaJugador = new PIXI.Graphics()
        this.mundoContenedor.addChild(this.estelaJugador)
        this.mundoContenedor.setChildIndex(this.estelaJugador, 1)

        this.banderitas = []

        const sheet = PIXI.Assets.get('recursos/sprites/jugador.json')

        const animacionesDesdeTag = {}
        for (const tag of sheet.data.meta.frameTags) {
            const frames = []
            for (let i = tag.from; i <= tag.to; i++) {
                frames.push(sheet.textures[`${tag.name}_${i - tag.from}.ase`])
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
            dormido:   animacionesDesdeTag['dormido'],
        }

        this.texturaEspera = this.animaciones.sentado[0]
        
        this.CANTIDAD_FRAMES = 4
        this.ANCHO_FRAME = 64
        this.VELOCIDAD_ANIMACION = 0.1

        this.historialPosiciones = []

        this.imagen = new PIXI.AnimatedSprite(this.animaciones.sentado)
        this.imagen.anchor.set(0.5)
        this.imagen.scale.set(3)
        this.imagen.animationSpeed = this.VELOCIDAD_ANIMACION
        this.imagen.play()
        // const escalaSprite = window.innerWidth < 768 ? 2 : 1
        // this.imagen.scale.set(escalaSprite)

        this.contenedor = new PIXI.Container()
        this.contenedor.addChild(this.imagen)

        this.contenedor.x = window.innerWidth / 2
        this.contenedor.y = window.innerHeight / 2

        this.mefComportamiento = new MEF(this, {
            espera: new Comportamiento.Espera(this),
            caminando: new Comportamiento.Caminando(this),
            intercambio: new Comportamiento.Intercambio(this)
        })
        
        this.mefAnimacion = new MEF(this, {
            caminando:   new Animacion.Caminando(this),
            sentandose:  new Animacion.Sentandose(this),
            sentado:     new Animacion.Sentado(this),
            pestañeando: new Animacion.Pestañeando(this),
            bañandose:   new Animacion.Bañandose(this),
        })

        this.mefComportamiento.cambiarEstado('espera')
        this.mefAnimacion.cambiarEstado('sentado')
    }

    empezarACaminar() {
        this.mefAnimacion.cambiarEstado('caminando')
    }

    empezarADetenerse() {
        this.mefAnimacion.cambiarEstado('sentandose')
        this.mefComportamiento.cambiarEstado('espera')
    }

    actualizarDireccion(dx, dy) {
        if (this.mefAnimacion.estadoActual.actualizarDireccion) {
            this.mefAnimacion.estadoActual.actualizarDireccion(dx, dy)
        }
    }

    irHacia(punto, distanciaFreno = 5, entidad = null) {
        this.entidadObjetivo = entidad
        this.limpiarBanderitas()

        if (!entidad) {
            this.colocarBanderita(punto)
        }

        const destino = { x: punto.x, y: punto.y, distanciaFreno }

        if (this.mefComportamiento.estadoActual instanceof Comportamiento.Caminando) {
            this.mefComportamiento.estadoActual.actualizarDestino(destino)
        } else {
            this.mefComportamiento.cambiarEstado('caminando', destino)
        }
    }

    colocarBanderita(punto) {
        const banderita = new PIXI.Text({
            text: '🚩',
            style: {
                fontSize: 30,
                fontFamily: 'Arial'
                }
        })
        banderita.anchor.set(0.5)
        banderita.x = punto.x
        banderita.y = punto.y
        banderita.zIndex = banderita.y
        this.mundoContenedor.addChild(banderita)
        this.mundoContenedor.setChildIndex(banderita, 2)
        this.banderitas.push(banderita)
    }

    limpiarBanderitas() {
        for (const banderita of this.banderitas) {
            this.mundoContenedor.removeChild(banderita)
        }
        this.banderitas.length = 0
    }

    actualizar(datos) {
        this.historialPosiciones.push({
            x: this.contenedor.x,
            y: this.contenedor.y
        })

        if (this.historialPosiciones.length > 15) {
            this.historialPosiciones.shift()
        }
        this.verificarBanderitas()
        this.mefComportamiento.actualizar(datos)
        this.mefAnimacion.actualizar(datos)
    }

    verificarBanderitas() {
        for (let i = this.banderitas.length - 1; i >= 0; i--) {
            const banderita = this.banderitas[i]
            const dx = banderita.x - this.contenedor.x
            const dy = banderita.y - this.contenedor.y
            const distancia = Math.sqrt(dx * dx + dy * dy)

            if (distancia < 35) {
                this.mundoContenedor.removeChild(banderita)
                this.banderitas.splice(i, 1)
            }
        }
    }
}