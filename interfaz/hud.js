import * as PIXI from "../pixi.js"

import { Inventario } from './inventario.js';
import { MenuIntercambio } from './menu-intercambio.js';
import { Temporizador } from "./temporizador.js";
import { Objetivo } from "./objetivo.js";

export class HUD {
    constructor(app, datos) {
        this.app = app

        this.contenedor = new PIXI.Container()

        this.inventario = new Inventario(app, datos.objetosIniciales)

        this.menuIntercambio = new MenuIntercambio(app, this.inventario)

        this.temporizador = new Temporizador(app, datos.tiempoLímite)

        this.objetivo = new Objetivo(datos.objetivo)

        this.contenedor.addChild(this.inventario.contenedor)
        this.contenedor.addChild(this.menuIntercambio.contenedor)
        this.contenedor.addChild(this.temporizador.contenedor)
        this.contenedor.addChild(this.objetivo.contenedor)
    }

    actualizar(delta) {
        this.temporizador.actualizar(delta)
    }

    redimensionar() {
        this.inventario.redimensionar()
        this.menuIntercambio.redimensionar()
        this.temporizador.redimensionar()
        this.objetivo.redimensionar()
    }
}