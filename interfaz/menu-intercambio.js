import * as PIXI from '../pixi.js';

import { realizarTrueque } from './inventario.js';
import { cortarFrames } from '../herramientas-funciones.js';
import { catálogoObjetos } from '../datos.js';

export class MenuIntercambio {
    constructor(app, inventario) {
        this.app = app
        this.inventario = inventario
        this.npc = null

        this.ANCHO = 400
        this.ALTO = 220
        this.RADIO_BORDE = 50

        this.TAMAÑO_SPRITE = 70

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
        this.objetoJugador = new PIXI.Text({
            text: '',
            style: { fontSize: this.TAMAÑO_EMOJI_OBJETO, padding: this.MARGEN_EMOJI }
        })
        this.objetoJugador.anchor.set(0.5)
        this.objetoJugador.x = this.ANCHO * 0.25
        this.objetoJugador.y = 150
        this.objetoJugador.eventMode = 'static'
        this.contenedor.addChild(this.objetoJugador)

        this.objetoJugador.on('pointerover', () => {
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
            
            this.burbuja.x = this.objetoJugador.x
            this.burbuja.y = this.ALTO + this.OFFSET_BURBUJA_INFORMACIÓN
            
            this.burbuja.visible = true
        })

        this.objetoJugador.on('pointerout', () => {
            this.burbuja.visible = false
        })

        //Objeto que el NPC tiene
        this.objetoNPC = new PIXI.Text({
            text: '',
            style: { fontSize: this.TAMAÑO_EMOJI_OBJETO, padding: this.MARGEN_EMOJI }
        })
        this.objetoNPC.anchor.set(0.5)
        this.objetoNPC.x = this.ANCHO * 0.75
        this.objetoNPC.y = 150
        this.objetoNPC.eventMode = 'static'
        this.contenedor.addChild(this.objetoNPC)

        this.objetoNPC.on('pointerover', () => {
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
            
            this.burbuja.x = this.objetoNPC.x
            this.burbuja.y = this.ALTO + this.OFFSET_BURBUJA_INFORMACIÓN
            
            this.burbuja.visible = true
        })

        this.objetoNPC.on('pointerout', () => {
            this.burbuja.visible = false
        })

        //Sprite jugador
        const texturaEsperaJugador = PIXI.Assets.get('recursos/sprites/JugadorEspera.png')
        const framesJugador = cortarFrames(texturaEsperaJugador, 4, 64)
        this.spriteJugador = new PIXI.Sprite(framesJugador[0])
        this.spriteJugador.anchor.set(0.5)
        this.spriteJugador.width = this.TAMAÑO_SPRITE
        this.spriteJugador.height = this.TAMAÑO_SPRITE
        this.spriteJugador.position.set(
            this.objetoJugador.x,
            this.objetoJugador.y - (this.TAMAÑO_EMOJI_OBJETO + this.TAMAÑO_EMOJI_OBJETO / 2)
        )
        this.contenedor.addChild(this.spriteJugador)

        //Sprite NPC
        this.spriteGatiNPC = new PIXI.Sprite()
        this.spriteGatiNPC.anchor.set(0.5)
        this.spriteGatiNPC.width = this.TAMAÑO_SPRITE
        this.spriteGatiNPC.height = this.TAMAÑO_SPRITE
        this.spriteGatiNPC.position.set(
            this.objetoNPC.x,
            this.objetoNPC.y - (this.TAMAÑO_EMOJI_OBJETO + this.TAMAÑO_EMOJI_OBJETO / 2)
        )
        this.contenedor.addChild(this.spriteGatiNPC)
        
        //Botón de intercambio
        this.boton = new PIXI.Text({
            text: '🔄',
            style: { fontSize: this.TAMAÑO_BOTON, padding: this.MARGEN_EMOJI }
        })
        this.boton.anchor.set(0.5)
        this.boton.x = this.ANCHO * 0.5
        this.boton.y = 150
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

        console.log(this.npc.texturaEspera)

        const texturaEsperaGatiNPC = this.npc.texturaEspera
        const framesGatiNPC = cortarFrames(texturaEsperaGatiNPC, 4, 64)
        this.spriteGatiNPC.texture = framesGatiNPC[0]

        this.objetoJugador.text = catálogoObjetos[npc.idObjetoQuePide].emoji
        this.infoJugador = catálogoObjetos[npc.idObjetoQuePide].nombre

        this.objetoNPC.text = catálogoObjetos[npc.idObjetoQueTiene].emoji
        this.infoNPC = catálogoObjetos[npc.idObjetoQueTiene].nombre

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