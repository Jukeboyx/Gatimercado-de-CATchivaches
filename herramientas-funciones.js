import * as PIXI from "./pixi.js"

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