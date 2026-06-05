import * as PIXI from './pixi.js';

import { catálogoObjetos } from './datos.js';
import { Jugador } from './Jugador/index.js';
import { GatiNPC } from './GatiNPC/index.js';
import { Inventario } from './inventario.js';
import { MenuIntercambio } from './menu-intercambio.js';

export class Juego {
    constructor() {
        this.app = new PIXI.Application();

        this.ANCHO_MUNDO = 2000
        this.ALTO_MUNDO = 2000
        this.ALTO_DISEÑO = 800

        this.init()
    }

    async init() {
        await this.app.init({
            width: window.innerWidth,
            height: window.innerHeight,
            background: 'green',
        })

        document.body.appendChild(this.app.canvas)

        await this.cargarRecursos()

        this.crearEscena()
        this.crearEventos()

        this.redimensionar()

        this.app.ticker.add((ticker) => {
            this.actualizar(ticker.deltaTime)
        })
    }
    
    async cargarRecursos() {
        await PIXI.Assets.load([
            'Recursos/Sprites/JugadorDeLado.png',
            'Recursos/Sprites/JugadorArriba.png',
            'Recursos/Sprites/JugadorAbajo.png',
            'Recursos/Sprites/JugadorEspera.png',
            'Recursos/Sprites/GatoGrisDeLado.png',
            'Recursos/Sprites/GatoGrisArriba.png',
            'Recursos/Sprites/GatoGrisAbajo.png',
            'Recursos/Sprites/GatoGrisEspera.png',
            'Recursos/Sprites/GatoNegroDeLado.png',
            'Recursos/Sprites/GatoNegroArriba.png',
            'Recursos/Sprites/GatoNegroAbajo.png',
            'Recursos/Sprites/GatoNegroEspera.png'
        ])
    }

    crearEscena() {
        this.mundoContenedor = new PIXI.Container()
        this.app.stage.addChild(this.mundoContenedor)

        this.interfazContenedor = new PIXI.Container()
        this.app.stage.addChild(this.interfazContenedor)
        
        this.fondo = new PIXI.Graphics()
        this.fondo.rect(
            0,
            0,
            this.ANCHO_MUNDO,
            this.ALTO_MUNDO
        ).fill('#4a7c3f')
        this.mundoContenedor.addChild(this.fondo)

        this.jugador = new Jugador(
            this.mundoContenedor,
            this.ANCHO_MUNDO,
            this.ALTO_MUNDO
        )
        this.mundoContenedor.addChild(this.jugador.contenedor)

        const esMovil = window.innerWidth < 768

        this.inventario = new Inventario(this.app, esMovil)
        this.interfazContenedor.addChild(this.inventario.contenedor)

        this.menuIntercambio = new MenuIntercambio(
            this.app,
            this.inventario
        )
        this.interfazContenedor.addChild(this.menuIntercambio.contenedor)

        this.gato = new GatiNPC(
            400,
            300,
            'libro',
            'ovilloLana',
            this.jugador,
            this.ANCHO_MUNDO,
            this.ALTO_MUNDO,
            this.menuIntercambio
        )
        this.mundoContenedor.addChild(this.gato.contenedor)
    }

    centrarCámara() {
        const objetivoX = this.app.screen.width / 2 - this.jugador.contenedor.x
        const objetivoY = this.app.screen.height / 2 - this.jugador.contenedor.y

        const suavizado = 0.08

        this.mundoContenedor.x += (objetivoX - this.mundoContenedor.x) * suavizado

        this.mundoContenedor.y += (objetivoY - this.mundoContenedor.y) * suavizado

        this.mundoContenedor.x = Math.min(
            0,
            Math.max(
                this.mundoContenedor.x,
                this.app.screen.width - this.ANCHO_MUNDO
            )
        )

        this.mundoContenedor.y = Math.min(
            0,
            Math.max(
                this.mundoContenedor.y,
                this.app.screen.height - this.ALTO_MUNDO
            )
        )
    }

    crearEventos() {
        window.addEventListener('resize', () => {
            this.redimensionar()
        })

        this.app.stage.eventMode = 'static'
        this.app.stage.hitArea = this.app.screen

        this.app.stage.on('pointertap', (evento) => {
            this.clicMundo(evento)
        })
    }

    clicMundo(evento) {
    if (evento.target !== this.app.stage) return

    if (this.menuIntercambio.visible) {
        this.menuIntercambio.cerrar()
        return
    }

    const puntoEnMundo = this.mundoContenedor.toLocal(evento.global)

    this.jugador.irHacia(puntoEnMundo)
}

    actualizar(datos) {
        this.jugador.actualizar(datos)
        this.gato.actualizar(datos)
        this.menuIntercambio.actualizar()
        this.inventario.actualizar()

        this.centrarCámara()
    }

    redimensionar() {
        this.app.renderer.resize(
            window.innerWidth,
            window.innerHeight
        )
    }
}

const juego = new Juego()