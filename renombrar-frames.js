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

arreglarJSON('recursos/sprites/gato_negro.json', 'gato_negro')
arreglarJSON('recursos/sprites/gato_gris.json', 'gato_gris')