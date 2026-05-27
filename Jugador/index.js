import * as PIXI from '../pixi.js';

import { MEF } from "../MEF.js"
import * as estado from "./estados.js"

function cortarFrames(imagen, cantidadDeFrames, anchoFrame) {
    const frames = []
    for (let i = 0; i < cantidadDeFrames; i++) {
        frames.push(new PIXI.Texture({
            source: imagen.source,
            frame: new PIXI.Rectangle(i * anchoFrame, 0, anchoFrame, anchoFrame)
        }))
    }
    return frames
}


export class Jugador {
    constructor(app, ANCHO_MUNDO = 2000, ALTO_MUNDO = 2000) {
        this.app = app
        this.ANCHO_MUNDO = ANCHO_MUNDO
        this.ALTO_MUNDO = ALTO_MUNDO

        const texturaDeLado = PIXI.Texture.from('Recursos/Sprites/JugadorDeLado.png')
        const texturaArriba = PIXI.Texture.from('Recursos/Sprites/JugadorArriba.png')
        const texturaAbajo  = PIXI.Texture.from('Recursos/Sprites/JugadorAbajo.png')
        const texturaEspera = PIXI.Texture.from('Recursos/Sprites/JugadorEspera.png')

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

        //this.framesCaminando = cortarFrames(frames, 4, 64)

        this.contenedor = new PIXI.Container()
        this.contenedor.addChild(this.imagen)

        this.contenedor.x = app.screen.width / 2
        this.contenedor.y = app.screen.height / 2

        this.mef = new MEF(this, {
            espera: new estado.Espera(this),
            caminando: new estado.Caminando(this),
            intercambio: new estado.Intercambio(this)
        })

        this.mef.cambiarEstado('espera')
    }

    irHacia(punto, distanciaFreno) {
        this.mef.cambiarEstado('caminando', {
            x: punto.x,
            y: punto.y,
            distanciaFreno: distanciaFreno
        })
    }

    actualizar(datos) {
        this.mef.actualizar(datos)
    }
}