import * as PIXI from '../pixi.js';

import { Estado } from "../MEF.js";

export class Espera extends Estado {

}

export class Caminando extends Estado {
    alEntrar(destino) {
        this.destino = destino
    }
    
    alActualizar(datos) {
        const velocidad = 3
        const dx = this.destino.x - this.dueño.container.x
        const dy = this.destino.y - this.dueño.container.y
        const distancia = Math.sqrt(dx * dx + dy * dy)

        if (distancia < 5) {
            this.dueño.mef.cambiarEstado('espera')
            return
        }

        this.dueño.container.x += (dx / distancia) * velocidad * datos
        this.dueño.container.y += (dy / distancia) * velocidad * datos
    }
}

export class Intercambio extends Estado {
    //bloquear movimiento
}
