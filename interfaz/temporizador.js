export class Temporizador {
    constructor(tiempoEnSegundos) {
        this.tiempoRestante -= tiempoEnSegundos / 60

        if (this.tiempoRestante <= 0) {
            this.tiempoRestante = 0
            console.log("Perdiste")
        }
    }
}