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
    }
    
    alActualizar(datos) {
        let animaciónNueva
        const velocidad = 4
        const dx = this.destino.x - this.dueño.contenedor.x
        const dy = this.destino.y - this.dueño.contenedor.y
        const distancia = Math.sqrt(dx * dx + dy * dy)

        if (Math.abs(dx) > Math.abs(dy)) {
            animaciónNueva = this.dueño.animaciones.lado
            this.dueño.imagen.scale.x = dx < 0 ? -1 : 1
        } else {
            animaciónNueva = dy < 0
            ? this.dueño.animaciones.arriba
            : this.dueño.animaciones.abajo
        }

        if (this.dueño.imagen.textures !== animaciónNueva) {
            this.dueño.imagen.textures = animaciónNueva
            this.dueño.imagen.play()
        }

        if (distancia < 5) {
            this.dueño.mef.cambiarEstado('espera')
            return
        }

        this.dueño.contenedor.x += (dx / distancia) * velocidad * datos
        this.dueño.contenedor.y += (dy / distancia) * velocidad * datos
    }
}

export class Intercambio extends Estado {
    //bloquear movimiento
}
