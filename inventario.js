import * as PIXI from './pixi.js';

import { catálogoObjetos } from "./datos.js"

export let inventarioGlobal = [
    catálogoObjetos['manzanaRoja'],
    catálogoObjetos['pezFresco'],
    catálogoObjetos['ovilloLana']
]

export function realizarTrueque(npc, inventarioInstancia) {
    const indice = inventarioInstancia.objetosActuales.findIndex(item => item.id === npc.idObjetoQuePide)
    
    if (indice !== -1) {
        const nuevoObjetoDelJugador = catálogoObjetos[npc.idObjetoQueTiene]
        inventarioInstancia.actualizarRanura(indice, nuevoObjetoDelJugador)
        npc.actualizarObjetos()
        console.log("El trueque fue todo un éxito.")
    }
    else {
        console.log("Eso no era lo que el gatito quería...")
    }
}

export class Inventario {
    constructor(app) {
        this.app = app
        this.contenedor = new PIXI.Container()

        this.ANCHO_RANURA = 60
        this.ALTO_RANURA = 60
        this.MARGEN = 10
        this.ANCHO_BURBUJA = 120
        this.ALTO_BURBUJA = 35
        this.RADIO_BORDE = 15
        this.TAMAÑO_FUENTE_BURBUJA = 14
        this.TAMAÑO_FUENTE_ICONO = 35
        this.PADDING_ICONO = 6
        this.OFFSET_BURBUJA = 45
        this.CANTIDAD_RANURAS = 3

        this.posXInventarioInicial = (this.app.screen.width - ((this.ANCHO_RANURA * this.CANTIDAD_RANURAS) + (this.MARGEN * 2))) / 2

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

        this.objetosActuales = [
            catálogoObjetos['manzanaRoja'],
            catálogoObjetos['pezFresco'],
            catálogoObjetos['ovilloLana']
        ]

        this.iconos = []

        this.inicializar()
    }

    inicializar() {
        this.posYInventarioInicial = (this.app.screen.height - this.MARGEN - this.ALTO_RANURA)
        this.ranuras = []

        for (let i = 0; i < this.CANTIDAD_RANURAS; i++) {
            let posX = this.posXInventarioInicial + (this.ANCHO_RANURA + this.MARGEN) * i
            
            const objetoActual = this.objetosActuales[i]

            const ranura = new PIXI.Container()
            ranura.x = posX
            ranura.y = this.posYInventarioInicial

            const fondoRanura = new PIXI.Graphics()
            fondoRanura.roundRect(0, 0, this.ANCHO_RANURA, this.ALTO_RANURA, this.RADIO_BORDE)
            fondoRanura.fill({
                color: 0x333333,
                alpha: 0.8
            })
            
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
            
            const icono = new PIXI.Text ({
                text: this.objetosActuales[i].emoji,
                style: {
                    fontSize: this.TAMAÑO_FUENTE_ICONO,
                    padding: this.PADDING_ICONO
                }
            })
            icono.objetoReferencia = objetoActual
            this.iconos.push(icono)

            icono.x = (this.ANCHO_RANURA - icono.width) / 2
            icono.y = (this.ALTO_RANURA  - icono.height) / 2
            
            ranura.addChild(fondoRanura)
            ranura.addChild(icono)
            
            this.contenedor.addChild(ranura)
            this.ranuras.push(ranura)
        }
    }

    actualizar() {
        const posX = (this.app.screen.width - ((this.ANCHO_RANURA * this.CANTIDAD_RANURAS) + (this.MARGEN * 2))) / 2
        const posY = this.app.screen.height - this.MARGEN - this.ALTO_RANURA

        for (let i = 0; i < this.CANTIDAD_RANURAS; i++) {
            this.ranuras[i].x = posX + (this.ANCHO_RANURA + this.MARGEN) * i
            this.ranuras[i].y = posY
        }
    }

    actualizarRanura(indice, nuevoObjeto) {
        this.objetosActuales[indice] = nuevoObjeto
        this.iconos[indice].text = nuevoObjeto.emoji
        this.iconos[indice].objetoReferencia = nuevoObjeto
    }
}