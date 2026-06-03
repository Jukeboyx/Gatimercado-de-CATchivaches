import * as PIXI from './pixi.js';

import { catálogoObjetos } from './datos.js';
import { Jugador } from './Jugador/index.js';
import { GatiNPC } from './GatiNPC/index.js';
import { Inventario } from './inventario.js';
import { MenuIntercambio } from './menu-intercambio.js';

const app = new PIXI.Application();

async function cargarRecursos() {
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
        const escala = window.innerWidth / ANCHO_DISEÑO
        mundoContenedor.scale.set(escala)
        interfazContenedor.scale.set(escala)
        centrarCámara()
    })

    document.body.appendChild(app.canvas);

    const ANCHO_DISEÑO = 1280
    const escala = window.innerWidth / ANCHO_DISEÑO

    const ANCHO_MUNDO = 2000
    const ALTO_MUNDO = 2000

    const mundoContenedor = new PIXI.Container()
    app.stage.addChild(mundoContenedor)

    const fondo = new PIXI.Graphics()
    fondo.rect(0, 0, ANCHO_MUNDO, ALTO_MUNDO).fill('#4a7c3f')
    mundoContenedor.addChild(fondo)

    const miJugador = new Jugador(mundoContenedor, ANCHO_MUNDO, ALTO_MUNDO)
    mundoContenedor.addChild(miJugador.contenedor)
    
    const interfazContenedor = new PIXI.Container()
    app.stage.addChild(interfazContenedor)
    
    const miInventario = new Inventario(app)
    interfazContenedor.addChild(miInventario.contenedor)
    
    const miMenuIntercambio = new MenuIntercambio(app, miInventario)
    interfazContenedor.addChild(miMenuIntercambio.contenedor)
    
    const primerGato = new GatiNPC(400, 300, 'libro', 'ovilloLana', miJugador, ANCHO_MUNDO, ALTO_MUNDO, miMenuIntercambio);
    mundoContenedor.addChild(primerGato.contenedor);
    
    mundoContenedor.scale.set(escala)
    interfazContenedor.scale.set(escala)
    
    function centrarCámara() {
        let cámaraX = app.screen.width / 2 - miJugador.contenedor.x * escala
        let cámaraY = app.screen.height / 2 - miJugador.contenedor.y * escala

        cámaraX = Math.min(0, Math.max(cámaraX, app.screen.width - ANCHO_MUNDO * escala))
        cámaraY = Math.min(0, Math.max(cámaraY, app.screen.height - ALTO_MUNDO * escala))

        mundoContenedor.x = cámaraX
        mundoContenedor.y = cámaraY
    }
    
    app.stage.eventMode = 'static'
    app.stage.hitArea = app.screen
    app.stage.on('pointertap', (e) => {
        if (e.target !== app.stage) return

        if (miMenuIntercambio.visible) {
            miMenuIntercambio.cerrar()
            return
        }

        const puntoEnMundo = {
            x: (e.global.x - mundoContenedor.x) / escala,
            y: (e.global.y - mundoContenedor.y) / escala
        }
        miJugador.irHacia(puntoEnMundo)
    })

    app.ticker.add((ticker) => {
        actualizarJuego(ticker.deltaTime)
    })

    function actualizarJuego(dt) {
        miJugador.actualizar(dt)
        primerGato.actualizar(dt)
        miInventario.actualizar(dt)
        miMenuIntercambio.actualizar()
        centrarCámara()
    }

    window.app = app
    window.jugador = miJugador
    window.npc = primerGato
    window.PIXI = PIXI
}

iniciarJuego();