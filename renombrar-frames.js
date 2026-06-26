const { readFileSync, writeFileSync } = require('fs')

function arreglarJSON(nombreArchivo, prefijo) {
    const json = JSON.parse(readFileSync(nombreArchivo, 'utf8'))
    
    const tags = json.meta.frameTags
    const claves = Object.keys(json.frames)
    const framesNuevos = {}

    for (const tag of tags) {
        let frameDelTag = 0
        for (let i = tag.from; i <= tag.to; i++) {
            const claveVieja = claves[i]
            const claveNueva = `${prefijo}_${tag.name}_${frameDelTag}`
            framesNuevos[claveNueva] = json.frames[claveVieja]
            frameDelTag++
        }
    }

    json.frames = framesNuevos
    
    writeFileSync(nombreArchivo, JSON.stringify(json, null, 2))
    console.log(`✓ ${nombreArchivo} arreglado`)
}

arreglarJSON('recursos/sprites/gato_blanco.json', 'gato_blanco')
arreglarJSON('recursos/sprites/gato_violeta.json', 'gato_violeta')
arreglarJSON('recursos/sprites/gato_naranja.json', 'gato_naranja')
arreglarJSON('recursos/sprites/shiro.json', 'shiro')