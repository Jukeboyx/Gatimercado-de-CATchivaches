import * as PIXI from "../pixi.js"


export class Temporizador {
    constructor(app, tiempoEnSegundos) {
        this.app = app
        this.tiempoRestante = tiempoEnSegundos
        this.activo = true

        this.MARGEN = 10
        this.ANCHO = 80

        this.contenedor = new PIXI.Container()

        this.fondo = new PIXI.Graphics()
        this.fondo.roundRect(0, 0, this.ANCHO, this.ANCHO, 10)
        this.fondo.fill({ color: '#333333', alpha: 0.8 })

        this.texto = new PIXI.Text({
            text: this.formatear(tiempoEnSegundos),
            style: {
                fontSize: 20,
                fill: '#ffffff',
                fontWeight: 'bold'
            }
        })
        this.texto.anchor.set(0.5)
        this.texto.x = this.ANCHO / 2
        this.texto.y = this.ANCHO / 2

        this.contenedor.x = window.innerWidth - this.ANCHO - this.MARGEN
        this.contenedor.y = this.MARGEN

        this.contenedor.addChild(this.fondo)
        this.contenedor.addChild(this.texto)
    }

    formatear(tiempoEnSegundos) {
        const minutos = Math.floor(tiempoEnSegundos / 60)
        const segundos = Math.floor(tiempoEnSegundos % 60)
        return `${minutos}:${segundos.toString().padStart(2, '0')}`
    }

    actualizar(delta) {
        if (!this.activo) return
        
        this.tiempoRestante -= delta / 60
        
        if (this.tiempoRestante <= 0) {
            this.tiempoRestante = 0
            this.activo = false
            console.log("Perdiste")
        }

        this.texto.text = this.formatear(this.tiempoRestante)
    }

    redimensionar() {
        this.contenedor.x = window.innerWidth - this.ANCHO - this.MARGEN
    }
}