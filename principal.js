import * as PIXI from './pixi.js';

import { catálogoObjetos } from './datos.js';
import { Jugador } from './jugador/index.js';
import { GatiNPC } from './gatinpc/index.js';
import { HUD } from './interfaz/hud.js';
import { mezclar, cortarGrilla } from './herramientas-funciones.js';
import { Accesorios } from './accesorios.js';

export class Juego {
    constructor() {
        this.app = new PIXI.Application();

        this.ANCHO_MUNDO = 2000
        this.ALTO_MUNDO = 2000
        this.ALTO_DISEÑO = 800

        this.init()
    }

    async init() {
        PIXI.TextureSource.defaultOptions.scaleMode = 'nearest'

        await this.app.init({
            width: window.innerWidth,
            height: window.innerHeight,
            background: 'green',
            
            textureAntiAlias: false
        })

        document.body.appendChild(this.app.canvas)

        await this.cargarRecursos()

        this.generarPartida()
        this.crearEscena()
        this.crearEventos()

        this.redimensionar()


        this.app.ticker.add((ticker) => {
            this.actualizar(ticker.deltaTime)
        })
    }
    
    async cargarRecursos() {
        await PIXI.Assets.load([
            'recursos/sprites/JugadorDeLado.png',
            'recursos/sprites/JugadorArriba.png',
            'recursos/sprites/JugadorAbajo.png',
            'recursos/sprites/JugadorEspera.png',
            'recursos/sprites/gato_gris.json',
            'recursos/sprites/gato_negro.json',
            'recursos/sprites/accesorios.png'
        ])
    }

    generarPartida() {
        this.generarInventarioInicial()
        this.generarObjetivo()
        this.generarCadenaVictoria()
        this.datos = {
            objetosIniciales: this.objetosIniciales,
            objetivo: catálogoObjetos[this.objetivo],
            tiempoLímite: 180
        }
    }

    generarInventarioInicial() {
        const ids = Object.keys(catálogoObjetos)
        
        const idsMezclados = ids.sort(() => Math.random() - 0.5)

        this.objetosIniciales = idsMezclados.slice(0, 3)
    }

    generarObjetivo() {
        const ids = Object.keys(catálogoObjetos)

        const candidatos = ids.filter(id => !this.objetosIniciales.includes(id))
        
        this.objetivo = candidatos[Math.floor(Math.random() * candidatos.length)]
    }

    generarCadenaVictoria(pasos = 3) {
        let objetoActual = this.objetosIniciales[Math.floor(Math.random() * this.objetosIniciales.length)]
        const disponibles = Object.keys(catálogoObjetos).filter(id => !this.objetosIniciales.includes(id) && id !== this.objetivo)

        this.intercambios = []

        for (let i = 0; i < pasos - 1; i++) {
            const indice = Math.floor(Math.random() * disponibles.length)
            const siguienteObjeto = disponibles.splice(indice, 1)[0]

            this.intercambios.push({
                pide: objetoActual,
                da: siguienteObjeto
            })

            objetoActual = siguienteObjeto
        }

        this.intercambios.push({
            pide: objetoActual,
            da: this.objetivo
        })
    }

    crearNPCs() {
        this.gatos = []

        for (let i = 0;i < this.intercambios.length; i++) {
            const intercambio = this.intercambios[i]

            const gato = new GatiNPC(
                300 + i * 250,
                0,
                intercambio.da,
                intercambio.pide,
                this.jugador,
                this.ANCHO_MUNDO,
                this.ALTO_MUNDO,
            )

            //gato.asignarAccesorio(this.accesorios.obtenerSiguiente(i))

            gato.alSeleccionar = () => {
                if (this.hud.menuIntercambio.visible) {
                    this.hud.menuIntercambio.cerrar()
                }
            }

            gato.alIniciarIntercambio = (gato) => {
                this.hud.menuIntercambio.abrir(gato)
                this.jugador.mef.cambiarEstado('intercambio')
            }

            gato.alCerrarIntercambio = () => {
                this.jugador.entidadObjetivo = null
                gato.mefComportamiento.cambiarEstado('espera')
                this.jugador.mef.cambiarEstado('espera')
            }

            this.gatos.push(gato)

            this.mundoContenedor.addChild(
                gato.contenedor
            )
        }
    }

    crearEscena() {
        this.mundoContenedor = new PIXI.Container()
        this.mundoContenedor.sortableChildren = true
        
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

        this.accesorios = new Accesorios()
        this.accesorios.cargar()

        this.crearNPCs()
        
        this.hud = new HUD(this.app, this.datos)
        this.interfazContenedor.addChild(this.hud.contenedor)
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
        if (this.hud.menuIntercambio.visible) {
            this.hud.menuIntercambio.cerrar()
            return
        }

        if (evento.target !== this.app.stage) return
        
        const puntoEnMundo = this.mundoContenedor.toLocal(evento.global)

        this.jugador.irHacia(puntoEnMundo)
    }

    actualizar(delta) {
        this.jugador.actualizar(delta)
        this.jugador.contenedor.zIndex = this.jugador.contenedor.y
        for (const gato of this.gatos) {
            gato.contenedor.zIndex = gato.contenedor.y
            gato.actualizar(delta)
        }
        this.hud.actualizar(delta)

        this.centrarCámara()
    }

    redimensionar() {
        this.app.renderer.resize(
            window.innerWidth,
            window.innerHeight
        )
        this.hud.redimensionar()
    }
}

const juego = new Juego()