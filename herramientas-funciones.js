import * as PIXI from "./pixi.js"
import { catálogoObstáculos } from "./obstaculos.js"

// Para spritesheets
export function cortarFrames(rutaImagen, cantidadDeFrames, anchoFrame, offsetY = 0) {
    const frames = [];
    for (let i = 0; i < cantidadDeFrames; i++) {
        frames.push(new PIXI.Texture({
            source: rutaImagen,
            frame: new PIXI.Rectangle(i * anchoFrame, offsetY, anchoFrame, anchoFrame)
        }));
    }
    return frames;
}

export function cortarGrilla(textura, anchoFrame, altoFrame, columnas, filas) {
    const frames = [];
    for (let fila = 0; fila < filas; fila++) {
        const framesDeFila = cortarFrames(textura, columnas, anchoFrame, fila * altoFrame);
        frames.push(...framesDeFila);
    }
    return frames;
}

// Para listas
export function mezclar(lista) {
    // Algoritmo Fisher-Yates, el estándar para esto
    for (let i = lista.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lista[i], lista[j]] = [lista[j], lista[i]];
    }
    return lista;
}

// Sistema de trucos estilo GTA
export class SistemaTrucos {
    constructor() {
        this.trucos = new Map()
        this.teclasPresionadas = []
        this.tiempoMaximoEntreTeclas = 1000 // ms
        this.ultimoTiempoTecla = 0
    }

    registrarTruco(codigo, instanciaTruco) {
        this.trucos.set(codigo, instanciaTruco)
    }

    procesarTecla(tecla) {
        const ahora = Date.now()
        
        // Si pasó mucho tiempo, resetear
        if (ahora - this.ultimoTiempoTecla > this.tiempoMaximoEntreTeclas) {
            this.teclasPresionadas = []
        }
        
        this.teclasPresionadas.push(tecla.toLowerCase())
        this.ultimoTiempoTecla = ahora
        
        // Verificar si alguna combinación coincide
        for (const [codigo, truco] of this.trucos) {
            const ultimasTeclas = this.teclasPresionadas.slice(-codigo.length)
            if (ultimasTeclas.join('') === codigo) {
                truco.alternar()
                this.teclasPresionadas = [] // Resetear después de activar
                console.log(`¡Truco alternado: ${truco.descripcion}!`)
                return true
            }
        }
        
        return false
    }
}

// Clase base para trucos con capacidad de alternar
export class Truco {
    constructor(descripcion) {
        this.activo = false
        this.descripcion = descripcion
    }

    alternar() {
        if (this.activo) {
            this.desactivar()
            this.activo = false
        } else {
            this.activar()
            this.activo = true
        }
    }

    activar() {
        this.ejecutar()
    }

    desactivar() {
        // Implementación opcional en subclases
    }

    ejecutar() {
        throw new Error('El método ejecutar debe ser implementado por la subclase')
    }
}

// Truco específico para cambiar la skin de Shiro
export class TrucoShiro extends Truco {
    constructor(jugador) {
        super('Skin especial de Shiro')
        this.jugador = jugador
    }

    ejecutar() {
        if (this.jugador.skinActual === 'default') {
            this.jugador.cambiarSkin('recursos/sprites/shiro.json')
        } else {
            this.jugador.restaurarSkinDefault()
        }
    }
}

// Truco específico para cambiar la skin de Afro
export class TrucoAfro extends Truco {
    constructor(jugador) {
        super('Skin especial de Afro')
        this.jugador = jugador
    }

    ejecutar() {
        if (this.jugador.skinActual === 'default') {
            this.jugador.cambiarSkin('recursos/sprites/afro-spritesheet.json')
        } else {
            this.jugador.restaurarSkinDefault()
        }
    }
}

// Truco para activar/desactivar el modo debug
export class TrucoDebug extends Truco {
    constructor(sistemaDebug) {
        super('Modo Debug')
        this.sistemaDebug = sistemaDebug
    }

    ejecutar() {
        this.sistemaDebug.alternar()
    }
}

// Clase base para opciones de debug
export class OpcionDebug {
    constructor(nombre, emojiActivo = '✅', emojiInactivo = '❎') {
        this.nombre = nombre
        this.activo = false
        this.emojiActivo = emojiActivo
        this.emojiInactivo = emojiInactivo
    }

    alternar() {
        if (this.activo) {
            this.desactivar()
            this.activo = false
        } else {
            this.activar()
            this.activo = true
        }
    }

    activar() {
        throw new Error('El método activar debe ser implementado por la subclase')
    }

    desactivar() {
        throw new Error('El método desactivar debe ser implementado por la subclase')
    }

    obtenerEmoji() {
        return this.activo ? this.emojiActivo : this.emojiInactivo
    }
}

// Opción para mostrar/ocultar la grilla de pathfinding
export class OpcionMostrarGrilla extends OpcionDebug {
    constructor(sistemaDebug) {
        super('Mostrar Grilla')
        this.sistemaDebug = sistemaDebug
    }

    activar() {
        this.sistemaDebug.mostrarGrilla()
    }

    desactivar() {
        this.sistemaDebug.ocultarGrilla()
    }
}

// Opción para editar celdas manualmente
export class OpcionEditarCeldas extends OpcionDebug {
    constructor(sistemaDebug) {
        super('Editar Celdas')
        this.sistemaDebug = sistemaDebug
    }

    activar() {
        this.sistemaDebug.habilitarEdicionCeldas()
    }

    desactivar() {
        this.sistemaDebug.deshabilitarEdicionCeldas()
    }
}

// Opción para modo noclip (cámara libre)
export class OpcionNoclip extends OpcionDebug {
    constructor(sistemaDebug) {
        super('Noclip')
        this.sistemaDebug = sistemaDebug
    }

    activar() {
        this.sistemaDebug.activarNoclip()
    }

    desactivar() {
        this.sistemaDebug.desactivarNoclip()
    }
}

// Opción para pausar el juego
export class OpcionPausa extends OpcionDebug {
    constructor(sistemaDebug) {
        super('Pausa')
        this.sistemaDebug = sistemaDebug
    }

    activar() {
        this.sistemaDebug.pausarJuego()
    }

    desactivar() {
        this.sistemaDebug.reanudarJuego()
    }
}

// Opción para guardar celdas modificadas manualmente
export class OpcionGuardarCeldas extends OpcionDebug {
    constructor(sistemaDebug) {
        super('Guardar Celdas', '💾', '💾')
        this.sistemaDebug = sistemaDebug
    }

    activar() {
        this.sistemaDebug.guardarCeldasModificadas()
    }

    desactivar() {
        // No hace nada, es un botón de acción
    }
}

// Sistema de debug completo
export class SistemaDebug {
    constructor(app, mundoContenedor, interfazContenedor, anchoMundo, altoMundo, obstaculos, juego, sistemaGrilla) {
        this.app = app
        this.mundoContenedor = mundoContenedor
        this.interfazContenedor = interfazContenedor
        this.anchoMundo = anchoMundo
        this.altoMundo = altoMundo
        this.obstaculos = obstaculos
        this.juego = juego
        this.sistemaGrilla = sistemaGrilla
        this.tiposObstaculos = ['comercio1', 'comercio2', 'comercio3', 'arbol1', 'arbol2', 'arbol3', 'arbol4', 'picnic', 'banquito1']
        this.indiceTipoActual = 0
        this.tipoEnEdicion = null
        this.posicionEdicion = null
        this.etiquetaTipo = null
        this.arrastrando = false
        this.accionArrastre = null // 'bloquear' o 'desbloquear'
        this.ultimaCeldaArrastre = null
        
        this.activo = false
        this.opciones = []
        this.grillaGraphics = null
        this.posicionesOriginalesObstaculos = []
        this.velocidadCamara = 20
        this.panelContenedor = null
        
        this.noclipActivo = false
        this.pausaActiva = false
        this.edicionCeldasActiva = false
        
        this.teclasPresionadas = new Set()
    }

    alternar() {
        this.activo = !this.activo
        
        if (this.activo) {
            this.crearPanel()
        } else {
            this.destruirPanel()
            // Desactivar todas las opciones
            for (const opcion of this.opciones) {
                if (opcion.activo) {
                    opcion.alternar()
                }
            }
        }
    }

    agregarOpcion(opcion) {
        this.opciones.push(opcion)
    }

    crearPanel() {
        this.panelContenedor = new PIXI.Container()
        this.panelContenedor.x = 10
        this.panelContenedor.y = 10
        
        let offsetY = 0
        for (const opcion of this.opciones) {
            const texto = new PIXI.Text(`${opcion.obtenerEmoji()} ${opcion.nombre}`, {
                fontFamily: 'Arial',
                fontSize: 16,
                fill: 0xFFFFFF,
                stroke: 0x000000,
                strokeThickness: 3
            })
            texto.y = offsetY
            texto.eventMode = 'static'
            texto.cursor = 'pointer'
            texto.on('pointerdown', () => {
                opcion.alternar()
                this.actualizarPanel()
            })
            
            this.panelContenedor.addChild(texto)
            offsetY += 25
        }
        
        this.interfazContenedor.addChild(this.panelContenedor)
    }

    destruirPanel() {
        if (this.panelContenedor) {
            this.interfazContenedor.removeChild(this.panelContenedor)
            this.panelContenedor.destroy()
            this.panelContenedor = null
        }
    }

    actualizarPanel() {
        if (!this.panelContenedor) return
        
        let i = 0
        for (const child of this.panelContenedor.children) {
            if (i < this.opciones.length) {
                child.text = `${this.opciones[i].obtenerEmoji()} ${this.opciones[i].nombre}`
                i++
            }
        }
    }

    mostrarGrilla() {
        if (this.grillaGraphics) return
        
        this.grillaGraphics = new PIXI.Graphics()
        this.dibujarGrilla()
        this.mundoContenedor.addChild(this.grillaGraphics)
    }

    ocultarGrilla() {
        if (this.grillaGraphics) {
            this.mundoContenedor.removeChild(this.grillaGraphics)
            this.grillaGraphics.destroy()
            this.grillaGraphics = null
        }
    }

    dibujarGrilla() {
        if (!this.grillaGraphics) return
        this.grillaGraphics.clear()

        const tamañoCelda = this.sistemaGrilla.tamañoCelda
        const anchoGrilla = Math.ceil(this.anchoMundo / tamañoCelda)
        const altoGrilla = Math.ceil(this.altoMundo / tamañoCelda)

        for (let x = 0; x < anchoGrilla; x++) {
            for (let y = 0; y < altoGrilla; y++) {
                const mundoX = x * tamañoCelda
                const mundoY = y * tamañoCelda
                const bloqueada = this.sistemaGrilla.estaBloqueada(x, y)

                this.grillaGraphics
                    .rect(mundoX, mundoY, tamañoCelda, tamañoCelda)
                    .fill({ color: bloqueada ? 0xFF0000 : 0xFFFFFF, alpha: bloqueada ? 0.5 : 0.3 })
                    .rect(mundoX, mundoY, tamañoCelda, tamañoCelda)
                    .stroke({ width: 2, color: 0x000000, alpha: 0.8 })
            }
        }
    }

    actualizarGrilla() {
        this.dibujarGrilla()
    }

    habilitarEdicionCeldas() {
        this.edicionCeldasActiva = true
        this.guardarEstadoOriginalObstaculos()
        this.eliminarObstaculosActuales()
        this.mostrarSoloObstaculoActual()

        window.addEventListener('keydown', this.manejarTeclaCambiarTipo)

        if (this.grillaGraphics) {
            this.grillaGraphics.eventMode = 'static'
            this.grillaGraphics.hitArea = new PIXI.Rectangle(0, 0, this.anchoMundo, this.altoMundo)
            this.grillaGraphics.on('pointerdown', (evento) => this.manejarPointerDown(evento))
            this.grillaGraphics.on('pointermove', (evento) => this.manejarPointerMove(evento))
        }

        // pointerup en window, no en grillaGraphics: si soltás el mouse
        // afuera de la grilla, igual tiene que cortar el arrastre
        window.addEventListener('pointerup', this.manejarPointerUp)
    }

    deshabilitarEdicionCeldas() {
        this.edicionCeldasActiva = false
        this.eliminarObstaculosActuales()
        this.restaurarEstadoOriginalObstaculos()
        this.tipoEnEdicion = null
        this.actualizarEtiquetaTipo()

        window.removeEventListener('keydown', this.manejarTeclaCambiarTipo)
        window.removeEventListener('pointerup', this.manejarPointerUp)

        if (this.grillaGraphics) {
            this.grillaGraphics.eventMode = 'none'
            this.grillaGraphics.off('pointerdown')
            this.grillaGraphics.off('pointermove')
        }
    }

    manejarPointerDown(evento) {
        if (!this.edicionCeldasActiva) return

        const grillaPos = this.obtenerCeldaDesdeEvento(evento)

        // La primera celda define si este arrastre bloquea o desbloquea
        this.accionArrastre = this.sistemaGrilla.estaBloqueada(grillaPos.x, grillaPos.y)
            ? 'desbloquear'
            : 'bloquear'

        this.arrastrando = true
        this.aplicarAccionEnCelda(grillaPos)
    }

    manejarPointerMove(evento) {
        if (!this.edicionCeldasActiva || !this.arrastrando) return

        const grillaPos = this.obtenerCeldaDesdeEvento(evento)
        this.aplicarAccionEnCelda(grillaPos)
    }

    manejarPointerUp = () => {
        this.arrastrando = false
        this.accionArrastre = null
        this.ultimaCeldaArrastre = null
    }

    obtenerCeldaDesdeEvento(evento) {
        const puntoLocal = this.grillaGraphics.toLocal(evento.global)
        return this.sistemaGrilla.mundoAGrilla(puntoLocal.x, puntoLocal.y)
    }

    aplicarAccionEnCelda(grillaPos) {
        const clave = `${grillaPos.x},${grillaPos.y}`

        // Evitar re-procesar la misma celda si el mouse no se movió a una nueva
        if (clave === this.ultimaCeldaArrastre) return
        this.ultimaCeldaArrastre = clave

        if (this.accionArrastre === 'bloquear') {
            this.sistemaGrilla.bloquearCelda(grillaPos.x, grillaPos.y)
        } else {
            this.sistemaGrilla.desbloquearCelda(grillaPos.x, grillaPos.y)
        }

        this.actualizarGrilla()
    }

    guardarEstadoOriginalObstaculos() {
        this.estadoOriginalObstaculos = this.obstaculos.map(obs => ({
            x: obs.x,
            y: obs.y
        }))
    }

    eliminarObstaculosActuales() {
        // Eliminar sprites del contenedor
        for (const obstaculo of this.obstaculos) {
            this.mundoContenedor.removeChild(obstaculo.sprite)
            obstaculo.sprite.destroy()
        }
        
        // Limpiar array de obstáculos
        this.obstaculos.length = 0
        
        // Limpiar celdas bloqueadas de la grilla (excepto bordes)
        this.sistemaGrilla.celdasBloqueadas.clear()
        this.sistemaGrilla.bloquearBordes()
    }

    mostrarSoloObstaculoActual() {
        const tipo = this.tiposObstaculos[this.indiceTipoActual]
        const centroX = Math.floor(this.anchoMundo / 2)
        const centroY = Math.floor(this.altoMundo / 2)

        this.crearObstaculoEnPosicion(tipo, centroX, centroY)

        this.tipoEnEdicion = tipo
        this.posicionEdicion = { x: centroX, y: centroY }
        this.actualizarEtiquetaTipo()
    }

    crearObstaculoEnPosicion(tipo, x, y) {
        const datos = catálogoObstáculos[tipo]
        const sprite = new PIXI.Sprite(PIXI.Assets.get(datos.imagen))
        sprite.anchor.set(0.5)
        sprite.scale.set(datos.escala)
        sprite.x = x
        sprite.y = y
        sprite.zIndex = tipo === 'picnic' ? 0 : y

        this.mundoContenedor.addChild(sprite)

        const obstáculo = {
            tipo, x, y, sprite,
            celdasBloqueadas: datos.celdasBloqueadas,
            registrarEnGrilla: (sistemaGrilla) => {
                const grillaPos = sistemaGrilla.mundoAGrilla(x, y)
                for (const celdaRelativa of datos.celdasBloqueadas) {
                    sistemaGrilla.bloquearCelda(grillaPos.x + celdaRelativa.x, grillaPos.y + celdaRelativa.y)
                }
            }
        }
        obstáculo.registrarEnGrilla(this.sistemaGrilla)
        this.obstaculos.push(obstáculo)
    }

    actualizarEtiquetaTipo() {
        if (!this.panelContenedor) return

        if (!this.etiquetaTipo) {
            this.etiquetaTipo = new PIXI.Text('', {
                fontFamily: 'Arial',
                fontSize: 14,
                fill: 0xFFFF00,
                stroke: 0x000000,
                strokeThickness: 2
            })
            this.etiquetaTipo.y = this.opciones.length * 25 + 10
            this.panelContenedor.addChild(this.etiquetaTipo)
        }

        this.etiquetaTipo.text = this.tipoEnEdicion
            ? `Editando: ${this.tipoEnEdicion} (Q/E para cambiar)`
            : ''
    }

    cambiarTipoObstaculo(direccion) {
        this.indiceTipoActual = (this.indiceTipoActual + direccion + this.tiposObstaculos.length) % this.tiposObstaculos.length

        this.sistemaGrilla.celdasBloqueadas.clear()
        this.sistemaGrilla.bloquearBordes()

        this.eliminarObstaculosActuales()
        this.mostrarSoloObstaculoActual()
        this.actualizarGrilla()
    }

    manejarTeclaCambiarTipo = (evento) => {
        if (!this.edicionCeldasActiva) return
        if (evento.key === 'q') this.cambiarTipoObstaculo(-1)
        if (evento.key === 'e') this.cambiarTipoObstaculo(1)
    }

    restaurarEstadoOriginalObstaculos() {
        for (const original of this.estadoOriginalObstaculos) {
            const datos = catálogoObstáculos[original.tipo]
            
            const sprite = new PIXI.Sprite(PIXI.Assets.get(datos.imagen))
            sprite.anchor.set(0.5)
            sprite.scale.set(datos.escala)
            sprite.x = original.x
            sprite.y = original.y
            
            if (original.tipo === 'picnic') {
                sprite.zIndex = 0
            } else {
                sprite.zIndex = original.y
            }
            
            this.mundoContenedor.addChild(sprite)
            
            const obstáculo = {
                tipo: original.tipo,
                x: original.x,
                y: original.y,
                sprite: sprite,
                celdasBloqueadas: datos.celdasBloqueadas,
                registrarEnGrilla: (sistemaGrilla) => {
                    const grillaPos = sistemaGrilla.mundoAGrilla(original.x, original.y)
                    for (const celdaRelativa of datos.celdasBloqueadas) {
                        const celdaAbsolutaX = grillaPos.x + celdaRelativa.x
                        const celdaAbsolutaY = grillaPos.y + celdaRelativa.y
                        sistemaGrilla.bloquearCelda(celdaAbsolutaX, celdaAbsolutaY)
                    }
                }
            }
            
            obstáculo.registrarEnGrilla(this.sistemaGrilla)
            this.obstaculos.push(obstáculo)
        }
        
        this.estadoOriginalObstaculos = []
    }

    guardarCeldasModificadas() {
        if (!this.tipoEnEdicion) {
            console.log('No hay ningún obstáculo en edición para exportar')
            return
        }

        const grillaPos = this.sistemaGrilla.mundoAGrilla(this.posicionEdicion.x, this.posicionEdicion.y)
        const tamañoCelda = this.sistemaGrilla.tamañoCelda
        const anchoGrilla = Math.ceil(this.anchoMundo / tamañoCelda)
        const altoGrilla = Math.ceil(this.altoMundo / tamañoCelda)

        const celdasRelativas = []
        for (const clave of this.sistemaGrilla.celdasBloqueadas) {
            const [x, y] = clave.split(',').map(Number)
            const esBorde = x === 0 || y === 0 || x === anchoGrilla - 1 || y === altoGrilla - 1
            if (esBorde) continue
            celdasRelativas.push({ x: x - grillaPos.x, y: y - grillaPos.y })
        }

        const codigoGenerado = `${this.tipoEnEdicion}: {\n    celdasBloqueadas: ${JSON.stringify(celdasRelativas)}\n}`
        console.log(codigoGenerado)
        navigator.clipboard.writeText(codigoGenerado)
        console.log('Copiado al portapapeles ✅ — pegalo en catálogoObstáculos')
    }

    activarNoclip() {
        this.noclipActivo = true
        this.teclasPresionadas.clear()
        
        window.addEventListener('keydown', this.manejarTeclaNoclip)
        window.addEventListener('keyup', this.manejarTeclaNoclip)
    }

    desactivarNoclip() {
        this.noclipActivo = false
        
        window.removeEventListener('keydown', this.manejarTeclaNoclip)
        window.removeEventListener('keyup', this.manejarTeclaNoclip)
    }

    manejarTeclaNoclip = (evento) => {
        if (!this.noclipActivo) return
        
        if (evento.type === 'keydown') {
            this.teclasPresionadas.add(evento.key)
        } else {
            this.teclasPresionadas.delete(evento.key)
        }
    }

    actualizarNoclip() {
        if (!this.noclipActivo) return
        
        let dx = 0
        let dy = 0
        
        if (this.teclasPresionadas.has('ArrowDown')) dy -= this.velocidadCamara
        if (this.teclasPresionadas.has('ArrowUp')) dy += this.velocidadCamara
        if (this.teclasPresionadas.has('ArrowRight')) dx -= this.velocidadCamara
        if (this.teclasPresionadas.has('ArrowLeft')) dx += this.velocidadCamara
        
        if (dx !== 0 || dy !== 0) {
            this.mundoContenedor.x += dx
            this.mundoContenedor.y += dy
            
            // Limitar cámara
            this.mundoContenedor.x = Math.min(
                0,
                Math.max(this.mundoContenedor.x, this.app.screen.width - this.anchoMundo)
            )
            this.mundoContenedor.y = Math.min(
                0,
                Math.max(this.mundoContenedor.y, this.app.screen.height - this.altoMundo)
            )
        }
    }

    pausarJuego() {
        this.pausaActiva = true
        // No detener el ticker, solo usar flag para detener lógica del juego
    }

    reanudarJuego() {
        this.pausaActiva = false
    }
}