import * as PIXI from '../pixi.js';
import { catálogoObjetos } from '../datos.js';
import { diseño } from './diseno.js';

export function realizarTrueque(npc, inventarioInstancia) {
    const indice = inventarioInstancia.objetosActuales.findIndex(key => key === npc.idObjetoQuePide)
    
    if (indice !== -1) {
        inventarioInstancia.actualizarRanura(indice, npc.idObjetoQueTiene)
        npc.actualizarObjetos()
        console.log("El trueque fue todo un éxito.")
    }
    else {
        console.log("Eso no era lo que el gatito quería...")
    }
}

export class Inventario {
    constructor(app, objetosIniciales) {
        this.app = app
        this.objetosActuales = objetosIniciales

        this.contenedor = new PIXI.Container()

        this.ANCHO_RANURA = 64
        this.ALTO_RANURA = 64
        this.MARGEN = 10
        this.ANCHO_BURBUJA = 120
        this.ALTO_BURBUJA = 35
        this.RADIO_BORDE = 15
        this.TAMAÑO_FUENTE_BURBUJA = 14
        this.TAMAÑO_FUENTE_ICONO = 35
        this.PADDING_ICONO = 6
        this.OFFSET_BURBUJA = 45
        this.CANTIDAD_RANURAS = 3

        this.posXInventarioInicial = (diseño.ancho - ((this.ANCHO_RANURA * this.CANTIDAD_RANURAS) + (this.MARGEN * 2))) / 2

            //Burbuja
        this.burbuja = new PIXI.Container()
        this.burbuja.visible = false

        this. fondoBurbuja = new PIXI.Graphics()
        this.fondoBurbuja.roundRect(0, 0, this.ANCHO_BURBUJA, this.ALTO_BURBUJA, 10)
        this.fondoBurbuja.fill({
            color: 0x000000,
            alpha: 0.8
        })

        this.textoBurbuja = new PIXI.Text ({ 
            text: '',
            style: {
                fontSize: this.TAMAÑO_FUENTE_BURBUJA,
                fill: '#ffffff'
            },
            anchor: 0.5
        })
        this.textoBurbuja.x = this.ANCHO_BURBUJA / 2
        this.textoBurbuja.y = this.ALTO_BURBUJA / 2

        this.burbuja.addChild(this.fondoBurbuja)
        this.burbuja.addChild(this.textoBurbuja)
        this.contenedor.addChild(this.burbuja)

        this.iconos = []
        this.patitaIzquierda = null
        this.patitaDerecha = null

        this.inicializar()
    }

    inicializar() {
        this.ranuras = []

        for (let i = 0; i < this.CANTIDAD_RANURAS; i++) {
            let posX = this.posXInventarioInicial + (this.ANCHO_RANURA + this.MARGEN) * i
            
            const objetoActual = catálogoObjetos[this.objetosActuales[i]]

            const ranura = new PIXI.Container()
            ranura.hitArea = new PIXI.Rectangle(0, 0, this.ANCHO_RANURA, this.ALTO_RANURA)

            const texturaPanel = PIXI.Assets.get('recursos/sprites/panel.png')
            const fondoRanura = new PIXI.Sprite(texturaPanel)
            fondoRanura.width = this.ANCHO_RANURA
            fondoRanura.height = this.ALTO_RANURA
            
            ranura.eventMode = 'static'
            ranura.on('pointerover', () => {
                this.textoBurbuja.text = this.iconos[i].objetoReferencia.nombre

                const nuevoAncho = this.textoBurbuja.width + this.MARGEN * 2
                const nuevoAlto = this.textoBurbuja.height + this.MARGEN * 2
                
                this.fondoBurbuja.clear()
                this.fondoBurbuja.roundRect(0, 0, nuevoAncho, nuevoAlto, 10)
                this.fondoBurbuja.fill({
                    color: 0x000000,
                    alpha: 0.7
                })
                
                this.textoBurbuja.x = nuevoAncho / 2
                this.textoBurbuja.y = nuevoAlto / 2
                
                this.burbuja.x = Math.round(ranura.x + ((this.ANCHO_RANURA - this.burbuja.width) / 2))
                this.burbuja.y = ranura.y - this.OFFSET_BURBUJA
                
                this.burbuja.visible = true
            })
            ranura.on('pointerout', () => {
                this.burbuja.visible = false
            })
            
            const icono = objetoActual.crearSprite()
            icono.objetoReferencia = objetoActual
            this.iconos.push(icono)

            icono.x = (this.ANCHO_RANURA - 36) / 2
            icono.y = (this.ALTO_RANURA - 36) / 2
            
            ranura.addChild(fondoRanura)
            ranura.addChild(icono)
            
            this.contenedor.addChild(ranura)
            this.ranuras.push(ranura)
        }
        const texturaPatita = PIXI.Assets.get('recursos/sprites/patita_prota.png')
        this.patitaIzquierda = new PIXI.Sprite(texturaPatita)
        this.patitaIzquierda.x = this.ranuras[0].x - this.patitaIzquierda.width - this.MARGEN
        this.patitaIzquierda.y = this.ranuras[0].y

        this.patitaDerecha = new PIXI.Sprite(texturaPatita)
        this.patitaDerecha.x = this.ranuras[2].x + this.ranuras[2].width + this.MARGEN
        this.patitaDerecha.y = this.ranuras[2].y
        this.contenedor.addChild(this.patitaIzquierda)
        this.contenedor.addChild(this.patitaDerecha)
    }

    redimensionar() {
        const anchoEfectivo = diseño.ancho
        const altoEfectivo = diseño.alto

        const posX = (anchoEfectivo - ((this.ANCHO_RANURA * this.CANTIDAD_RANURAS) + (this.MARGEN * 2))) / 2
        const posY = altoEfectivo - this.MARGEN - this.ALTO_RANURA

        for (let i = 0; i < this.CANTIDAD_RANURAS; i++) {
            this.ranuras[i].x = posX + (this.ANCHO_RANURA + this.MARGEN) * i
            this.ranuras[i].y = posY
        }

        if (this.patitaIzquierda && this.patitaDerecha) {
            this.patitaIzquierda.x = this.ranuras[0].x - this.patitaIzquierda.width - this.MARGEN
            this.patitaIzquierda.y = this.ranuras[0].y
            this.patitaDerecha.x = this.ranuras[2].x + this.ranuras[2].width + this.MARGEN
            this.patitaDerecha.y = this.ranuras[2].y
        }

        
    }

    actualizarRanura(indice, nuevoKey) {
        this.objetosActuales[indice] = nuevoKey
        const nuevoObjeto = catálogoObjetos[nuevoKey]
        const nuevoSprite = nuevoObjeto.crearSprite()
        nuevoSprite.objetoReferencia = nuevoObjeto
        
        const ranura = this.ranuras[indice]
        const viejoIcono = this.iconos[indice]
        ranura.removeChild(viejoIcono)
        ranura.addChild(nuevoSprite)
        
        nuevoSprite.x = (this.ANCHO_RANURA - 36) / 2
        nuevoSprite.y = (this.ALTO_RANURA - 36) / 2
        
        this.iconos[indice] = nuevoSprite
    }
}