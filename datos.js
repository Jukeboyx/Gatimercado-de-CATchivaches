import * as PIXI from './pixi.js';

export class Objeto {
    constructor(id, nombre, spriteX, spriteY, esObjetivo = false){
        this.id = id
        this.nombre = nombre
        this.spriteX = spriteX
        this.spriteY = spriteY
        this.esObjetivo = esObjetivo
    }

    crearSprite() {
        const texturaItems = PIXI.Assets.get('recursos/sprites/items.png')
        return new PIXI.Sprite(new PIXI.Texture({
            source: texturaItems,
            frame: new PIXI.Rectangle(this.spriteX, this.spriteY, 36, 36)
        }))
    }
}

//¿Objetos Objeto?
export const catálogoObjetos = {
    manzanaRoja: new Objeto('manzanaRoja', 'Manzana roja', 0, 0),
    pezFresco: new Objeto('pezFresco', 'Pez fresco', 36, 0),
    ovilloLana: new Objeto('ovilloLana', 'Ovillo de lana', 72, 0),
    libro: new Objeto('libro', 'Libro', 108, 0),
    girasol: new Objeto('girasol', 'Girasol', 144, 0),
    manzanaVerde: new Objeto('manzanaVerde', 'Manzana verde', 180, 0),
    calabaza: new Objeto('calabaza', 'Calabaza', 216, 0),
    panIntegral: new Objeto('panIntegral', 'Pan integral', 252, 0),
    leche: new Objeto('leche', 'Leche', 0, 36),
    queso: new Objeto('queso', 'Queso', 36, 36),
    huevo: new Objeto('huevo', 'Huevo', 72, 36),
    zanahoria: new Objeto('zanahoria', 'Zanahoria', 108, 36),
    peluche: new Objeto('peluche', 'Peluche', 144, 36),
    tomate: new Objeto('tomate', 'Tomate', 180, 36),
    uva: new Objeto('uva', 'Uva', 216, 36),
    sandia: new Objeto('sandia', 'Sandía', 252, 36),
    platano: new Objeto('platano', 'Plátano', 0, 72),
    limon: new Objeto('limon', 'Limón', 36, 72),
    naranja: new Objeto('naranja', 'Naranja', 72, 72),
    fresa: new Objeto('fresa', 'Fresa', 108, 72),
    martillo: new Objeto('martillo', 'Martillo', 144, 72),
    tijeras: new Objeto('tijeras', 'Tijeras', 180, 72),
    lapiz: new Objeto('lapiz', 'Lápiz', 216, 72),
    estrella: new Objeto('estrella', 'Estrella', 252, 72),
    pizza: new Objeto('pizza', 'Pizza', 0, 108),
    gato: new Objeto('gato', 'Gato', 36, 108),
    perro: new Objeto('perro', 'Perro', 72, 108),
    pez: new Objeto('pez', 'Pez', 108, 108),
    cafe: new Objeto('cafe', 'Café', 144, 108),
    te: new Objeto('te', 'Té', 180, 108),
    galleta: new Objeto('galleta', 'Galleta', 216, 108),
    pastel: new Objeto('pastel', 'Pastel', 252, 108),
    mate: new Objeto('mate', 'Mate', 0, 144),
    refresco: new Objeto('refresco', 'Refresco', 36, 144),
    miel: new Objeto('miel', 'Miel', 72, 144),
    jugo: new Objeto('jugo', 'Jugo', 108, 144),
    camaron: new Objeto('camaron', 'Camarón', 144, 144),
    pollo: new Objeto('pollo', 'Pollo', 180, 144),
    carne: new Objeto('carne', 'Carne', 216, 144),
    champinon: new Objeto('champinon', 'Champiñón', 252, 144),
    pimiento: new Objeto('pimiento', 'Pimiento', 0, 180),
    maiz: new Objeto('maiz', 'Maíz', 36, 180),
    ajo: new Objeto('ajo', 'Ajo', 72, 180),
    cebolla: new Objeto('cebolla', 'Cebolla', 108, 180),
    papa: new Objeto('papa', 'Papa', 144, 180),
    lechuga: new Objeto('lechuga', 'Lechuga', 180, 180),
    aguacate: new Objeto('aguacate', 'Aguacate', 216, 180),
    pelotaVoley: new Objeto('pelotaVoley', 'Pelota de vóley', 252, 180),
}

export const obstáculos = []