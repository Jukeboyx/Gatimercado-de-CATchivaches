import * as PIXI from './pixi.js';

import { catálogoObjetos } from './datos.js';
import { Jugador } from './Jugador/index.js';
import { GatiNPC } from './GatiNPC/index.js';
import { Inventario } from './inventario.js'

const app = new PIXI.Application();

async function cargarRecursos() {
    await PIXI.Assets.load([
        'Recursos/Sprites/JugadorDeLado.png',
        'Recursos/Sprites/JugadorArriba.png',
        'Recursos/Sprites/JugadorAbajo.png',
        'Recursos/Sprites/JugadorEspera.png'
    ])
}

async function iniciarJuego() {
    await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        background: 'green',
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
    })
    await cargarRecursos()

    window.addEventListener('resize', () => {
        app.renderer.resize(window.innerWidth, window.innerHeight)
        centrarCámara()
    })

    document.body.appendChild(app.canvas);

    const ANCHO_MUNDO = 2000
    const ALTO_MUNDO = 2000

    const mundoContenedor = new PIXI.Container()
    app.stage.addChild(mundoContenedor)

    const fondo = new PIXI.Graphics()
    fondo.rect(0, 0, ANCHO_MUNDO, ALTO_MUNDO).fill('#4a7c3f')
    mundoContenedor.addChild(fondo)

    const miJugador = new Jugador(mundoContenedor, ANCHO_MUNDO, ALTO_MUNDO)
    mundoContenedor.addChild(miJugador.contenedor)
    
    const primerGato = new GatiNPC(400, 300, 'libro', 'ovilloLana', miJugador, ANCHO_MUNDO, ALTO_MUNDO);
    mundoContenedor.addChild(primerGato.contenedor);
    
    const interfazContenedor = new PIXI.Container()
    app.stage.addChild(interfazContenedor)

    const miInventario = new Inventario(app)
    interfazContenedor.addChild(miInventario.contenedor)

    function centrarCámara() {
        let cámaraX = app.screen.width / 2 - miJugador.contenedor.x
        let cámaraY = app.screen.height / 2 - miJugador.contenedor.y

        cámaraX = Math.min(0, Math.max(cámaraX, app.screen.width - ANCHO_MUNDO))
        cámaraY = Math.min(0, Math.max(cámaraY, app.screen.height - ALTO_MUNDO))

        mundoContenedor.x = cámaraX
        mundoContenedor.y = cámaraY
    }
    
    app.stage.eventMode = 'static'
    app.stage.hitArea = app.screen
    app.stage.on('pointertap', (e) => {
        if (e.target !== app.stage) return

        const puntoEnMundo = {
            x: e.global.x - mundoContenedor.x,
            y: e.global.y - mundoContenedor.y
        }
        miJugador.irHacia(puntoEnMundo)
    })

    app.ticker.add((ticker) => {
        miJugador.actualizar(ticker.deltaTime)
        primerGato.actualizar(ticker.deltaTime)
        miInventario.actualizar(ticker.deltaTime)
        centrarCámara()
        actualizarJuego(ticker.deltaTime)
    })
}

function actualizarJuego(dt) {
    
}

iniciarJuego();