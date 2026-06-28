import * as PIXI from "../pixi.js"

export class Objetivo {
    constructor(objetivo, tiempoInicial) {
        const ANCHO_CUADRO = 58
        const MARGEN = 10
        
        this.contenedor = new PIXI.Container()
        this.contenedor.eventMode = 'static'
        this.contenedor.on('pointertap', (e) => {
            e.stopPropagation()
        })
        
        // Usar la imagen tiempo_objeto.png como fondo
        const texturaFondo = PIXI.Assets.get('recursos/sprites/tiempo_objeto.png')
        this.fondo = new PIXI.Sprite(texturaFondo)
        
        this.icono = objetivo.crearSprite()
        this.icono.x = 54 // Centro exacto de la imagen 108x108
        this.icono.y = 36
        this.icono.anchor.set(0.5)

        this.estrella = new PIXI.Text ({
            text: '⭐',
            style: {
                fontSize: 18,
                padding: 6
            }
        })
        this.estrella.anchor.set(0.5)
        this.estrella.x = ANCHO_CUADRO * 0.90
        this.estrella.y = MARGEN * 2
        
        // Texto del tiempo en posición (41, 94)
        this.tiempoTexto = new PIXI.Text({
            text: this.formatearTiempo(tiempoInicial),
            style: {
                fontSize: 16,
                fill: '#000000',
                fontWeight: 'bold'
            }
        })
        this.tiempoTexto.x = 50 // Movido un poco a la derecha
        this.tiempoTexto.y = 94
        this.tiempoTexto.anchor.set(0.5)
        
        this.contenedor.x = window.innerWidth - ANCHO_CUADRO - MARGEN
        this.contenedor.y = MARGEN

        this.burbuja = new PIXI.Container()
        this.burbuja.visible = false

        this.textoBurbuja = new PIXI.Text ({ 
            text: objetivo.nombre,
            style: {
                fontSize: 14,
                fill: '#ffffff'
            }
        })
        
        const anchoBurbuja = this.textoBurbuja.width + MARGEN * 2
        const altoBurbuja = this.textoBurbuja.height + MARGEN * 2

        this.burbuja.x = (ANCHO_CUADRO - anchoBurbuja) / 2
        this.burbuja.y = ANCHO_CUADRO + MARGEN
        
        this.fondoBurbuja = new PIXI.Graphics()
        this.fondoBurbuja.roundRect(0, 0, anchoBurbuja, altoBurbuja, 10)
        this.fondoBurbuja.fill({ color: '#333333', alpha: 0.8 })

        this.textoBurbuja.x = MARGEN
        this.textoBurbuja.y = MARGEN
        
        this.contenedor.on('pointerover', () => {
            this.burbuja.visible = true
        })

        this.contenedor.on('pointerout', () => {
            this.burbuja.visible = false
        })

        this.burbuja.addChild(this.fondoBurbuja)
        this.burbuja.addChild(this.textoBurbuja)

        this.contenedor.addChild(this.fondo)
        this.contenedor.addChild(this.icono)
        this.contenedor.addChild(this.estrella)
        this.contenedor.addChild(this.tiempoTexto)
        this.contenedor.addChild(this.burbuja)
    }

    formatearTiempo(segundos) {
        const minutos = Math.floor(segundos / 60)
        const segs = segundos % 60
        return `${minutos}:${segs.toString().padStart(2, '0')}`
    }

    actualizarTiempo(segundos) {
        this.tiempoTexto.text = this.formatearTiempo(segundos)
    }

    redimensionar() {
        const MARGEN = 10
        const ANCHO_CUADRO = 108

        this.contenedor.x = window.innerWidth - ANCHO_CUADRO - MARGEN
        this.contenedor.y = MARGEN
    }
}