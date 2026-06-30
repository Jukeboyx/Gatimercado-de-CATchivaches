import * as PIXI from "../pixi.js"
import { diseño } from './diseno.js';


export class Cronómetro {
    constructor(app, objetivo) {
        this.app = app
        this.objetivo = objetivo
        this.tiempoTranscurrido = 0
        this.activo = true
        this.LIMITE = 5999 // 99:59 minutos

        this.MARGEN = 10
        this.ANCHO = 80

        this.texto = new PIXI.Text({
            text: this.formatear(0),
            style: {
                fontSize: 16,
                fill: '#000000',
                fontWeight: 'bold'
            }
        })
        this.texto.anchor.set(0.5)
        this.texto.x = this.objetivo.fondo.width / 2
        this.texto.y = this.objetivo.fondo.height * 0.9

        this.objetivo.contenedor.addChild(this.texto)
    }

    formatear(tiempoEnSegundos) {
        const minutos = Math.floor(tiempoEnSegundos / 60)
        const segundos = Math.floor(tiempoEnSegundos % 60)
        return `${minutos}:${segundos.toString().padStart(2, '0')}`
    }

    actualizar(delta) {
        if (!this.activo) return
        
        this.tiempoTranscurrido += delta / 60
        
        if (this.tiempoTranscurrido >= this.LIMITE) {
            this.tiempoTranscurrido = this.LIMITE
        }

        this.texto.text = this.formatear(this.tiempoTranscurrido)
    }

}