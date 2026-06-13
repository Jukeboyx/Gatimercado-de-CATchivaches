import * as PIXI from './pixi.js';

export class MEF {

    //Máquina de Estados Finitos

    constructor(dueño, estados) {
        this.dueño = dueño
        this.estados = estados
        this.estadoActual = null
    }

    cambiarEstado(nombre, datos) {
    const nuevoEstado = this.estados[nombre]

    //console.log('[MEF]', this.estadoActual?.constructor?.name, '->', nuevoEstado?.constructor?.name)

    if (this.estadoActual === nuevoEstado) {
        return
    }

    if (this.estadoActual) {
        this.estadoActual.alSalir()
    }

    this.estadoActual = nuevoEstado
    this.estadoActual.alEntrar(datos)
}

    actualizar(datos) {
        if (this.estadoActual) {
            this.estadoActual.alActualizar(datos)
            this.estadoActual.hacerChequeos()
        }
    }
}

export class Estado {
    constructor(dueño) { this.dueño = dueño }
    alEntrar() {}
    alActualizar() {}
    alSalir() {}
    hacerChequeos() {}
}