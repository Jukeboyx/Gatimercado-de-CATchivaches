import * as PIXI from '../pixi.js';

import { Estado } from "../MEF.js";

export class Espera extends Estado {
    alEntrar() {
        this.dueño.imagen.textures = this.dueño.animaciones.espera
        this.dueño.imagen.play()
    }
}

export class Caminando extends Estado {
    alEntrar(destino) {
        this.destino = destino

        const dx = destino.x - this.dueño.container.x
        const dy = destino.y - this.dueño.container.y

        if (Math.abs(dx) > Math.abs(dy)) {
            this.dueño.imagen.textures = this.dueño.animaciones.lado
            this.dueño.imagen.scale.x = dx < 0 ? -1 : 1
        } else {
            this.dueño.imagen.textures = dy < 0
            ? this.dueño.animaciones.arriba
            : this.dueño.animaciones.abajo
        }
        this.dueño.imagen.play()
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
