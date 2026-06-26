import * as PIXI from './pixi.js';

import { catálogoObjetos } from './datos.js';
import { Jugador } from './jugador/index.js';
import { GatiNPC } from './gatinpc/index.js';
import { HUD } from './interfaz/hud.js';
import { mezclar, cortarGrilla, SistemaTrucos } from './herramientas-funciones.js';
import { Accesorios } from './accesorios.js';
import { catálogoObstáculos, generarPosicionRandom, verificarSuperposicion, puntoDentroDeObstáculo, calcularPuntoMásCercano } from './obstaculos.js';

export class Juego {
    constructor() {
        this.app = new PIXI.Application();

        this.ANCHO_MUNDO = 2500
        this.ALTO_MUNDO = 2500
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
            'recursos/sprites/jugador.json',
            'recursos/sprites/gato_gris.json',
            'recursos/sprites/gato_negro.json',
            'recursos/sprites/gato_blanco.json',
            'recursos/sprites/gato_violeta.json',
            'recursos/sprites/gato_naranja.json',
            'recursos/sprites/shiro.json',
            'recursos/sprites/accesorios.png',
            'recursos/sprites/pastito.png',
            'recursos/sprites/comercio1.png',
            'recursos/sprites/comercio2.png',
            'recursos/sprites/comercio3.png',
            'recursos/sprites/arbol1.png',
            'recursos/sprites/arbol2.png',
            'recursos/sprites/arbol3.png',
            'recursos/sprites/arbol4.png',
            'recursos/sprites/picnic.png',
            'recursos/sprites/banquito1.png'
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

    generarCadenaVictoria(pasos = 10) {
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
                200,
                intercambio.da,
                intercambio.pide,
                this.jugador,
                this.ANCHO_MUNDO,
                this.ALTO_MUNDO,
                this.obstaculos
            )

            gato.asignarAccesorio(intercambio.da, intercambio.pide)

            gato.alSeleccionar = () => {
                if (this.hud.menuIntercambio.visible) {
                    this.hud.menuIntercambio.cerrar()
                }
            }

            gato.alIniciarIntercambio = (gato) => {
                this.hud.menuIntercambio.abrir(gato)
                this.jugador.mefComportamiento.cambiarEstado('intercambio')
            }

            gato.alCerrarIntercambio = () => {
                this.jugador.entidadObjetivo = null
                gato.mefComportamiento.cambiarEstado('espera')
                this.jugador.mefComportamiento.cambiarEstado('espera')
            }

            this.gatos.push(gato)

            this.mundoContenedor.addChild(
                gato.contenedor
            )
        }
    }

    crearObstaculos() {
        this.obstaculos = []

        // Crear 2-3 grupitos de comercios
        const cantidadGrupitos = Math.floor(Math.random() * 2) + 2 // 2 o 3 grupitos
        const tiposComercios = ['comercio1', 'comercio2', 'comercio3']
        
        for (let g = 0; g < cantidadGrupitos; g++) {
            // Posición base del grupito
            let posicionBase
            let intentos = 0
            const maxIntentos = 100
            
            do {
                posicionBase = generarPosicionRandom(this.ANCHO_MUNDO, this.ALTO_MUNDO, 300)
                intentos++
            } while (verificarSuperposicion(posicionBase.x, posicionBase.y, 350, this.obstaculos) && intentos < maxIntentos)
            
            // Crear los 3 comercios uno al lado del otro horizontalmente
            const separacionComercios = 180
            const ordenComercios = [...tiposComercios].sort(() => Math.random() - 0.5) // Orden random
            
            for (let i = 0; i < ordenComercios.length; i++) {
                const offsetX = (i - 1) * separacionComercios
                this.crearObstáculoEnPosicion(ordenComercios[i], posicionBase.x + offsetX, posicionBase.y)
            }
            
            // Colocar picnic delante del grupito (más separado)
            const picnicX = posicionBase.x
            const picnicY = posicionBase.y + 160
            this.crearObstáculoEnPosicion('picnic', picnicX, picnicY)
        }
        
        // Generar árboles alejados de los comercios
        const tiposArboles = ['arbol1', 'arbol2', 'arbol3']
        const totalArboles = Math.floor(Math.random() * 7) + 6 // Entre 6 y 12 árboles
        
        // Primero agregar árboles en las esquinas
        const esquinas = [
            { x: 100, y: 100 }, // Superior izquierda
            { x: this.ANCHO_MUNDO - 100, y: 100 }, // Superior derecha
            { x: 100, y: this.ALTO_MUNDO - 100 }, // Inferior izquierda
            { x: this.ANCHO_MUNDO - 100, y: this.ALTO_MUNDO - 100 } // Inferior derecha
        ]
        
        for (const esquina of esquinas) {
            // Agregar 1-2 árboles en cada esquina con variación
            const arbolesPorEsquina = Math.floor(Math.random() * 1) + 1 // 1 o 2 árboles
            for (let i = 0; i < arbolesPorEsquina; i++) {
                const tipoArbol = tiposArboles[Math.floor(Math.random() * tiposArboles.length)]
                const offsetX = (Math.random() - 0.5) * 200 // Variación de ±100px
                const offsetY = (Math.random() - 0.5) * 200
                this.crearObstáculoEnPosicion(tipoArbol, esquina.x + offsetX, esquina.y + offsetY)
            }
        }
        
        // Luego generar árboles random en el resto del mapa
        for (let i = 0; i < totalArboles; i++) {
            const tipoArbol = tiposArboles[Math.floor(Math.random() * tiposArboles.length)]
            let posicionArbol
            let intentos = 0
            const maxIntentos = 200
            
            do {
                posicionArbol = generarPosicionRandom(this.ANCHO_MUNDO, this.ALTO_MUNDO)
                intentos++
                
                // Verificar que esté lejos de cualquier comercio
                let cercaDeComercio = false
                for (const obs of this.obstaculos) {
                    if (obs.tipo.startsWith('comercio')) {
                        const dx = posicionArbol.x - obs.x
                        const dy = posicionArbol.y - obs.y
                        const distancia = Math.sqrt(dx * dx + dy * dy)
                        if (distancia < 250) {
                            cercaDeComercio = true
                            break
                        }
                    }
                }
                
                if (!cercaDeComercio && !verificarSuperposicion(posicionArbol.x, posicionArbol.y, 100, this.obstaculos)) {
                    break
                }
            } while (intentos < maxIntentos)
            
            this.crearObstáculoEnPosicion(tipoArbol, posicionArbol.x, posicionArbol.y)
        }
        
        // Generar 4 árboles arbol4
        for (let i = 0; i < 4; i++) {
            let posicionArbol4
            let intentos = 0
            const maxIntentos = 200
            
            do {
                posicionArbol4 = generarPosicionRandom(this.ANCHO_MUNDO, this.ALTO_MUNDO)
                intentos++
            } while (verificarSuperposicion(posicionArbol4.x, posicionArbol4.y, 100, this.obstaculos) && intentos < maxIntentos)
            
            this.crearObstáculoEnPosicion('arbol4', posicionArbol4.x, posicionArbol4.y)
        }
        
        // Generar hasta 7 banquitos (banquito1)
        const totalBanquitos = Math.floor(Math.random() * 5) + 5 // Entre 5 y 9 banquitos
        
        for (let i = 0; i < totalBanquitos; i++) {
            let posicionBanquito
            let intentos = 0
            const maxIntentos = 200
            
            do {
                posicionBanquito = generarPosicionRandom(this.ANCHO_MUNDO, this.ALTO_MUNDO)
                intentos++
            } while (verificarSuperposicion(posicionBanquito.x, posicionBanquito.y, 100, this.obstaculos) && intentos < maxIntentos)
            
            this.crearObstáculoEnPosicion('banquito1', posicionBanquito.x, posicionBanquito.y)
        }
    }

    crearObstáculoEnPosicion(tipo, x, y) {
        const datos = catálogoObstáculos[tipo]

        const sprite = new PIXI.Sprite(PIXI.Assets.get(datos.imagen))
        sprite.anchor.set(0.5)
        sprite.scale.set(datos.escala)
        sprite.x = x
        sprite.y = y
        
        // El picnic tiene zIndex fijo bajo para que el jugador aparezca encima
        if (tipo === 'picnic') {
            sprite.zIndex = 0
        } else {
            sprite.zIndex = y
        }

        this.mundoContenedor.addChild(sprite)

        this.obstaculos.push({
            sprite,
            x: x,
            y: y,
            radioColision: datos.radioColision,
            tipo
        })
    }

    crearObstáculo(tipo) {
        const datos = catálogoObstáculos[tipo]
        let posicion
        let intentos = 0
        const maxIntentos = 100

        do {
            posicion = generarPosicionRandom(this.ANCHO_MUNDO, this.ALTO_MUNDO)
            intentos++
        } while (verificarSuperposicion(posicion.x, posicion.y, datos.radioColision, this.obstaculos) && intentos < maxIntentos)

        const sprite = new PIXI.Sprite(PIXI.Assets.get(datos.imagen))
        sprite.anchor.set(0.5)
        sprite.scale.set(datos.escala)
        sprite.x = posicion.x
        sprite.y = posicion.y
        
        // El picnic tiene zIndex fijo bajo para que el jugador aparezca encima
        if (tipo === 'picnic') {
            sprite.zIndex = 0
        } else {
            sprite.zIndex = posicion.y
        }

        this.mundoContenedor.addChild(sprite)

        this.obstaculos.push({
            sprite,
            x: posicion.x,
            y: posicion.y,
            radioColision: datos.radioColision,
            tipo
        })
    }

    crearEscena() {
        this.mundoContenedor = new PIXI.Container()
        this.mundoContenedor.sortableChildren = true
        
        this.app.stage.addChild(this.mundoContenedor)

        this.interfazContenedor = new PIXI.Container()
        this.app.stage.addChild(this.interfazContenedor)
        
        const texturaSuelo = PIXI.Assets.get('recursos/sprites/pastito.png')
        this.suelo = new PIXI.TilingSprite({
            texture: texturaSuelo,
            width: this.ANCHO_MUNDO,
            height: this.ALTO_MUNDO
        })
        this.mundoContenedor.addChild(this.suelo)

        this.crearObstaculos()

        this.jugador = new Jugador(
            this.mundoContenedor,
            this.ANCHO_MUNDO,
            this.ALTO_MUNDO,
            this.obstaculos
        )
        this.mundoContenedor.addChild(this.jugador.contenedor)
        
        this.accesorios = new Accesorios()
        this.accesorios.cargar()
        
        this.crearNPCs()
        
        this.hud = new HUD(this.app, this.datos)
        this.hud.menuIntercambio.spriteJugador.texture = this.jugador.texturaEspera
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

        // Sistema de trucos
        this.sistemaTrucos = new SistemaTrucos()
        this.sistemaTrucos.registrarTruco('shiro', () => {
            if (this.jugador.skinActual === 'default') {
                this.jugador.cambiarSkin('recursos/sprites/shiro.json')
            } else {
                this.jugador.restaurarSkinDefault()
            }
        }, 'Skin especial de Shiro')

        window.addEventListener('keydown', (evento) => {
            this.sistemaTrucos.procesarTecla(evento.key)
        })
    }

    clicMundo(evento) {
        if (this.hud.menuIntercambio.visible) {
            this.hud.menuIntercambio.cerrar()
            return
        }

        if (evento.target !== this.app.stage) return
        
        const puntoEnMundo = this.mundoContenedor.toLocal(evento.global)

        // Verificar si el clic está sobre un obstáculo
        const obstáculo = puntoDentroDeObstáculo(puntoEnMundo.x, puntoEnMundo.y, this.obstaculos)
        
        let destinoFinal = puntoEnMundo
        
        if (obstáculo) {
            // Calcular el punto más cercano alrededor del obstáculo
            destinoFinal = calcularPuntoMásCercano(puntoEnMundo.x, puntoEnMundo.y, obstáculo)
        }

        this.jugador.irHacia(destinoFinal)
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