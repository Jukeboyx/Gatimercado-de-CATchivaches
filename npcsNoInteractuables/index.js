import * as PIXI from '../pixi.js';

export class NPCAmbiente {
    constructor(x, y, tipo, categoria, limites, numFrames, zIndex = 1, escala = 3, velocidadAnim = 0.08) {
        this.contenedor = new PIXI.Container();
        this.contenedor.x = x;
        this.contenedor.y = y;
        this.limites = limites;
        this.escalaBase = escala;

        this.contenedor.zIndex = zIndex; 

        const texturePath = `recursos/sprites/${categoria}_${tipo}.png`;
        const texturaBase = PIXI.Assets.get(texturePath);

        const frames = [];
        const anchoFrame = 16;
        const altoFrame = 16;

        for (let i = 0; i < numFrames; i++) {
            const frameTexture = new PIXI.Texture({
                source: texturaBase.source,
                frame: new PIXI.Rectangle(i * anchoFrame, 0, anchoFrame, altoFrame)
            });
            frames.push(frameTexture);
        }

        this.sprite = new PIXI.AnimatedSprite(frames);
        this.sprite.anchor.set(0.5);
        
        // Usamos la velocidad que pasamos desde principal.js
        this.sprite.animationSpeed = velocidadAnim; 
        
        this.sprite.scale.set(this.escalaBase);
        this.sprite.play();
        
        this.contenedor.addChild(this.sprite);

        this.velocidad = Math.random() * 0.5 + 0.3;
        this.destino = { x: Math.random() * limites.x, y: Math.random() * limites.y };
    }

    actualizar(delta) {
        if (!this.sprite) return;
        
        const dx = this.destino.x - this.contenedor.x;
        const dy = this.destino.y - this.contenedor.y;
        const distancia = Math.sqrt(dx * dx + dy * dy);

        if (distancia > 5) {
            this.contenedor.x += (dx / distancia) * this.velocidad * delta;
            this.contenedor.y += (dy / distancia) * this.velocidad * delta;
            this.sprite.scale.x = dx > 0 ? this.escalaBase : -this.escalaBase;
        } else {
            this.destino = { x: Math.random() * this.limites.x, y: Math.random() * this.limites.y };
        }
    }
}
//este es un comentariompara poder volver a hacer push pq a juan no le sale mi commit