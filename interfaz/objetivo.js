import * as PIXI from "../pixi.js"

export class Objetivo {
    constructor(objetivo) {
        const ANCHO_CUADRO = 80
        const MARGEN = 10
        
        this.contenedor = new PIXI.Container()
        this.contenedor.eventMode = 'static'
        this.contenedor.on('pointertap', (e) => {
            e.stopPropagation()
        })
        
        this.cuadro = new PIXI.Graphics()
        this.cuadro.roundRect(0, 0, ANCHO_CUADRO, ANCHO_CUADRO, 10)
        this.cuadro.fill({
            color: '#FFA500',
            alpha: 0.6
        })

        this.icono = new PIXI.Text ({ 
            text: objetivo.emoji,
            style: {
                fontSize: 45,
                padding: 12
            },
        })
        this.icono.x = (ANCHO_CUADRO - this.icono.width) / 2
        this.icono.y = (ANCHO_CUADRO - this.icono.height) / 2

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

        this.cuadroContenedor = new PIXI.Container()
        this.cuadroContenedor.addChild(this.cuadro)
        this.cuadroContenedor.addChild(this.icono)
        this.cuadroContenedor.addChild(this.estrella)

        this.contenedor.addChild(this.cuadroContenedor)
        this.contenedor.addChild(this.burbuja)
        
    }

    redimensionar() {
        const MARGEN = 10
        const ANCHO_CUADRO = 80
        const ANCHO_TEMPORIZADOR = 80

        this.contenedor.x = window.innerWidth - ANCHO_TEMPORIZADOR - MARGEN - ANCHO_CUADRO - MARGEN
        this.contenedor.y = MARGEN
    }
}