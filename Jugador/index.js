import * as PIXI from '../pixi.js';

import { MEF } from "../MEF.js"
import * as estado from "./estados.js"

export function cortarFrames(rutaImagen, cantidadDeFrames, anchoFrame) {
    const frames = []
    for (let i = 0; i < cantidadDeFrames; i++) {
        frames.push(new PIXI.Texture({
            source: rutaImagen,
            frame: new PIXI.Rectangle(i * anchoFrame, 0, anchoFrame, anchoFrame)
        }))
    }
    return frames
}


export class Jugador {
    constructor(mundoContenedor, ANCHO_MUNDO = 2000, ALTO_MUNDO = 2000) {
        this.mundoContenedor = mundoContenedor
        this.ANCHO_MUNDO = ANCHO_MUNDO
        this.ALTO_MUNDO = ALTO_MUNDO

        this.estelaJugador = new PIXI.Graphics()
        this.mundoContenedor.addChild(this.estelaJugador)
        this.mundoContenedor.setChildIndex(this.estelaJugador, 1)

        this.banderitas = []

        const texturaDeLado = PIXI.Assets.get('Recursos/Sprites/JugadorDeLado.png')
        const texturaArriba = PIXI.Assets.get('Recursos/Sprites/JugadorArriba.png')
        const texturaAbajo  = PIXI.Assets.get('Recursos/Sprites/JugadorAbajo.png')
        const texturaEspera = PIXI.Assets.get('Recursos/Sprites/JugadorEspera.png')

        this.CANTIDAD_FRAMES = 4
        this.ANCHO_FRAME = 64
        this.VELOCIDAD_ANIMACION = 0.1

        this.historialPosiciones = []

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

        this.contenedor = new PIXI.Container()
        this.contenedor.addChild(this.imagen)

        this.contenedor.x = window.innerWidth / 2
        this.contenedor.y = window.innerHeight / 2

        this.mef = new MEF(this, {
            espera: new estado.Espera(this),
            caminando: new estado.Caminando(this),
            intercambio: new estado.Intercambio(this)
        })

        this.mef.cambiarEstado('espera')
    }

    irHacia(punto, distanciaFreno, entidad = null) {
        this.entidadObjetivo = entidad
        this.limpiarBanderitas()

        if (!entidad) {
            this.colocarBanderita(punto)
        }

        this.mef.cambiarEstado('caminando', {
            x: punto.x,
            y: punto.y,
            distanciaFreno: distanciaFreno
        })
    }

    colocarBanderita(punto) {
        const banderita = new PIXI.Text({
            text: '🚩',
            style: {
                fontSize: 24,
                fontFamily: 'Arial'
                }
        })
        banderita.anchor.set(0.5)
        banderita.x = punto.x
        banderita.y = punto.y
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
        this.mef.actualizar(datos)
    }

    verificarBanderitas() {
        for (let i = this.banderitas.length - 1; i >= 0; i--) {
            const banderita = this.banderitas[i]
            const dx = banderita.x - this.contenedor.x
            const dy = banderita.y - this.contenedor.y
            const distancia = Math.sqrt(dx * dx + dy * dy)

            if (distancia < 30) {
                this.mundoContenedor.removeChild(banderita)
                this.banderitas.splice(i, 1)
            }
        }
    }
}