import * as PIXI from "../pixi.js"
import { diseño } from './diseno.js';

export class Objetivo {
    constructor(objetivo) {
        const MARGEN = 10
        
        this.contenedor = new PIXI.Container()
        this.contenedor.eventMode = 'static'
        this.contenedor.on('pointertap', (e) => {
            e.stopPropagation()
        })
        
        const texturaFondo = PIXI.Assets.get('recursos/sprites/objetivo_temporizador.png')
        this.fondo = new PIXI.Sprite(texturaFondo)
        
        this.icono = objetivo.crearSprite()
        this.icono.x = this.fondo.width / 2
        this.icono.y = this.fondo.height * 0.35
        this.icono.anchor.set(0.5)

        this.posicionar()

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

        this.burbuja.x = (this.fondo.width - anchoBurbuja) / 2
        this.burbuja.y = this.fondo.height + MARGEN
        
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
        this.contenedor.addChild(this.burbuja)
    }

    posicionar() {
        const MARGEN = 10

        this.contenedor.x = diseño.ancho - this.fondo.width - MARGEN
        this.contenedor.y = MARGEN
    }

    redimensionar() {
        this.posicionar()
    }
}