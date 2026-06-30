import * as PIXI from "../pixi.js"

import { Inventario } from './inventario.js';
import { MenuIntercambio } from './menu-intercambio.js';
import { Cronómetro } from "./cronómetro.js";
import { Objetivo } from "./objetivo.js";

export class HUD {
    constructor(app, datos, escalaUI) {
        this.app = app
        this.escalaUI = escalaUI

        this.contenedor = new PIXI.Container()

        this.inventario = new Inventario(app, datos.objetosIniciales, escalaUI)

        this.menuIntercambio = new MenuIntercambio(app, this.inventario)

        this.objetivo = new Objetivo(datos.objetivo)

        this.cronómetro = new Cronómetro(app, this.objetivo)

        this.contenedor.addChild(this.inventario.contenedor)
        this.contenedor.addChild(this.menuIntercambio.contenedor)
        this.contenedor.addChild(this.objetivo.contenedor)
    }

    actualizar(delta) {
        this.cronómetro.actualizar(delta)
    }

    redimensionar() {
        this.inventario.redimensionar()
        this.menuIntercambio.redimensionar()
        this.objetivo.redimensionar()
    }
}