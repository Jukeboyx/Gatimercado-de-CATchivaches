import * as PIXI from '../pixi.js';
import { cortarGrilla, mezclar } from './herramientas-funciones.js';

export class Accesorios {
    constructor() {
        this.accesoriosDisponibles = []
    }

    cargar() {
        const textura = PIXI.Assets.get('recursos/sprites/accesorios.png')
        const todos = cortarGrilla(textura, 20, 20, 12, 44)
        this.accesoriosDisponibles = mezclar([...todos])
    }

    obtenerSiguiente(indice) {
        return this.accesoriosDisponibles[indice]
    }
}