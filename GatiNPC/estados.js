import * as PIXI from '../pixi.js';

import { Estado } from "../MEF.js";
import * as mover from "../movimiento.js"


export class Espera extends Estado {
    alEntrar() {
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
        //Activar menú de intercambio
        //Cambiar animación a hablando
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