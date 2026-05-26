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
    constructor(app) {
        this.app = app

        const texturaDeLado = PIXI.Texture.from('Recursos/Sprites/JugadorDeLado.png')
        const texturaArriba = PIXI.Texture.from('Recursos/Sprites/JugadorArriba.png')
        const texturaAbajo  = PIXI.Texture.from('Recursos/Sprites/JugadorAbajo.png')
        const texturaEspera = PIXI.Texture.from('Recursos/Sprites/JugadorEspera.png')

        this.animaciones = {
            lado: cortarFrames(texturaDeLado, 4, 64),
            arriba: cortarFrames(texturaArriba, 4, 64),
            abajo: cortarFrames(texturaAbajo, 4, 64),
            espera: cortarFrames(texturaEspera, 4, 64),
        }

        this.imagen = new PIXI.AnimatedSprite(this.animaciones.espera)
        this.imagen.anchor.set(0.5)
        this.imagen.animationSpeed = 0.1
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