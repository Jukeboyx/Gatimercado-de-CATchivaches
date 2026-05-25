import * as PIXI from './pixi.js';

export class Objeto {
    constructor(id, nombre, emoji, esObjetivo = false){
        this.id = id
        this.nombre = nombre
        this.emoji = emoji
        this.esObjetivo = esObjetivo
    }
}

export const catálogoObjetos = {
    manzanaRoja: new Objeto('manzanaRoja', 'Manzana', '🍎'),
    pezFresco: new Objeto('pezFresco', 'Pescado', '🐟'),
    ovilloLana: new Objeto('ovilloLana', 'Ovillo', '🧶'),
    libro: new Objeto('libro', 'Libro', '📕')
}