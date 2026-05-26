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
        const nuevoObjeto = catálogoObjetos[npc.idObjetoQueTiene]
        inventarioInstancia.actualizarRanura(indice, nuevoObjeto)
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

        this.anchoRanura = 60
        this.altoRanura = 60
        this.margen = 10

        this.posXInventarioInicial = (this.app.screen.width - ((this.anchoRanura * 3) + (this.margen * 2))) / 2

            //Burbuja
        this.burbuja = new PIXI.Container()
        this.burbuja.visible = false

        this. fondoBurbuja = new PIXI.Graphics()
        this.fondoBurbuja.roundRect(0, 0, 120, 35, 8)
        this.fondoBurbuja.fill({
            color: 0x000000,
            alpha: 0.8
        })

        this.textoBurbuja = new PIXI.Text ({ 
            text: '',
            style: {
                fontSize: 14,
                fill: '#ffffff'
            },
            anchor: 0.5
        })
        this.textoBurbuja.x = 120 / 2
        this.textoBurbuja.y = 35 / 2

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
        this.posYInventarioInicial = (this.app.screen.height - this.margen - this.altoRanura)
        this.ranuras = []

        for (let i = 0; i < 3; i++) {
            let posX = this.posXInventarioInicial + (this.anchoRanura + this.margen) * i
            
            const objetoActual = this.objetosActuales[i]

            const ranura = new PIXI.Container()
            ranura.x = posX
            ranura.y = this.posYInventarioInicial

            const fondoRanura = new PIXI.Graphics()
            fondoRanura.roundRect(0, 0, this.anchoRanura, this.altoRanura, 8)
            fondoRanura.fill({
                color: 0x333333,
                alpha: 0.8
            })
            
            ranura.eventMode = 'static'
            ranura.on('pointerover', () => {
                this.textoBurbuja.text = this.iconos[i].objetoReferencia.nombre

                const nuevoAncho = this.textoBurbuja.width + this.margen * 2
                const nuevoAlto = this.textoBurbuja.height + this.margen * 2

                
                this.fondoBurbuja.clear()
                this.fondoBurbuja.roundRect(0, 0, nuevoAncho, nuevoAlto, 8)
                this.fondoBurbuja.fill({
                    color: 0x000000,
                    alpha: 0.7
                })

                this.textoBurbuja.x = nuevoAncho / 2
                this.textoBurbuja.y = nuevoAlto / 2
                
                this.burbuja.x = Math.round(ranura.x + ((this.anchoRanura - this.burbuja.width) / 2))
                this.burbuja.y = ranura.y - 45
                
                this.burbuja.visible = true
            })
            ranura.on('pointerout', () => {
                this.burbuja.visible = false
            })
            
            const icono = new PIXI.Text ({
                text: this.objetosActuales[i].emoji,
                style: {
                    fontSize: 30,
                    padding: 6
                }
            })
            icono.anchor.set(0.5)
            icono.objetoReferencia = objetoActual
            this.iconos.push(icono)

            icono.x = this.anchoRanura / 2
            icono.y = this.altoRanura / 2
            
            ranura.addChild(fondoRanura)
            ranura.addChild(icono)
            
            this.contenedor.addChild(ranura)
            this.ranuras.push(ranura)
        }
    }

    actualizar() {
        const posX = (this.app.screen.width - ((this.anchoRanura * 3) + (this.margen * 2))) / 2
        const posY = this.app.screen.height - this.margen - this.altoRanura

        for (let i = 0; i < 3; i++) {
            this.ranuras[i].x = posX + (this.anchoRanura + this.margen) * i
            this.ranuras[i].y = posY
        }
    }

    actualizarRanura(indice, nuevoObjeto) {
        this.objetosActuales[indice] = nuevoObjeto
        this.iconos[indice].text = nuevoObjeto.emoji
        this.iconos[indice].objetoReferencia = nuevoObjeto
    }
}