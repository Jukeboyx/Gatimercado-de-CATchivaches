import * as PIXI from '../pixi.js';

import { MEF } from "../mef.js"
import * as Comportamiento from "./estados-comportamiento/indice.js"
import * as Animacion from "./estados-animacion/indice.js"
import { Banderita } from "./banderita.js"


export class Jugador {
    constructor(mundoContenedor, ANCHO_MUNDO = 2000, ALTO_MUNDO = 2000, sistemaGrilla = null) {
        this.mundoContenedor = mundoContenedor
        this.ANCHO_MUNDO = ANCHO_MUNDO
        this.ALTO_MUNDO = ALTO_MUNDO
        this.sistemaGrilla = sistemaGrilla

        this.estelaJugador = new PIXI.Graphics()
        this.mundoContenedor.addChild(this.estelaJugador)
        this.mundoContenedor.setChildIndex(this.estelaJugador, 1)

        this.banderita = new Banderita(this.mundoContenedor)
        this.skinActual = 'default'

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
        this.imagen.anchor.set(0.5, 0.9)
        this.imagen.scale.set(3)
        this.imagen.animationSpeed = this.VELOCIDAD_ANIMACION
        this.imagen.play()
        // const escalaSprite = window.innerWidth < 768 ? 2 : 1
        // this.imagen.scale.set(escalaSprite)

        this.contenedor = new PIXI.Container()
        this.contenedor.eventMode = 'none'
        this.contenedor.interactiveChildren = false
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

    asegurarseDeEstarSentado() {
        const animActual = this.mefAnimacion.estadoActual
        
        if (animActual instanceof Animacion.Sentado || 
            animActual instanceof Animacion.Sentandose ||
            animActual instanceof Animacion.Pestañeando) {
            return
        }
        this.empezarADetenerse()
    }

    actualizarDireccion(dx, dy) {
        if (this.mefAnimacion.estadoActual.actualizarDireccion) {
            this.mefAnimacion.estadoActual.actualizarDireccion(dx, dy)
        }
    }

    irHacia(punto, distanciaFreno = 5, entidad = null) {
        this.entidadObjetivo = entidad

        let destinoFinal = punto

        if (!entidad) {
            destinoFinal = this.sistemaGrilla.snapAlCentro(punto.x, punto.y)

            const celdaJugador = this.sistemaGrilla.mundoAGrilla(this.contenedor.x, this.contenedor.y)
            const celdaDestino = this.sistemaGrilla.mundoAGrilla(destinoFinal.x, destinoFinal.y)

            if (celdaJugador.x === celdaDestino.x && celdaJugador.y === celdaDestino.y) {
                this.banderita.ocultar()
                return
            }

            this.banderita.mostrarEn(destinoFinal)
        } else {
            this.banderita.ocultar()
        }

        const destino = { x: destinoFinal.x, y: destinoFinal.y, distanciaFreno }

        if (this.mefComportamiento.estadoActual instanceof Comportamiento.Caminando) {
            this.mefComportamiento.estadoActual.actualizarDestino(destino)
        } else {
            this.mefComportamiento.cambiarEstado('caminando', destino)
        }
    }

    actualizar(datos) {
        this.historialPosiciones.push({
            x: this.contenedor.x,
            y: this.contenedor.y
        })

        if (this.historialPosiciones.length > 15) {
            this.historialPosiciones.shift()
        }
        this.banderita.actualizar(this.contenedor)
        this.mefComportamiento.actualizar(datos)
        this.mefAnimacion.actualizar(datos)
    }

    async cambiarSkin(rutaSpritesheet) {
        const sheet = PIXI.Assets.get(rutaSpritesheet)

        const animacionesDesdeTag = {}
        for (const tag of sheet.data.meta.frameTags) {
            const frames = []
            for (let i = tag.from; i <= tag.to; i++) {
                frames.push(sheet.textures[`shiro_${tag.name}_${i - tag.from}.ase`])
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

        this.texturaEspera = this.animaciones.sentado[0]
        this.skinActual = rutaSpritesheet
    }

    async restaurarSkinDefault() {
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
            dormido:    animacionesDesdeTag['dormido'],
        }

        this.texturaEspera = this.animaciones.sentado[0]
        this.skinActual = 'default'
    }
}