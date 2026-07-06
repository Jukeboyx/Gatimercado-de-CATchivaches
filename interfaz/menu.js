import * as PIXI from '../pixi.js';

export class MenuPrincipal {
    constructor(ancho, alto, alJugar) {
        this.contenedor = new PIXI.Container();
        this.ancho = ancho;
        this.alto = alto;
        this.alJugar = alJugar; // Función que se ejecuta al hacer clic en "Jugar"

        this.crearInterfaz();
    }

    crearInterfaz() {
        // 1. Fondo del menú (puedes cambiarlo por un Sprite si tienes una imagen)
        const texturaFondo = PIXI.Assets.get('recursos/sprites/fondoMenu.png')
        const fondo = new PIXI.Sprite(texturaFondo);
        this.contenedor.addChild(fondo);

        // 2. Título del juego
        const estiloTitulo = new PIXI.Sprite({
            fontFamily: 'Arial',
            fontSize: 64,
            fill: '#ffffff',
            fontWeight: 'bold',
            dropShadow: {
                alpha: 0.5,
                blur: 4,
                distance: 4
            }
        });
        
        const titulo = new PIXI.Text({ text: 'Juego de Gatitos', style: estiloTitulo });
        titulo.anchor.set(0.5);
        titulo.x = this.ancho / 2;
        titulo.y = this.alto / 3;
        this.contenedor.addChild(titulo);

        // 3. Botón "Jugar"
        const contenedorBoton = new PIXI.Container();
        contenedorBoton.x = this.ancho / 2;
        contenedorBoton.y = this.alto / 2 + 50;

        const fondoBoton = new PIXI.Graphics();
        fondoBoton.roundRect(-100, -30, 200, 60, 15);
        fondoBoton.fill({ color: 0xffa500 }); // Color naranja

        const estiloBoton = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fill: '#ffffff',
            fontWeight: 'bold'
        });
        
        const textoBoton = new PIXI.Text({ text: 'JUGAR', style: estiloBoton });
        textoBoton.anchor.set(0.5);

        contenedorBoton.addChild(fondoBoton);
        contenedorBoton.addChild(textoBoton);

        // 4. Interactividad del botón
        contenedorBoton.eventMode = 'static';
        contenedorBoton.cursor = 'pointer';

        contenedorBoton.on('pointerover', () => { fondoBoton.alpha = 0.8; });
        contenedorBoton.on('pointerout', () => { fondoBoton.alpha = 1; });
        contenedorBoton.on('pointertap', () => {
            this.ocultar();
            this.alJugar(); // Llamamos a la función para iniciar el juego
        });

        this.contenedor.addChild(contenedorBoton);
    }

    mostrar() {
        this.contenedor.visible = true;
    }

    ocultar() {
        this.contenedor.visible = false;
    }

    redimensionar(nuevoAncho, nuevoAlto) {
        this.ancho = nuevoAncho;
        this.alto = nuevoAlto;
        // Aquí podrías recalcular las posiciones del título y botón si la pantalla cambia de tamaño estando en el menú
    }
}