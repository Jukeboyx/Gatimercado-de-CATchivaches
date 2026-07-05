import * as PIXI from '../pixi.js'

export class Banderita {
    constructor(mundoContenedor) {
        this.mundoContenedor = mundoContenedor
        this.DISTANCIA_OCULTAR = 35

        this.texto = new PIXI.Text({
            text: '🚩',
            style: {
                fontSize: 30,
                fontFamily: 'Arial'
            }
        })
        this.texto.anchor.set(0.5)
        this.texto.eventMode = 'none'
        this.texto.visible = false

        this.mundoContenedor.addChild(this.texto)
    }

    mostrarEn(centro) {
        this.texto.x = centro.x
        this.texto.y = centro.y
        this.texto.zIndex = centro.y
        this.texto.visible = true
    }

    ocultar() {
        this.texto.visible = false
    }

    actualizar(contenedorJugador) {
        if (!this.texto.visible) return

        const dx = this.texto.x - contenedorJugador.x
        const dy = this.texto.y - contenedorJugador.y
        const distancia = Math.sqrt(dx * dx + dy * dy)

        if (distancia < this.DISTANCIA_OCULTAR) {
            this.ocultar()
        }
    }
}