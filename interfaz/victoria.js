import * as PIXI from '../pixi.js';

export class PantallaVictoria {
    constructor(ancho, alto, alReiniciar) {
        this.contenedor = new PIXI.Container();
        this.ancho = ancho;
        this.alto = alto;
        this.alReiniciar = alReiniciar;

        this.claveLocalStorage = 'record_tiempos_gatitos';
        this.ocultar();
    }

    procesarTiempoPartida(tiempoActual) {
        let tiempos = [];
        const datosGuardados = localStorage.getItem(this.claveLocalStorage);
        if (datosGuardados) {
            tiempos = JSON.parse(datosGuardados);
        }

        tiempos.push(tiempoActual);
        tiempos.sort((a, b) => a - b);
        // Límite cambiado a 5
        this.topTiempos = tiempos.slice(0, 5); 
        localStorage.setItem(this.claveLocalStorage, JSON.stringify(this.topTiempos));

        this.crearInterfaz(tiempoActual);
    }

    formatearTiempo(segundosTotales) {
        const minutos = Math.floor(segundosTotales / 60);
        const segundos = Math.floor(segundosTotales % 60);
        return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    }

    crearInterfaz(tiempoActual) {
        this.contenedor.removeChildren();

        // Fondo oscuro
        const texturaFondo = PIXI.Assets.get('recursos/sprites/fondoMenu.png')
        const fondo = new PIXI.Sprite(texturaFondo);
        fondo.anchor.set(0.5)
        fondo.x = this.ancho / 2
        fondo.y = this.alto / 2
        this.contenedor.addChild(fondo);



        const estiloSub = new PIXI.TextStyle({ fontFamily: 'Arial', fontSize: 24, fill: '#000000' });
        const estiloPodio = new PIXI.TextStyle({ fontFamily: 'Arial', fontSize: 20, fill: '#000000' });
        const estiloDestacado = new PIXI.TextStyle({ fontFamily: 'Arial', fontSize: 20, fill: '#ae0909', fontWeight: 'bold' });

        // 1. Imagen de Ganaste
        const texturaGanaste = PIXI.Assets.get('recursos/sprites/ganaste.png')
        const imagenVictoria = new PIXI.Sprite(texturaGanaste);
        imagenVictoria.anchor.set(0.5); 
        imagenVictoria.x = this.ancho / 2;
        imagenVictoria.y = 200; 
        imagenVictoria.scale.set(5); 
        this.contenedor.addChild(imagenVictoria);

        // 2. Tiempo de esta partida
        const textoTuTiempo = new PIXI.Text({ 
            text: `Tu tiempo: ${this.formatearTiempo(tiempoActual)}`, 
            style: estiloSub 
        });
        textoTuTiempo.anchor.set(0.5);
        textoTuTiempo.x = this.ancho / 2;
        textoTuTiempo.y = 410; 
        this.contenedor.addChild(textoTuTiempo);

        // 3. Subtítulo del podio (Texto actualizado a TOP 5)
        const tituloPodio = new PIXI.Text({ text: '🏆 TOP 5 MEJORES TIEMPOS 🏆', style: estiloSub });
        tituloPodio.anchor.set(0.5);
        tituloPodio.x = this.ancho / 2;
        tituloPodio.y = 450; 
        this.contenedor.addChild(tituloPodio);

        // 4. Lista del Podio
        let inicioY = 490; 
        this.topTiempos.forEach((tiempo, indice) => {
            const posicion = indice + 1;
            
            let estiloFila = estiloPodio;
            let prefijo = '';
            if (posicion === 1) prefijo = '🥇 ';
            else if (posicion === 2) prefijo = '🥈 ';
            else if (posicion === 3) prefijo = '🥉 ';

            let textoFila = `${prefijo}#${posicion} - ${this.formatearTiempo(tiempo)}`;
            if (tiempo === tiempoActual) {
                estiloFila = estiloDestacado;
                textoFila += ' ¡Tu récord actual!';
            }

            const elementoPodio = new PIXI.Text({ text: textoFila, style: estiloFila });
            elementoPodio.anchor.set(0.5);
            elementoPodio.x = this.ancho / 2;
            elementoPodio.y = inicioY + (indice * 30); 
            this.contenedor.addChild(elementoPodio);
        });

        // 5. Botón Volver a Jugar
        const contenedorBoton = new PIXI.Container();
        contenedorBoton.x = this.ancho / 2;
        contenedorBoton.y = this.alto - 60;

        const fondoBoton = new PIXI.NineSliceSprite({
            texture: PIXI.Assets.get('recursos/sprites/panel.png'),
            leftWidth: 10,
            rightWidth: 10,
            topHeight: 10,
            bottomHeight: 21
        })
        fondoBoton.anchor.set(0.5)

        const estiloBoton = new PIXI.TextStyle({ fontFamily: 'Arial', fontSize: 24, fill: '#d06004', fontWeight: 'bold' });
        const textoBoton = new PIXI.Text({ text: 'VOLVER A JUGAR', style: estiloBoton });
        textoBoton.anchor.set(0.5);
        fondoBoton.width = textoBoton.width + 20
        fondoBoton.height = textoBoton.height + 20
        fondoBoton.x = textoBoton.x
        fondoBoton.y = textoBoton.y

        contenedorBoton.addChild(fondoBoton);
        contenedorBoton.addChild(textoBoton);

        contenedorBoton.eventMode = 'static';
        contenedorBoton.cursor = 'pointer';
        contenedorBoton.on('pointerover', () => { fondoBoton.alpha = 0.8; });
        contenedorBoton.on('pointerout', () => { fondoBoton.alpha = 1; });
        contenedorBoton.on('pointertap', () => {
            this.ocultar();
            this.alReiniciar();
        });

        this.contenedor.addChild(contenedorBoton);
    }

    mostrar(tiempoFinal) {
        this.procesarTiempoPartida(tiempoFinal);
        this.contenedor.visible = true;
    }

    ocultar() {
        this.contenedor.visible = false;
    }

    redimensionar(nuevoAncho, nuevoAlto) {
        this.ancho = nuevoAncho;
        this.alto = nuevoAlto;
    }
}