import * as PIXI from './pixi.js';

import { catálogoObjetos } from './datos.js';
import { Jugador } from './jugador/index.js';
import { GatiNPC } from './gatinpc/index.js';
import { HUD } from './interfaz/hud.js';
import { ESCALA_UI, diseño } from './interfaz/diseno.js';
import { mezclar, cortarGrilla, SistemaTrucos, TrucoShiro, TrucoAfro, TrucoDebug, SistemaDebug, OpcionMostrarGrilla, OpcionEditarCeldas, OpcionNoclip, OpcionPausa, OpcionGuardarCeldas } from './herramientas-funciones.js';
import { Accesorios } from './gatinpc/accesorios.js';
import { catálogoObstáculos, generarPosicionRandom, verificarSuperposicion, Obstáculo } from './obstaculos.js';
import { SistemaGrilla } from './sistema-grilla.js'; 
import { MenuPrincipal } from './interfaz/menu.js'; 
import { PantallaVictoria } from './interfaz/victoria.js'; // <-- IMPORT DE VICTORIA AGREGADO
import { NPCAmbiente } from './npcsNoInteractuables/index.js';
import { audioManager } from './sistema-sonido.js'

export class Juego {
    constructor() {
        this.app = new PIXI.Application(); 

        this.ANCHO_MUNDO = 2528
        this.ALTO_MUNDO = 2528
        this.escalaUI = 2
        this.tamañoCelda = 32

        // Variables de estado y tiempo
        this.estado = 'menu';
        this.cronometro = 0; // Almacena el tiempo en segundos de la partida actual

        this.sistemaGrilla = new SistemaGrilla(this.tamañoCelda, this.ANCHO_MUNDO, this.ALTO_MUNDO)

        this.init()
    }

    async init() {
        PIXI.TextureSource.defaultOptions.scaleMode = 'nearest'

        await this.app.init({
            width: window.innerWidth,
            height: window.innerHeight,
            background: 'black',
            roundPixels: true,
            textureAntiAlias: false
        })

        document.body.appendChild(this.app.canvas)

        await this.cargarRecursos()

        this.menu = new MenuPrincipal(window.innerWidth,
            window.innerHeight,
            () => {
                audioManager.playBsm('sfx_menuClickeado')
                this.iniciarPartida();
            },
            () => {
                audioManager.playBsm('sfx_menuApuntado')
            }
        );
        this.app.stage.addChild(this.menu.contenedor);
        this.menu.ocultar()

        this.crearPantallaInicio()

        this.pantallaVictoria = new PantallaVictoria(window.innerWidth, window.innerHeight, () => {
            this.reiniciarAlMenu();
        });
        this.app.stage.addChild(this.pantallaVictoria.contenedor);
        
        this.app.ticker.add((ticker) => {
            this.redimensionar()
            this.actualizar(ticker.deltaTime)
        })
    }
    
    // Método para arrancar el juego cuando el jugador hace clic en "JUGAR"
    iniciarPartida() {
        this.cronometro = 0; // Resetear tiempo al empezar
        this.estado = 'jugando';
        this.generarPartida();
        this.crearEscena();
        this.crearEventos();
        //audioManager.playBgm('bgm_musica')
    }

    crearPantallaInicio() {
        const pantallaInicio = new PIXI.Container();
        pantallaInicio.eventMode = 'static';
        pantallaInicio.cursor = 'pointer';
        pantallaInicio.hitArea = this.app.screen;

        const fondo = new PIXI.Graphics()
            .rect(0, 0, this.app.screen.width, this.app.screen.height)
            .fill({ color: 0x000000, alpha: 0.85 });
        pantallaInicio.addChild(fondo);

        const texto = new PIXI.Text({
            text: 'Hacé clic para empezar',
            style: { fill: 0xffffff, fontSize: 32, fontFamily: 'Perfect' }
        });
        texto.anchor.set(0.5);
        texto.x = this.app.screen.width / 2;
        texto.y = this.app.screen.height / 2;
        pantallaInicio.addChild(texto);

        pantallaInicio.on('pointertap', async () => {
            await audioManager.desbloquearAudio();
            this.app.stage.removeChild(pantallaInicio);
            pantallaInicio.destroy({ children: true });
            this.menu.mostrar(); // recién ahora se muestra el menú con hover/tap sonoro
        });

        this.app.stage.addChild(pantallaInicio);
    }
    // Método que debés llamar cuando se cumpla la condición de victoria en tu juego
    ganarPartida() {
        //audioManager.stopBgm()
        this.estado = 'victoria';
        
        // Limpiamos los eventos del teclado/mouse del juego para que no se mueva el prota de fondo
        window.removeEventListener('resize', this.redimensionar);
        
        // Removemos los contenedores del juego visualmente para dejar solo la pantalla de victoria limpio
        if (this.mundoContenedor) this.mundoContenedor.visible = false;
        if (this.interfazContenedor) this.interfazContenedor.visible = false;

        // Mostramos el podio enviando el tiempo final acumulado
        this.pantallaVictoria.mostrar(this.cronometro);
    }

    reiniciarAlMenu() {
        this.estado = 'menu';

        if (this._onResize) {
            window.removeEventListener('resize', this._onResize)
            this._onResize = null
        }
        // Destruir contenedores viejos del juego si existen para que no se dupliquen elementos en la siguiente partida
        if (this.mundoContenedor) {
            this.app.stage.removeChild(this.mundoContenedor);
            this.mundoContenedor.destroy({ children: true });
            this.mundoContenedor = null
        }
        if (this.interfazContenedor) {
            this.app.stage.removeChild(this.interfazContenedor);
            this.interfazContenedor.destroy({ children: true });
            this.interfazContenedor = null
        }

        this.hud = null
        this.jugador = null
        this.gatos = null
        this.sistemaDebug = null
        this.obstaculos = null

        // Resetear grilla para la nueva partida
        this.sistemaGrilla = new SistemaGrilla(this.tamañoCelda, this.ANCHO_MUNDO, this.ALTO_MUNDO);

        // Volver a mostrar el menú principal
        if (this.menu) {
            this.menu.mostrar();
        }
    }
    
    async cargarRecursos() {

        //===== [ CARGAR SONIDOS ] =====

        await Promise.all([
            audioManager.loadAudio('sfx_maullido_1', 'recursos/sonidos/gato1.mp3'),
            audioManager.loadAudio('sfx_maullido_2', 'recursos/sonidos/gato2.mp3'),
            audioManager.loadAudio('sfx_maullido_3', 'recursos/sonidos/gato3.mp3'),
            audioManager.loadAudio('sfx_maullido_4', 'recursos/sonidos/gato4.mp3'),
            audioManager.loadAudio('sfx_maullido_5', 'recursos/sonidos/gato5.mp3'),
            audioManager.loadAudio('sfx_menuApuntado', 'recursos/sonidos/menuApuntado.mp3'),
            audioManager.loadAudio('sfx_menuClickeado', 'recursos/sonidos/menuClickeado.mp3')
            //audioManager.loadAudio('bgm_musica', 'recursos/sonidos/soundtrack.wav')
        ])

        //===== [ AGREGAR FUENTE DE TEXTO (no estaría funcionando) ] ====

        PIXI.Assets.add({
            alias: 'Perfect',
            src: 'recursos/fuentePixelart.ttf'
        });

        //===== [ CARGAR IMÁGENES PNG, JSONS Y FUENTE A RECURSOS DE PIXI ] =====

        await PIXI.Assets.load([
            'recursos/sprites/jugador.json',
            'recursos/sprites/gato_gris.json',
            'recursos/sprites/gato_negro.json',
            'recursos/sprites/gato_blanco.json',
            'recursos/sprites/gato_violeta.json',
            'recursos/sprites/gato_naranja.json',
            'recursos/sprites/shiro.json',
            'recursos/sprites/afro-spritesheet.json',
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
            'recursos/sprites/banquito1.png',
            'recursos/sprites/items.png',
            'recursos/sprites/objetivo_temporizador.png',
            'recursos/sprites/panel.png',
            'recursos/sprites/intercambio_item.png',
            'recursos/sprites/globo.png',
            'recursos/sprites/patita_prota.png',
            'recursos/sprites/accesorios.json',
            'recursos/sprites/ganaste.png',
            'recursos/sprites/fondoMenu.png',
            'recursos/sprites/boton1.png',
            'recursos/sprites/boton1_seleccionado.png',
            'recursos/sprites/titulo_gatimercado.png',
            'Perfect',
            'recursos/sprites/mariposa_roja.png',
            'recursos/sprites/mariposa_rosa.png',
            'recursos/sprites/mariposa_verde.png',
            'recursos/sprites/mariposa_violeta.png',
            'recursos/sprites/sapito_amarillo.png',
            'recursos/sprites/sapito_gris.png',
            'recursos/sprites/sapito_naranja.png',
            'recursos/sprites/sapito_verde.png',
            'recursos/sprites/afro-spritesheet-sheet.png',
            'recursos/sprites/afro-spritesheet.json'
        ])
    }

    generarPartida() {
        this.generarInventarioInicial()
        this.generarObjetivo()
        this.generarCadenaVictoria()
        this.datos = {
            objetosIniciales: this.objetosIniciales,
            objetivo: catálogoObjetos[this.objetivo]
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

        for (let i = 0; i < this.intercambios.length; i++) {
            const intercambio = this.intercambios[i]

            const coloresNormales = ['gris', 'negro', 'blanco', 'naranja']
            const colorGato = (i === this.intercambios.length - 1) ? 'violeta' : coloresNormales[Math.floor(Math.random() * coloresNormales.length)]

            const gato = new GatiNPC(
                300 + i * 250,
                200,
                intercambio.da,
                intercambio.pide,
                this.jugador,
                this.ANCHO_MUNDO,
                this.ALTO_MUNDO,
                this.sistemaGrilla,
                colorGato  // <-- AGREGAR ESTE PARÁMETRO
            )

            gato.mostrarGloboIntercambios(intercambio.da, intercambio.pide)

            gato.alSeleccionar = () => {
                if (this.hud.menuIntercambio.visible) {
                    this.hud.menuIntercambio.cerrar()
                }
            }

            gato.alIniciarIntercambio = (gato) => {
                this.hud.menuIntercambio.abrir(gato)
                this.jugador.mefComportamiento.cambiarEstado('intercambio')
                this.reproducirMaullidoRandom()
            }

            gato.alCerrarIntercambio = () => {
                this.jugador.entidadObjetivo = null
                gato.mefComportamiento.cambiarEstado('espera')
                this.jugador.mefComportamiento.cambiarEstado('espera')
            }

            this.gatos.push(gato)
            this.mundoContenedor.addChild(gato.contenedor)
        }
    }

    reproducirMaullidoRandom() {
        const maullidosSonidos = [

        'sfx_maullido_1',
        'sfx_maullido_2',
        'sfx_maullido_3',
        'sfx_maullido_4',
        'sfx_maullido_5'
    ]
        const sonidoRandom = maullidosSonidos[Math.floor(Math.random() * maullidosSonidos.length)]
        audioManager.playBsm(sonidoRandom)
    }
   crearNPCsAmbiente() {
    this.npcsAmbiente = [];
    const tiposMariposa = ['roja', 'rosa', 'verde', 'violeta'];
    const tiposSapito = ['amarillo', 'gris', 'naranja', 'verde'];

    for (let i = 0; i < 15; i++) {
        const esMariposa = Math.random() > 0.5;
        const categoria = esMariposa ? 'mariposa' : 'sapito';
        const tipo = esMariposa ? 
            tiposMariposa[Math.floor(Math.random() * 4)] : 
            tiposSapito[Math.floor(Math.random() * 4)];
        
        const frames = esMariposa ? 4 : 15;
        
        // Sapitos: Z=1 (atrás), Velocidad=0.15 (más rápido)
        // Mariposas: Z=5000 (adelante), Velocidad=0.08 (más lento)
        const profundidad = esMariposa ? 5000 : 1;
        const animSpeed = esMariposa ? 0.08 : 0.15;

        const npc = new NPCAmbiente(
            Math.random() * this.ANCHO_MUNDO,
            Math.random() * this.ALTO_MUNDO,
            tipo,
            categoria,
            { x: this.ANCHO_MUNDO, y: this.ALTO_MUNDO },
            frames,
            profundidad,
            3,
            animSpeed
        );
        this.npcsAmbiente.push(npc);
        this.mundoContenedor.addChild(npc.contenedor);
    }
}
    crearObstaculos() {
        this.obstaculos = []
        const cantidadGrupitos = Math.floor(Math.random() * 2) + 2 
        const tiposComercios = ['comercio1', 'comercio2', 'comercio3']
        
        for (let g = 0; g < cantidadGrupitos; g++) {
            let posicionBase
            let intentos = 0
            const maxIntentos = 100
            
            do {
                posicionBase = generarPosicionRandom(this.sistemaGrilla, this.ANCHO_MUNDO, this.ALTO_MUNDO, 9)
                intentos++
            } while (verificarSuperposicion(posicionBase.x, posicionBase.y, 350, this.obstaculos, this.tamañoCelda) && intentos < maxIntentos)
            
            const separacionComercios = 180
            const ordenComercios = [...tiposComercios].sort(() => Math.random() - 0.5) 
            
            for (let i = 0; i < ordenComercios.length; i++) {
                const offsetX = (i - 1) * separacionComercios
                this.crearObstáculoEnPosicion(ordenComercios[i], posicionBase.x + offsetX, posicionBase.y)
            }
            
            const picnicX = posicionBase.x
            const picnicY = posicionBase.y + 160
            this.crearObstáculoEnPosicion('picnic', picnicX, picnicY)
        }
        
        const tiposArboles = ['arbol1', 'arbol2', 'arbol3']
        const totalArboles = Math.floor(Math.random() * 7) + 6 
        
        const esquinas = [
            { x: 100, y: 100 }, 
            { x: this.ANCHO_MUNDO - 100, y: 100 }, 
            { x: 100, y: this.ALTO_MUNDO - 100 }, 
            { x: this.ANCHO_MUNDO - 100, y: this.ALTO_MUNDO - 100 } 
        ]
        
        for (const esquina of esquinas) {
            const arbolesPorEsquina = Math.floor(Math.random() * 1) + 1
            for (let i = 0; i < arbolesPorEsquina; i++) {
                const tipoArbol = tiposArboles[Math.floor(Math.random() * tiposArboles.length)]
                const offsetX = (Math.random() - 0.5) * 200
                const offsetY = (Math.random() - 0.5) * 200
                const posicion = this.sistemaGrilla.clampAlMundo(esquina.x + offsetX, esquina.y + offsetY, 2)
                this.crearObstáculoEnPosicion(tipoArbol, posicion.x, posicion.y)
            }
        }
        
        for (let i = 0; i < totalArboles; i++) {
            const tipoArbol = tiposArboles[Math.floor(Math.random() * tiposArboles.length)]
            let posicionArbol
            let intentos = 0
            const maxIntentos = 200
            
            do {
                posicionArbol = generarPosicionRandom(this.sistemaGrilla, this.ANCHO_MUNDO, this.ALTO_MUNDO)
                intentos++
                
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
                
                if (!cercaDeComercio && !verificarSuperposicion(posicionArbol.x, posicionArbol.y, 100, this.obstaculos, this.tamañoCelda)) {
                break
                }
            } while (intentos < maxIntentos)
            
            this.crearObstáculoEnPosicion(tipoArbol, posicionArbol.x, posicionArbol.y)
        }
        
        for (let i = 0; i < 4; i++) {
            let posicionArbol4
            let intentos = 0
            const maxIntentos = 200
            
            do {
                posicionArbol4 = generarPosicionRandom(this.sistemaGrilla, this.ANCHO_MUNDO, this.ALTO_MUNDO)
                intentos++
            } while (verificarSuperposicion(posicionArbol4.x, posicionArbol4.y, 100, this.obstaculos, this.tamañoCelda) && intentos < maxIntentos)
            
            this.crearObstáculoEnPosicion('arbol4', posicionArbol4.x, posicionArbol4.y)
        }
        
        const totalBanquitos = Math.floor(Math.random() * 5) + 5 
        
        for (let i = 0; i < totalBanquitos; i++) {
            let posicionBanquito
            let intentos = 0
            const maxIntentos = 200
            
            do {
                posicionBanquito = generarPosicionRandom(this.sistemaGrilla, this.ANCHO_MUNDO, this.ALTO_MUNDO)
                intentos++
            } while (verificarSuperposicion(posicionBanquito.x, posicionBanquito.y, 100, this.obstaculos, this.tamañoCelda) && intentos < maxIntentos)
            
            this.crearObstáculoEnPosicion('banquito1', posicionBanquito.x, posicionBanquito.y)
        }

        this.sistemaGrilla.bloquearBordes()
    }

    crearObstáculoEnPosicion(tipo, x, y) {
        const datos = catálogoObstáculos[tipo]
        const centro = this.sistemaGrilla.snapAlCentro(x, y)

        const sprite = new PIXI.Sprite(PIXI.Assets.get(datos.imagen))
        sprite.anchor.set(0.5)
        sprite.scale.set(datos.escala)
        sprite.x = centro.x
        sprite.y = centro.y

        if (tipo === 'picnic') {
            sprite.zIndex = 0
        } else {
            sprite.zIndex = centro.y
        }

        this.mundoContenedor.addChild(sprite)
        const obstáculo = new Obstáculo(tipo, centro.x, centro.y, sprite, datos.celdasBloqueadas)
        obstáculo.registrarEnGrilla(this.sistemaGrilla)
        this.obstaculos.push(obstáculo)
    }

    crearEscena() {
        this.mundoContenedor = new PIXI.Container()
        this.mundoContenedor.sortableChildren = true
        this.app.stage.addChild(this.mundoContenedor)

        // Aseguramos que los menús queden siempre por encima del mundo del juego re-indexando
        this.app.stage.setChildIndex(this.mundoContenedor, 0);

        this.interfazContenedor = new PIXI.Container()
        this.app.stage.addChild(this.interfazContenedor)
        
        const texturaSuelo = PIXI.Assets.get('recursos/sprites/pastito.png')
        this.suelo = new PIXI.TilingSprite({
            texture: texturaSuelo,
            width: this.ANCHO_MUNDO,
            height: this.ALTO_MUNDO
        })
        this.suelo.eventMode = 'none'
        this.mundoContenedor.addChild(this.suelo)

        this.crearObstaculos()

        this.jugador = new Jugador(
            this.mundoContenedor,
            this.ANCHO_MUNDO,
            this.ALTO_MUNDO,
            this.sistemaGrilla
        )
        this.mundoContenedor.addChild(this.jugador.contenedor)
        
        this.accesorios = new Accesorios()
        this.accesorios.cargar()
        
        this.crearNPCs()
        this.crearNPCsAmbiente()
        
        this.hud = new HUD(this.app, this.datos, this.escalaUI)
        this.hud.menuIntercambio.spriteJugador.texture = this.jugador.texturaEspera
        this.interfazContenedor.addChild(this.hud.contenedor)

        this.jugador.inventario = this.hud.inventario
        
        this.sistemaDebug = new SistemaDebug(
            this.app,
            this.mundoContenedor,
            this.interfazContenedor,
            this.ANCHO_MUNDO,
            this.ALTO_MUNDO,
            this.obstaculos,
            this,
            this.sistemaGrilla
        )
        
        this.sistemaDebug.agregarOpcion(new OpcionMostrarGrilla(this.sistemaDebug))
        this.sistemaDebug.agregarOpcion(new OpcionEditarCeldas(this.sistemaDebug))
        this.sistemaDebug.agregarOpcion(new OpcionGuardarCeldas(this.sistemaDebug))
        this.sistemaDebug.agregarOpcion(new OpcionNoclip(this.sistemaDebug))
        this.sistemaDebug.agregarOpcion(new OpcionPausa(this.sistemaDebug))
    }

    centrarCámara() {
        const objetivoX = this.app.screen.width / 2 - this.jugador.contenedor.x
        const objetivoY = this.app.screen.height / 2 - this.jugador.contenedor.y
        const suavizado = 0.08

        this.mundoContenedor.x += (objetivoX - this.mundoContenedor.x) * suavizado
        this.mundoContenedor.y += (objetivoY - this.mundoContenedor.y) * suavizado

        this.mundoContenedor.x = Math.min(0, Math.max(this.mundoContenedor.x, this.app.screen.width - this.ANCHO_MUNDO))
        this.mundoContenedor.y = Math.min(0, Math.max(this.mundoContenedor.y, this.app.screen.height - this.ALTO_MUNDO))
    }

    crearEventos() {
        this._onResize = () => this.redimensionar()
        window.addEventListener('resize', this._onResize)

        this.app.stage.eventMode = 'static'
        this.app.stage.hitArea = this.app.screen

        this.app.stage.on('pointertap', (evento) => {
            this.clicMundo(evento)
        })

        this.sistemaTrucos = new SistemaTrucos()
        this.sistemaTrucos.registrarTruco('shiro', new TrucoShiro(this.jugador))
        this.sistemaTrucos.registrarTruco('afro', new TrucoAfro(this.jugador))
        this.sistemaTrucos.registrarTruco('dbg', new TrucoDebug(this.sistemaDebug))

        window.addEventListener('keydown', (evento) => {
            this.sistemaTrucos.procesarTecla(evento.key)
            // --- ATAJO PARA TESTEAR VICTORIA ---
        if ((evento.key === 'v' || evento.key === 'V') && this.estado === 'jugando') {
                this.ganarPartida()
            }
        })
        
    }



    clicMundo(evento) {
        if (this.estado !== 'jugando') return;
        if (this.sistemaDebug && this.sistemaDebug.edicionCeldasActiva) return
        
        if (this.hud && this.hud.menuIntercambio.visible) {
            this.hud.menuIntercambio.cerrar()
            return
        }

        if (evento.target !== this.app.stage) return
        
        const puntoEnMundo = this.mundoContenedor.toLocal(evento.global)
        const grillaPos = this.sistemaGrilla.mundoAGrilla(puntoEnMundo.x, puntoEnMundo.y)
        
        let destinoFinal = puntoEnMundo
        
        if (this.sistemaGrilla.estaBloqueada(grillaPos.x, grillaPos.y)) {
            destinoFinal = this.sistemaGrilla.encontrarCeldaAccesibleMásCercana(puntoEnMundo.x, puntoEnMundo.y)
        }

        this.jugador.irHacia(destinoFinal)
    }

    actualizar(delta) {
        // Si el estado es de victoria o menú, nos aseguramos de que las interfaces superiores respondan si hay redimensionamiento
        if (this.estado !== 'jugando') return;

        // Sumar tiempo transcurrido basándonos en el Ticker de PixiJS (convirtiendo los frames calculados a segundos)
        // app.ticker.elapsedMS nos da los milisegundos exactos desde el último frame
        this.cronometro += this.app.ticker.elapsedMS / 1000;

        if (this.sistemaDebug) {
            this.sistemaDebug.actualizarNoclip()
        }
        
        if (!this.sistemaDebug || !this.sistemaDebug.pausaActiva) {
            this.jugador.actualizar(delta)
            this.jugador.contenedor.zIndex = this.jugador.contenedor.y
            for (const gato of this.gatos) {
                gato.contenedor.zIndex = gato.contenedor.y
                gato.actualizar(delta)
            }
        if (this.npcsAmbiente && this.npcsAmbiente.length > 0) {
            for (const npc of this.npcsAmbiente) {
                npc.actualizar(delta)
            }
        }
            this.hud.actualizar(delta)

            if (!this.sistemaDebug || !this.sistemaDebug.noclipActivo) {
                this.centrarCámara()
            }
        }
    }

    redimensionar() {
        this.app.renderer.resize(
            window.innerWidth,
            window.innerHeight
        )

        if (this.menu) {
            this.menu.redimensionar(window.innerWidth, window.innerHeight);
        }

        if (this.pantallaVictoria) {
            this.pantallaVictoria.redimensionar(window.innerWidth, window.innerHeight);
        }

        if (this.estado !== 'menu' && this.interfazContenedor) {
            this.interfazContenedor.scale.set(this.escalaUI);
        }

        diseño.ancho = window.innerWidth / this.escalaUI
        diseño.alto = window.innerHeight / this.escalaUI
        
        if (this.estado !== 'menu' && this.hud) {
            this.hud.redimensionar()
        }
    }
}

const juego = new Juego()