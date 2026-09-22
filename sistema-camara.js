export class SistemaCamara {
    constructor(app, mundoContenedor, anchoMundo, altoMundo) {
        this.app = app
        this.mundoContenedor = mundoContenedor
        this.anchoMundo = anchoMundo
        this.altoMundo = altoMundo

        this.modo = 'siguiendoJugador' // 'siguiendoJugador' | 'libre'
        this.suavizado = 0.08

        // --- Edge scroll ---
        this.PROPORCION_MARGEN = 0.25 // la zona de borde ocupa un cuarto del lado más chico de la pantalla
        this.margenBorde = this._calcularMargenBorde()
        this.velocidadBorde = 10    // px por frame, a máxima velocidad justo en el borde

        // --- Bloqueo: por defecto la cámara queda fijada al jugador y el edge scroll no hace nada.
        // El botón del HUD alterna esto con alternarBloqueo().
        this.bloqueada = true

        // --- Arrastre (preparado, todavía apagado — activarlo con arrastreHabilitado = true
        // cuando se distinga clic corto (mover) de clic sostenido+arrastre (cámara)) ---
        this.arrastreHabilitado = false
        this.arrastrando = false
        this.ultimoPuntero = { x: 0, y: 0 }

        this.ultimaPosicionPuntero = null
        this.objetivo = { x: 0, y: 0 }

        // Se dispara cuando cambia this.bloqueada, para que el botón del HUD refleje el modo actual
        this.alCambiarBloqueo = null
    }

    activarEventos() {
        this.app.stage.on('pointermove', (evento) => {
            this.ultimaPosicionPuntero = { x: evento.global.x, y: evento.global.y }

            if (this.arrastreHabilitado && this.arrastrando) {
                const dx = evento.global.x - this.ultimoPuntero.x
                const dy = evento.global.y - this.ultimoPuntero.y
                this.objetivo.x += dx
                this.objetivo.y += dy
                this.ultimoPuntero = { x: evento.global.x, y: evento.global.y }
                this._pasarAModoLibre()
            }
        })
    }

    // Enganchar a mano desde donde se termine resolviendo clic-corto-vs-arrastre
    empezarArrastre(puntero) {
        if (!this.arrastreHabilitado) return
        this.arrastrando = true
        this.ultimoPuntero = { x: puntero.x, y: puntero.y }
    }

    terminarArrastre() {
        this.arrastrando = false
    }

    // Llamar desde el botón del HUD
    alternarBloqueo() {
        this.bloqueada = !this.bloqueada
        if (this.bloqueada) this.recentrar()
        if (this.alCambiarBloqueo) this.alCambiarBloqueo(this.bloqueada)
    }

    recentrar() {
        this.modo = 'siguiendoJugador'
    }

    // Llamar desde Juego.redimensionar(), igual que se hace con hud/menu/pantallaVictoria
    redimensionar() {
        this.margenBorde = this._calcularMargenBorde()
    }

    actualizar(jugador) {
        if (!this.bloqueada && this.modo === 'siguiendoJugador' && this._estaEnBorde()) {
            // El mouse llegó al borde: soltamos la cámara desde donde está parada ahora mismo
            this.objetivo.x = this.mundoContenedor.x
            this.objetivo.y = this.mundoContenedor.y
            this._pasarAModoLibre()
        }

        if (this.bloqueada || this.modo === 'siguiendoJugador') {
            this.objetivo.x = this.app.screen.width / 2 - jugador.contenedor.x
            this.objetivo.y = this.app.screen.height / 2 - jugador.contenedor.y
        } else {
            this._actualizarEdgeScroll()
        }

        this.mundoContenedor.x += (this.objetivo.x - this.mundoContenedor.x) * this.suavizado
        this.mundoContenedor.y += (this.objetivo.y - this.mundoContenedor.y) * this.suavizado

        this._clamp()
    }

    _calcularMargenBorde() {
        return Math.min(this.app.screen.width, this.app.screen.height) * this.PROPORCION_MARGEN
    }

    _pasarAModoLibre() {
        if (this.bloqueada) return // por las dudas — el drag también debería respetar el bloqueo
        if (this.modo === 'libre') return
        this.modo = 'libre'
    }

    _estaEnBorde() {
        if (!this.ultimaPosicionPuntero || this.arrastrando) return false

        const { x, y } = this.ultimaPosicionPuntero
        const { width, height } = this.app.screen

        return x < this.margenBorde || x > width - this.margenBorde ||
               y < this.margenBorde || y > height - this.margenBorde
    }

    _actualizarEdgeScroll() {
        if (this.arrastrando || !this.ultimaPosicionPuntero) return

        const { x, y } = this.ultimaPosicionPuntero
        const { width, height } = this.app.screen

        let dx = 0
        let dy = 0

        if (x < this.margenBorde) dx = -this._velocidadEnBorde(x)
        else if (x > width - this.margenBorde) dx = this._velocidadEnBorde(width - x)

        if (y < this.margenBorde) dy = -this._velocidadEnBorde(y)
        else if (y > height - this.margenBorde) dy = this._velocidadEnBorde(height - y)

        this.objetivo.x -= dx
        this.objetivo.y -= dy
    }

    _velocidadEnBorde(distanciaAlBorde) {
        const proporcion = 1 - Math.max(0, distanciaAlBorde) / this.margenBorde
        return this.velocidadBorde * proporcion
    }

    _clamp() {
        this.mundoContenedor.x = Math.min(0, Math.max(this.mundoContenedor.x, this.app.screen.width - this.anchoMundo))
        this.mundoContenedor.y = Math.min(0, Math.max(this.mundoContenedor.y, this.app.screen.height - this.altoMundo))
        this.objetivo.x = Math.min(0, Math.max(this.objetivo.x, this.app.screen.width - this.anchoMundo))
        this.objetivo.y = Math.min(0, Math.max(this.objetivo.y, this.app.screen.height - this.altoMundo))
    }
}
