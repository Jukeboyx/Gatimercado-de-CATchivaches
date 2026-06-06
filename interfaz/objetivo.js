import * as PIXI from "../pixi.js"

export class Objetivo {
    constructor(objetivo) {
        const ANCHO_CUADRO = 80
        const MARGEN = 10
        const ANCHO_BURBUJA = 150

        
        this.contenedor = new PIXI.Container()
        
        this.cuadro = new PIXI.Graphics()
        this.cuadro.roundRect(0, 0, ANCHO_CUADRO, ANCHO_CUADRO, 10)
        this.cuadro.fill({
            color: '#333333',
            alpha: 0.8
        })
        this.cuadro.eventMode = 'static'

        this.icono = new PIXI.Text ({ 
            text: objetivo.emoji,
            style: {
                fontSize: 45,
                padding: 12
            },
        })
        //this.icono.anchor.set(0.5)
        this.icono.x = (ANCHO_CUADRO - this.icono.width) / 2
        this.icono.y = (ANCHO_CUADRO - this.icono.height) / 2

        this.estrella = new PIXI.Text ({
            text: '⭐',
            style: {
                fontSize: 15,
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
                fill: '#ffffff',
                wordWrap: true,
                wordWrapWidth: ANCHO_BURBUJA
            }
        })
        
        this.fondoBurbuja = new PIXI.Graphics()
        this.textoBurbuja.x = MARGEN
        this.textoBurbuja.y = MARGEN
        
        this.cuadro.on('pointerover', () => {
            this.burbuja.visible = true
        })

        this.cuadro.on('pointerout', () => {
            this.burbuja.visible = false
        })

        this.burbuja.addChild(this.fondoBurbuja)
        this.burbuja.addChild(this.textoBurbuja)

        this.contenedor.addChild(this.cuadro)
        this.contenedor.addChild(this.icono)
        this.contenedor.addChild(this.estrella)
        this.contenedor.addChild(this.burbuja)
        
        const anchoBurbuja = ANCHO_BURBUJA + MARGEN * 2
        const altoBurbuja = this.textoBurbuja.height + MARGEN * 2

        this.fondoBurbuja.clear()
        this.fondoBurbuja.roundRect(0, 0, anchoBurbuja, altoBurbuja, 10)
        this.fondoBurbuja.fill({ color: '#333333', alpha: 0.8 })

        this.burbuja.x = ANCHO_CUADRO - anchoBurbuja
        this.burbuja.y = ANCHO_CUADRO + MARGEN
    }
}