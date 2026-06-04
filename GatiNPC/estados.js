import * as PIXI from '../pixi.js';

import { Estado } from "../mef.js";
import * as mover from "../movimiento.js"


export class Espera extends Estado {
    alEntrar() {
        this.dueño.imagen.textures = this.dueño.animaciones.espera
        this.dueño.imagen.play()
        this.TIEMPO_ESPERA = 2000 + Math.random() * 3000
        this.tiempoTrancurrido = 0
    }

    alActualizar(datos) {
        if (this.dueño.jugadorVaAIntercambiar()) {
            this.dueño.mef.cambiarEstado('intercambio')
            return
        }

        this.tiempoTrancurrido += datos * (1000 / 60)
        if (this.tiempoTrancurrido >= this.TIEMPO_ESPERA) {
            this.dueño.mef.cambiarEstado('merodeo')
        }
    }
}

export class Merodeo extends Estado {
    alEntrar() {
        this.indicePunto = 0
        this.VELOCIDAD = 3
        this.últimaAnimación = null

        const destino = this.elegirPuntoRandom()

        this.camino = mover.calcularCamino(
            this.dueño.contenedor.x,
            this.dueño.contenedor.y,
            destino.x,
            destino.y,
            this.dueño.ANCHO_MUNDO,
            this.dueño.ALTO_MUNDO
        )

        if (this.camino.length > 1) {
            this.indicePunto = 1
        }
    }

    elegirPuntoRandom() {
        return {
            x: Math.random() * this.dueño.ANCHO_MUNDO,
            y: Math.random() * this.dueño.ALTO_MUNDO
        }
    }

    actualizarAnimación(dx, dy) {
        const escalaBase = Math.abs(this.dueño.imagen.scale.x)
        const imagen = this.dueño.imagen
        const animaciones = this.dueño.animaciones
        const UMBRAL_DIAGONAL = 0.3
        const proporción = Math.abs(dx) / (Math.abs(dx) + Math.abs(dy) + 0.001)
        const movimientoSignificativo = Math.abs(dx) > 1;

        let animaciónNueva
        let escalaX = imagen.scale.x

        if (proporción > 0.5 + UMBRAL_DIAGONAL) {
            animaciónNueva = animaciones.lado
            if (movimientoSignificativo) escalaX = dx < 0 ? -escalaBase : escalaBase
        } else if (proporción < 0.5 - UMBRAL_DIAGONAL) {
            animaciónNueva = dy < 0
                ? animaciones.arriba
                : animaciones.abajo
        } else {
            animaciónNueva = animaciones.lado
            if (movimientoSignificativo) escalaX = dx < 0 ? -escalaBase : escalaBase
        }

        if (animaciónNueva !== this.últimaAnimación) {
            imagen.textures = animaciónNueva
            imagen.play()
            this.últimaAnimación = animaciónNueva
        }
        
        if (animaciónNueva === animaciones.lado && escalaX !== imagen.scale.x) {
            imagen.scale.x = escalaX
        }
    }

    alActualizar(datos) {
        if (this.dueño.jugadorVaAIntercambiar()) {
            this.dueño.mef.cambiarEstado('intercambio')
            return
        }

        if (!this.camino || this.indicePunto >= this.camino.length) {
            this.dueño.mef.cambiarEstado('espera')
            return
        }

        const resultado = mover.avanzarEnCamino(
            this.dueño.contenedor,
            this.camino,
            this.indicePunto,
            this.VELOCIDAD,
            5,
            datos
        )

        if (!resultado.llegó) {
            this.actualizarAnimación(resultado.dx, resultado.dy)
        }

        if (resultado.llegó) {
            if (resultado.esUltimoPunto) {
                this.dueño.mef.cambiarEstado('espera')
            } else {
                this.indicePunto++
            }
        }
    }
}

export class Intercambio extends Estado {
    alEntrar() {
        this.dueño.menu.abrir(this.dueño)
        this.dueño.imagen.textures = this.dueño.animaciones.espera
        this.dueño.imagen.play()
    }

    alActualizar() {
        //Escuchar el clic
        //Realizar el trueque
        //Pasar al siguiente estado con el trueque realizado o no
    }

    alSalir() {
        //Ocultar menú de trueque
    }
}

export class Agradecido extends Estado {
    alEntrar() {
        //Cambiar animación a agradecimiento
    }
}

export class Enojado extends Estado {
    alEntrar() {
        //Cambiar animación a enojado
        //Escapar del jugador
    }
}