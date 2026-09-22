import * as PIXI from '../pixi.js'
import { diseño } from './diseno.js'

export class Centrador {
    constructor() {
        this.RADIO = 20
        this.MARGEN = 10

        this.contenedor = new PIXI.Container()
        this.contenedor.eventMode = 'static'
        this.contenedor.cursor = 'pointer'

        this.contenedor.on('pointertap', (e) => {
            e.stopPropagation()
            if (this.alTocar) this.alTocar()
        })

        // El código externo (principal.js) engancha acá qué hacer al tocar el botón
        this.alTocar = null

        this.fondo = new PIXI.Graphics()
            .circle(0, 0, this.RADIO)
            .fill({ color: 0x000000, alpha: 0.5 })
        this.contenedor.addChild(this.fondo)

        // Se pisa desde afuera con la textura real del jugador, igual que
        // this.hud.menuIntercambio.spriteJugador.texture en principal.js
        this.spriteJugador = new PIXI.Sprite()
        this.spriteJugador.anchor.set(0.5)
        this.spriteJugador.scale.set(0.8)
        this.contenedor.addChild(this.spriteJugador)

        this.contenedor.hitArea = new PIXI.Circle(0, 0, this.RADIO)

        this.posicionar()
        this.marcarBloqueo(true) // arranca en modo fijado, igual que SistemaCamara.bloqueada
    }

    posicionar() {
        // Esquina inferior derecha, mismo esquema que Objetivo (arriba derecha)
        this.contenedor.x = diseño.ancho - this.RADIO - this.MARGEN
        this.contenedor.y = diseño.alto - this.RADIO - this.MARGEN
    }

    // true = modo fijado al jugador (default), false = modo libre.
    // De momento sólo baja la opacidad; reemplazar por un ícono distinto cuando haya asset.
    marcarBloqueo(bloqueada) {
        this.contenedor.alpha = bloqueada ? 0.5 : 1
    }

    redimensionar() {
        this.posicionar()
    }
}
