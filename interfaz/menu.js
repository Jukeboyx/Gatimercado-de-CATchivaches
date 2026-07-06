import * as PIXI from '../pixi.js';

export class MenuPrincipal {
    constructor(ancho, alto, alJugar, reproducirSonido) {
        this.contenedor = new PIXI.Container();
        this.ancho = ancho;
        this.alto = alto;
        this.alJugar = alJugar;
        this.reproducirSonido = reproducirSonido;

        this.crearInterfaz();
    }

    crearInterfaz() {
        const texturaFondo = PIXI.Assets.get('recursos/sprites/fondoMenu.png')
        const fondo = new PIXI.Sprite(texturaFondo);
        fondo.anchor.set(0.5)
        fondo.x = this.ancho / 2
        fondo.y = this.alto / 2
        this.contenedor.addChild(fondo);
        
        const texturaTitulo = PIXI.Assets.get('recursos/sprites/titulo_gatimercado.png')
        this.titulo = new PIXI.Sprite(texturaTitulo);
        this.titulo.anchor.set(0.5);
        this.titulo.scale.set(2)
        this.titulo.x = this.ancho / 2;
        this.titulo.y = this.alto / 3;
        this.contenedor.addChild(this.titulo);

        // 3. Botón "Jugar"
        this.contenedorBoton = new PIXI.Container();
        this.contenedorBoton.x = this.ancho / 2;
        this.contenedorBoton.y = this.alto * 0.8

        const texturaBotonNormal = PIXI.Assets.get('recursos/sprites/boton1.png')
        const fondoBotonNormal = new PIXI.Sprite(texturaBotonNormal)
        fondoBotonNormal.anchor.set(0.5)
        fondoBotonNormal.scale.set(2)
        fondoBotonNormal.visible = true

        const texturaBotonApuntado = PIXI.Assets.get('recursos/sprites/boton1_seleccionado.png')
        const fondoBotonApuntado = new PIXI.Sprite(texturaBotonApuntado)
        fondoBotonApuntado.scale.set(2)
        fondoBotonApuntado.anchor.set(0.5)
        fondoBotonApuntado.visible = false
        
        const estiloBoton = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fill: '#d06004',
            fontWeight: 'bold'
        });
        
        const textoBoton = new PIXI.Text({ text: 'JUGAR', style: estiloBoton });
        textoBoton.anchor.set(0.5);

        this.contenedorBoton.addChild(fondoBotonNormal);
        this.contenedorBoton.addChild(fondoBotonApuntado);
        this.contenedorBoton.addChild(textoBoton);

        // 4. Interactividad del botón
        this.contenedorBoton.eventMode = 'static';
        this.contenedorBoton.cursor = 'pointer';

        this.contenedorBoton.on('pointerover', () => {
            fondoBotonNormal.visible = false
            fondoBotonApuntado.visible = true
            this.reproducirSonido()
        });
        this.contenedorBoton.on('pointerout', () => {
            fondoBotonApuntado.visible = false
            fondoBotonNormal.visible = true
        });
        this.contenedorBoton.on('pointertap', () => {
            this.ocultar();
            this.alJugar(); // Llamamos a la función para iniciar el juego
        });

        this.contenedor.addChild(this.contenedorBoton);
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

        this.titulo.x = nuevoAncho / 2;
        this.titulo.y = nuevoAlto / 3;

        this.contenedorBoton.x = nuevoAncho / 2
        this.contenedorBoton.y = nuevoAlto * 0.8
    }
}