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

            if (this.camino.length > 1) {
                this.indicePunto = 1
            }

        } else {
            // Si no hay ruta, ir en línea recta (fallback)
            this.camino = [{ x: destino.x, y: destino.y }]
        }
        this.últimaAnimación = null
    }

    dibujarRuta() {
        const gráfico = this.dueño.estelaJugador
        gráfico.clear()

        if (!this.camino || this.indicePunto >= this.camino.length) return

        // Empezar a dibujar desde el punto 1 para que no esté tan cerca del jugador
        const puntoInicio = Math.min(this.indicePunto + 1, this.camino.length - 1)
        if (puntoInicio >= this.camino.length) return

        gráfico.moveTo(this.camino[puntoInicio].x, this.camino[puntoInicio].y)

        for (let i = puntoInicio; i < this.camino.length; i++) {
            gráfico.lineTo(this.camino[i].x, this.camino[i].y)
        }

        gráfico.stroke({ width: 2, color: 0xffffff, alpha: 0.2})
    }
    
    alActualizar(datos) {
        if (!this.camino || this.indicePunto >= this.camino.length) {
            this.dueño.mef.cambiarEstado('espera')
            return
        }
        
        const puntoActual = this.camino[this.indicePunto]
        const esUltimoPunto = this.indicePunto === this.camino.length - 1
        
        const dx = puntoActual.x - this.dueño.contenedor.x
        const dy = puntoActual.y - this.dueño.contenedor.y
        
        let animaciónNueva
        let escalaX = this.dueño.imagen.scale.x
        const UMBRAL_DIAGONAL = 0.3
        const proporción = Math.abs(dx) / (Math.abs(dx) + Math.abs(dy) + 0.001)

        const distancia = Math.sqrt(dx * dx + dy * dy)

        const movimientoSignificativo = Math.abs(dx) > 1;

        if (proporción > 0.5 + UMBRAL_DIAGONAL) {
            animaciónNueva = this.dueño.animaciones.lado
            if (movimientoSignificativo) escalaX = dx < 0 ? -1 : 1
        } else if (proporción < 0.5 - UMBRAL_DIAGONAL) {
            animaciónNueva = dy < 0
                ? this.dueño.animaciones.arriba
                : this.dueño.animaciones.abajo
            // Para animaciones verticales, mantener el scale.x actual
        } else {
            animaciónNueva = this.dueño.animaciones.lado
            if (movimientoSignificativo) escalaX = dx < 0 ? -1 : 1
        }

        if (animaciónNueva !== this.últimaAnimación) {
            this.dueño.imagen.textures = animaciónNueva
            this.dueño.imagen.play()
            this.últimaAnimación = animaciónNueva
        }
        
        // Solo actualizar scale.x si estamos usando animación lateral
        if (animaciónNueva === this.dueño.animaciones.lado && escalaX !== this.dueño.imagen.scale.x) {
            this.dueño.imagen.scale.x = escalaX
        }

        const distanciaFreno = esUltimoPunto ? (this.destino.distanciaFreno || 5) : (this.VELOCIDAD * datos)

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

        this.dibujarRuta()
    }
}

export class Intercambio extends Estado {
    //bloquear movimiento
}
