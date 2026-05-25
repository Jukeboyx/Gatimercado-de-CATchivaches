import * as PIXI from './pixi.js';

import { catálogoObjetos } from './datos.js';
import { Jugador } from './Jugador';
import { GatiNPC } from './GatiNPC';
import { Inventario } from './inventario.js'

const app = new PIXI.Application();

async function iniciarJuego() {
    await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        background: 'green',
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
    })

    document.body.appendChild(app.canvas);

    const textura = PIXI.Texture.WHITE
    const miJugador = new Jugador(textura, app)
    app.stage.addChild(miJugador.container)

    app.stage.eventMode = 'static'
    app.stage.hitArea = app.screen
    app.stage.on('pointertap', (e) => {
        miJugador.irHacia(e.global)
    })

    const miInventario = new Inventario(app)
    //const miGato = new GatiNPC
    app.ticker.add((ticker) => {
        /* if (miGato && typeof miGato.actualizar === 'function') {
            miGato.actualizar()
        } */
        if (miInventario && typeof miInventario.actualizar === 'function') {
            miInventario.actualizar();
        }
        miJugador.actualizar(ticker.deltaTime)
        actualizarJuego(ticker.deltaTime)
    })
}

function actualizarJuego(dt) {
    
}

iniciarJuego();