import * as PIXI from '../pixi.js';

import { Estado } from "../MEF.js";

export class Espera extends Estado {
    alEntrar() {
        
    }

    alActualizar() {
        
    }
}

export class Intercambio extends Estado {
    alEntrar() {
        //Activar menú de intercambio
        //Cambiar animación a hablando
    }

    alActualizar() {
        //Escuchar el clic
        //Realizar el trueque
        //Pasar al siguiente estado con el trueque realizado o no
    }

    alSalir() {
        //Ocultar menú de trueque
    }
}

export class Agradecido extends Estado {
    alEntrar() {
        //Cambiar animación a agradecimiento
    }
}

export class Enojado extends Estado {
    alEntrar() {
        //Cambiar animación a enojado
        //Escapar del jugador
    }
}