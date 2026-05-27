import * as PIXI from '../pixi.js';

import { Estado } from "../MEF.js";
import { calcularRuta } from "../pathfinding.js";

export class Espera extends Estado {
    alEntrar() {
        this.dueño.imagen.textures = this.dueño.animaciones.espera
        this.dueño.imagen.play()
    }
}

export class Caminando extends Estado {
    alEntrar(destino) {
        this.destino = destino
        this.indicePunto = 0
        this.VELOCIDAD = 4
        
        // Calcular ruta usando A*
        const ruta = calcularRuta(
            this.dueño.contenedor.x,
            this.dueño.contenedor.y,
            destino.x,
            destino.y,
            this.dueño.ANCHO_MUNDO,
            this.dueño.ALTO_MUNDO
        )
        
        if (ruta && ruta.length > 0) {
            this.camino = ruta
        } else {
            // Si no hay ruta, ir en línea recta (fallback)
            this.camino = [{ x: destino.x, y: destino.y }]
        }
    }
    
    alActualizar(datos) {
        if (!this.camino || this.indicePunto >= this.camino.length) {
            this.dueño.mef.cambiarEstado('espera')
            return
        }
        
        const puntoActual = this.camino[this.indicePunto]
        const esUltimoPunto = this.indicePunto === this.camino.length - 1
        
        let animaciónNueva
        const dx = puntoActual.x - this.dueño.contenedor.x
        const dy = puntoActual.y - this.dueño.contenedor.y
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

        const distanciaFreno = esUltimoPunto ? (this.destino.distanciaFreno || 5) : 2

        if (distancia <= distanciaFreno) {
            if (esUltimoPunto) {
                this.dueño.mef.cambiarEstado('espera')
                return
            } else {
                this.indicePunto++
                return
            }
        }

        this.dueño.contenedor.x += (dx / distancia) * this.VELOCIDAD * datos
        this.dueño.contenedor.y += (dy / distancia) * this.VELOCIDAD * datos
    }
}

export class Intercambio extends Estado {
    //bloquear movimiento
}
