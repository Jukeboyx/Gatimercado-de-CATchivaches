import * as PIXI from './pixi.js';

export class Objeto {
    constructor(nombre, indice, esObjetivo = false){
        this.nombre = nombre
        this.indice = indice
        this.esObjetivo = esObjetivo
    }

    crearSprite() {
        const TAMAÑO_SPRITE = 36
        const columnas = 8
        const fila = Math.floor(this.indice / columnas)
        const columna = this.indice % columnas
        const x = columna * TAMAÑO_SPRITE
        const y = fila * TAMAÑO_SPRITE

        const texturaItems = PIXI.Assets.get('recursos/sprites/items.png')
        return new PIXI.Sprite(new PIXI.Texture({
            source: texturaItems,
            frame: new PIXI.Rectangle(x, y, TAMAÑO_SPRITE, TAMAÑO_SPRITE)
        }))
    }
}

//¿Objetos Objeto?
export const catálogoObjetos = {
    cuadro: new Objeto('Cuadro', 0),
    zanahoria: new Objeto('Zanahoria', 1),
    papa: new Objeto('Papa', 2),
    huevo: new Objeto('Huevo', 3),
    vasoLeche: new Objeto('Vaso de leche', 4),
    fosforos: new Objeto('Fósforos', 5),
    coco: new Objeto('Coco', 6),
    tetera: new Objeto('Tetera', 7),
    pelotaFutbol: new Objeto('Pelota de fútbol', 8),
    sobre: new Objeto('Sobre', 9),
    pico: new Objeto('Pico', 10),
    arandano: new Objeto('Arándano', 11),
    galleta: new Objeto('Galleta', 12),
    burbuja: new Objeto('Burbuja', 13),
    trebol: new Objeto('Trébol', 14),
    probeta: new Objeto('Probeta', 15),
    jugo: new Objeto('Jugo', 16),
    abaco: new Objeto('Ábaco', 17),
    cajaHerramientas: new Objeto('Caja de herramientas', 18),
    iman: new Objeto('Imán', 19),
    ovilloLana: new Objeto('Ovillo de lana', 20),
    ositoPeluche: new Objeto('Osito peluche', 21),
    escoba: new Objeto('Escoba', 22),
    piezaRompecabezas: new Objeto('Pieza de rompecabezas', 23),
    esponja: new Objeto('Esponja', 24),
    calzoncillo: new Objeto('Calzoncillo', 25),
    apositoProtector: new Objeto('Apósito protector', 26),
    cepillo: new Objeto('Cepillo', 27),
    espejo: new Objeto('Espejo', 28),
    papelHigienico: new Objeto('Papel higiénico', 29),
    pato: new Objeto('Pato', 30),
    pluma: new Objeto('Pluma', 31),
    sambuchito: new Objeto('Sambuchito', 32),
    mariposa: new Objeto('Mariposa', 33),
    bata: new Objeto('Bata', 34),
    hueso: new Objeto('Hueso', 35),
    gorra: new Objeto('Gorra', 36),
    bufanda: new Objeto('Bufanda', 37),
    medias: new Objeto('Medias', 38),
    dinamita: new Objeto('Dinamita', 39),
    telefono: new Objeto('Teléfono', 40),
    paraguas: new Objeto('Paraguas', 41),
    peonAjedrez: new Objeto('Peón de ajedrez', 42),
    escaleraMano: new Objeto('Escalera de mano', 43),
    cascoMilitar: new Objeto('Casco militar', 44),
    silla: new Objeto('Silla', 45),
    abanico: new Objeto('Abanico', 46),
    macetaConPlanta: new Objeto('Maceta con planta', 47),
}

export const obstáculos = []