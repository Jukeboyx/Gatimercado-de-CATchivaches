import * as PIXI from '../pixi.js';

import { realizarTrueque } from './inventario.js';
import { cortarFrames } from '../herramientas-funciones.js';
import { catálogoObjetos } from '../datos.js';

export class MenuIntercambio {
    constructor(app, inventario) {
        this.app = app
        this.inventario = inventario
        this.npc = null

        this.ANCHO = 420
        this.ALTO = 240
        this.RADIO_BORDE = 50

        this.ESCALA_SPRITE = 3

        this.TAMAÑO_EMOJI_OBJETO = 60
        this.MARGEN_EMOJI = 6
        this.ANCHO_BURBUJA_INFORMACIÓN = 120
        this.ALTO_BURBUJA_INFORMACIÓN = 35
        this.TAMAÑO_FUENTE_INFORMACIÓN = 14
        this.OFFSET_BURBUJA_INFORMACIÓN = 10

        this.TAMAÑO_BOTON = 50
        this.COLOR_FONDO = 0x333333

        this.burbuja = new PIXI.Container()
        this.burbuja.visible = false

        this.fondoBurbuja = new PIXI.Graphics()
        this.fondoBurbuja.roundRect(0, 0, this.ANCHO_BURBUJA_INFORMACIÓN, this.ALTO_BURBUJA_INFORMACIÓN, 10)
        this.fondoBurbuja.fill({
            color: this.COLOR_FONDO,
            alpha: 0.8
        })

        this.textoBurbuja = new PIXI.Text ({ 
            text: '',
            style: {
                fontSize: this.TAMAÑO_FUENTE_INFORMACIÓN,
                fill: '#ffffff'
            },
        })
        this.textoBurbuja.anchor.set(0.5)
        this.textoBurbuja.position.set(0, 0)

        this.contenedor = new PIXI.Container()
        this.contenedor.visible = false
        
        this.burbuja.addChild(this.fondoBurbuja)
        this.burbuja.addChild(this.textoBurbuja)
        this.contenedor.addChild(this.burbuja)

        this.fondo = new PIXI.Graphics()
        this.fondo.roundRect(0, 0, this.ANCHO, this.ALTO, this.RADIO_BORDE)
        this.fondo.fill({ color: this.COLOR_FONDO, alpha: 0.8 })
        this.contenedor.addChild(this.fondo)
        
        //Objeto que el NPC quiere
        this.ranuraJugador = new PIXI.Container()
        this.ranuraJugador.x = this.ANCHO * 0.25
        this.ranuraJugador.y = this.ALTO * 0.75
        this.ranuraJugador.eventMode = 'static'
        this.contenedor.addChild(this.ranuraJugador)
        
        this.objetoJugador = new PIXI.Text({
            text: '',
            style: { fontSize: this.TAMAÑO_EMOJI_OBJETO, padding: this.MARGEN_EMOJI }
        })
        this.objetoJugador.anchor.set(0.5)
        this.ranuraJugador.addChild(this.objetoJugador)

        this.ranuraJugador.on('pointerover', () => {
            this.textoBurbuja.text = this.infoJugador

            const nuevoAncho = this.textoBurbuja.width + 10 * 2
            const nuevoAlto = this.textoBurbuja.height + 10 * 2
            
            this.fondoBurbuja.clear()
            this.fondoBurbuja.roundRect(-nuevoAncho / 2, 0, nuevoAncho, nuevoAlto, 10)
            this.fondoBurbuja.fill({
                color: 0x000000,
                alpha: 0.7
            })

            this.textoBurbuja.position.set(0, nuevoAlto / 2)
            
            this.burbuja.x = this.ANCHO * 0.25
            this.burbuja.y = this.ALTO + this.OFFSET_BURBUJA_INFORMACIÓN
            
            this.burbuja.visible = true
        })

        this.ranuraJugador.on('pointerout', () => {
            this.burbuja.visible = false
        })

        //Objeto que el NPC tiene
        this.ranuraNPC = new PIXI.Container()
        this.ranuraNPC.x = this.ANCHO * 0.75
        this.ranuraNPC.y = this.ALTO * 0.75
        this.ranuraNPC.eventMode = 'static'
        this.contenedor.addChild(this.ranuraNPC)
        
        this.objetoNPC = new PIXI.Text({
            text: '',
            style: { fontSize: this.TAMAÑO_EMOJI_OBJETO, padding: this.MARGEN_EMOJI }
        })
        this.objetoNPC.anchor.set(0.5)
        this.ranuraNPC.addChild(this.objetoNPC)

        this.ranuraNPC.on('pointerover', () => {
            this.textoBurbuja.text = this.infoNPC

            const nuevoAncho = this.textoBurbuja.width + 10 * 2
            const nuevoAlto = this.textoBurbuja.height + 10 * 2
            
            this.fondoBurbuja.clear()
            this.fondoBurbuja.roundRect(-nuevoAncho / 2, 0, nuevoAncho, nuevoAlto, 10)
            this.fondoBurbuja.fill({
                color: 0x000000,
                alpha: 0.7
            })

            this.textoBurbuja.position.set(0, nuevoAlto / 2)
            
            this.burbuja.x = this.ANCHO * 0.75
            this.burbuja.y = this.ALTO + this.OFFSET_BURBUJA_INFORMACIÓN
            
            this.burbuja.visible = true
        })

        this.ranuraNPC.on('pointerout', () => {
            this.burbuja.visible = false
        })

        //Sprite jugador
        this.spriteJugador = new PIXI.Sprite()
        this.spriteJugador.anchor.set(0.5)
        this.spriteJugador.scale.set(this.ESCALA_SPRITE)
        this.spriteJugador.position.set(
            this.objetoJugador.x,
            this.ALTO * 0.25
        )
        this.contenedor.addChild(this.spriteJugador)

        //Sprite NPC
        this.spriteGatiNPC = new PIXI.Sprite()
        this.spriteGatiNPC.anchor.set(0.5)
        this.spriteGatiNPC.scale.set(this.ESCALA_SPRITE)
        this.spriteGatiNPC.position.set(
            this.objetoNPC.x,
            this.ALTO * 0.25
        )
        this.contenedor.addChild(this.spriteGatiNPC)
        
        //Botón de intercambio
        this.boton = new PIXI.Text({
            text: '🔄',
            style: { fontSize: this.TAMAÑO_BOTON, padding: this.MARGEN_EMOJI }
        })
        this.boton.anchor.set(0.5)
        this.boton.x = this.ANCHO * 0.5
        this.boton.y = this.ALTO * 0.5
        this.boton.eventMode = 'static'
        this.boton.cursor = 'pointer'

        this.contenedor.addChild(this.boton)

        this.boton.on('pointerover', () => {
            this.boton.scale.set(0.9)
            this.boton.alpha = 0.8
        })

        this.boton.on('pointerout', () => {
            this.boton.scale.set(1)
            this.boton.alpha = 1
        })

        this.boton.on('pointertap', (e) => {
            e.stopPropagation()

            if (this.npc) {
                realizarTrueque(this.npc, this.inventario)
                this.cerrar()
            } else {
                console.warn("Ojo q no hay npc con el cual interactuar")
            }
        })
    }

    abrir(npc) {
        this.npc = npc

        this.spriteGatiNPC.texture = this.npc.texturaEspera

        const objetoJugador = catálogoObjetos[npc.idObjetoQuePide]
        const objetoNPC = catálogoObjetos[npc.idObjetoQueTiene]
        
        const spriteJugador = objetoJugador.crearSprite()
        const spriteNPC = objetoNPC.crearSprite()
        
        // Reemplazar los textos con sprites
        this.ranuraJugador.removeChild(this.objetoJugador)
        this.ranuraNPC.removeChild(this.objetoNPC)
        
        this.ranuraJugador.addChild(spriteJugador)
        this.ranuraNPC.addChild(spriteNPC)
        
        spriteJugador.anchor.set(0.5)
        spriteNPC.anchor.set(0.5)
        spriteJugador.scale.set(1.2)
        spriteNPC.scale.set(1.2)
        
        this.objetoJugador = spriteJugador
        this.objetoNPC = spriteNPC
        
        this.infoJugador = objetoJugador.nombre
        this.infoNPC = objetoNPC.nombre

        this.contenedor.x = (this.app.screen.width - this.ANCHO) / 2
        this.contenedor.y = (this.app.screen.height - this.ALTO) / 2
        this.contenedor.visible = true
    }

    cerrar() {
        if (this.npc.alCerrarIntercambio) this.npc.alCerrarIntercambio()
        this.npc = null
        this.contenedor.visible = false
    }

    get visible() {
        return this.contenedor.visible
    }

    redimensionar() {
        this.contenedor.x = (this.app.screen.width - this.ANCHO) / 2
        this.contenedor.y = (this.app.screen.height - this.ALTO) / 2
    }
}