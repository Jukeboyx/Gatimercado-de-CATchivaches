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

        this.TAMAÑO_SPRITE = 60

        this.TAMAÑO_EMOJI_OBJETO = 60
        this.TAMAÑO_EMOJI_NPC = 36
        this.MARGEN_EMOJI = 6

        this.TAMAÑO_BOTON = 40
        this.COLOR_FONDO = 0x333333

        this.contenedor = new PIXI.Container()
        this.contenedor.visible = false

        this.fondo = new PIXI.Graphics()
        this.fondo.roundRect(0, 0, this.ANCHO, this.ALTO, this.RADIO_BORDE)
        this.fondo.fill({ color: this.COLOR_FONDO, alpha: 0.8 })
        this.contenedor.addChild(this.fondo)

        //Sprite jugador
        const texturaEspera = PIXI.Texture.from('Recursos/Sprites/JugadorEspera.png')
        const frames = cortarFrames(texturaEspera, 4, 64)
        this.spriteJugador = new PIXI.Sprite(frames[0])
        this.spriteJugador.anchor.set(0.5)
        this.spriteJugador.width = this.TAMAÑO_SPRITE
        this.spriteJugador.height = this.TAMAÑO_SPRITE
        this.spriteJugador.x = this.ANCHO * 0.25
        this.spriteJugador.y = 60
        this.contenedor.addChild(this.spriteJugador)

        //Sprite NPC
        //Reemplazar por sprite del NPC de turno
        this.emojiNPC = new PIXI.Text({
            text: '😺',
            style: { fontSize: this.TAMAÑO_EMOJI_NPC }
        })
        this.emojiNPC.anchor.set(0.5)
        this.emojiNPC.x = this.ANCHO * 0.75
        this.emojiNPC.y = 60
        this.contenedor.addChild(this.emojiNPC)

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
            realizarTrueque(this.npc, this.inventario)
            this.cerrar()
        })
    }

    abrir(npc) {
        this.npc = npc
        this.objetoJugador.text = catálogoObjetos[npc.idObjetoQuePide].emoji
        this.objetoNPC.text = catálogoObjetos[npc.idObjetoQueTiene].emoji

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