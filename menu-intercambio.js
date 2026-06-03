import * as PIXI from './pixi.js';

import { realizarTrueque } from './inventario.js';
import { cortarFrames } from './Jugador/index.js';
import { catálogoObjetos } from './datos.js';

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

        this.TAMAÑO_BOTON = 40
        this.COLOR_FONDO = 0x333333

        this.contenedor = new PIXI.Container()
        this.contenedor.visible = false

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
        this.contenedor.addChild(this.objetoJugador)

        //Objeto que el NPC tiene
        this.objetoNPC = new PIXI.Text({
            text: '',
            style: { fontSize: this.TAMAÑO_EMOJI_OBJETO, padding: this.MARGEN_EMOJI }
        })
        this.objetoNPC.anchor.set(0.5)
        this.objetoNPC.x = this.ANCHO * 0.75
        this.objetoNPC.y = 150
        this.contenedor.addChild(this.objetoNPC)

        //Sprite jugador
        const texturaEsperaJugador = PIXI.Assets.get('Recursos/Sprites/JugadorEspera.png')
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

        this.bordeBoton = new PIXI.Graphics()
        this.contenedor.addChild(this.bordeBoton)
        this.contenedor.addChild(this.boton)

        this.boton.on('pointerover', () => {
            this.bordeBoton.clear()
            this.bordeBoton.roundRect(
                this.boton.x - this.TAMAÑO_BOTON * 0.5,
                this.boton.y - this.TAMAÑO_BOTON * 0.5,
                this.TAMAÑO_BOTON,
                this.TAMAÑO_BOTON,
                6
            )
            this.bordeBoton.stroke({ width: 2, color: 0xffffff, alpha: 0.8 })
        })

        this.boton.on('pointerout', () => {
            this.bordeBoton.clear()
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
        this.objetoNPC.text = catálogoObjetos[npc.idObjetoQueTiene].emoji

        npc.jugador.mef.cambiarEstado('intercambio')

        this.contenedor.x = (this.app.screen.width - this.ANCHO) / 2
        this.contenedor.y = (this.app.screen.height - this.ALTO) / 2
        this.contenedor.visible = true
    }

    cerrar() {
        this.npc.jugador.entidadObjetivo = null
        this.npc.jugador.mef.cambiarEstado('espera')
        this.npc.mef.cambiarEstado('espera')
        this.npc = null
        this.contenedor.visible = false
    }

    get visible() {
        return this.contenedor.visible
    }

    actualizar() {
        this.contenedor.x = (this.app.screen.width - this.ANCHO) / 2
        this.contenedor.y = (this.app.screen.height - this.ALTO) / 2
    }
}