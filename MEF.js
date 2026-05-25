import * as PIXI from './pixi.js';

export class MEF {

    //Máquina de Estados Finitos

    constructor(dueño, estados) {
        this.dueño = dueño
        this.estados = estados
        this.estadoActual = null
    }

    cambiarEstado(nombre, datos) {
        if (this.estadoActual) {
            this.estadoActual.alSalir()
        }

        this.estadoActual = this.estados[nombre]
        this.estadoActual.alEntrar(datos)
    }

    actualizar(datos) {
        if (this.estadoActual) this.estadoActual.alActualizar(datos)
    }
}

export class Estado {
    constructor(dueño) { this.dueño = dueño }
    alEntrar() {}
    alActualizar() {}
    alSalir() {}
}