# 🐱 Gatimercado de CATchivaches

Juego Point and Click de intercambio y exploración con elementos de puzzle, gestión de tiempo y memoria visual. Desarrollado para navegador web con PixiJS. Haz clic [aquí](https://jukeboyx.github.io/Gatimercado-de-CATchivaches/ "Jugar a Gatimercado de CATchivaches") para acceder al juego en GitHub Pages.

**Equipo:** Paloma Ferrara, Juan Achucarro, Ayelen Aranda  
**Contexto:** Proyecto universitario  
**Convención de nombres:** Todo el código está escrito en español (variables, funciones, clases, archivos). Mantener esta convención en cualquier código nuevo.

---

## Descripción del juego

El jugador controla a **Gurrfield**, un gatito que recorre una feria llena de GatiNPCs comerciantes ambulantes. Cada GatiNPC intercambia objetos específicos por otros, formando una red de trueques. El objetivo es conseguir un ítem específico (asignado al azar al inicio de cada partida) antes de que se agote el tiempo, siguiendo la cadena correcta de intercambios.

---

## Mecánicas principales

- **Sistema de trueque**: cada GatiNPC acepta un objeto y entrega otro. El jugador no conoce los intercambios hasta interactuar con ellos.
- **Objetivos aleatorios**: cada partida arranca con un ítem objetivo distinto.
- **Tiempo límite**: presión constante sobre el jugador.
- **GatiNPCs en movimiento**: los NPCs se mueven por el mapa constantemente, hay que encontrarlos.
- **Inventario limitado**: el jugador carga 3 objetos a la vez.
- **Exploración libre**: el mapa (Gatimercado) es de recorrido libre, top-down 2D, con cámara que sigue al jugador.
- **Cadenas múltiples**: puede haber más de un camino para llegar al ítem objetivo.
- **Partidas cortas y rejugables**: alta variabilidad por objetivos y NPCs aleatorios.

**Victoria:** conseguir el ítem objetivo antes de que se acabe el tiempo.  
**Derrota:** el tiempo se agota sin haber conseguido el ítem.

---

## Controles

Todo se maneja con el mouse, sin teclado:

| Acción | Control |
|---|---|
| Mover a Gurrfield | Clic izquierdo en el mapa |
| Interactuar / intercambiar con GatiNPC | Clic izquierdo sobre el NPC |

El personaje se desplaza automáticamente al punto indicado. Al hacer clic en un NPC, Gurrfield camina hacia él y se activa el intercambio.

> Nota: se evita el clic derecho deliberadamente porque en el navegador abre el menú contextual del sistema.

---

## Estilo visual

- Pixel art colorido, estética de feria callejera / mercado ambulante
- "Cute-chaotic": adorable pero visualmente cargado
- Personajes simples, objetos y textos grandes y legibles
- UI minimalista y amigable
- Cámara top-down 2D que sigue al jugador dentro de un mundo de 2000x2000px
- Referencia visual: Cat Survivor (Friv)

---

## Stack técnico

| Tecnología | Uso |
|---|---|
| HTML / CSS | Estructura y estilos base |
| JavaScript (vanilla, ES Modules) | Lógica del juego |
| PixiJS (instalado localmente vía npm) | Renderizado 2D, sprites, animaciones, escena |

Sin bundler. Usa ES Modules nativos del navegador. Requiere servidor local para correr (ej: Live Server de VS Code) porque los módulos no funcionan con `file://`.

---

## Estructura de archivos

```
GATIMERCADO DE CATCHIVACHES/
├── index.html              # Punto de entrada HTML
├── principal.js            # Inicialización del juego, loop principal, cámara
├── PIXI.js                 # Re-exporta PixiJS desde node_modules
├── MEF.js                  # Máquina de Estados Finitos (clases MEF y Estado base)
├── datos.js                # Catálogo de objetos del juego (clase Objeto, catálogoObjetos)
├── inventario.js           # Clase Inventario (UI + lógica), función realizarTrueque()
├── GatiNPC/
│   ├── index.js            # Clase GatiNPC: constructor, render, MEF, interacción con jugador
│   └── estados.js          # Estados del GatiNPC: Espera, Intercambio, Agradecido, Enojado
├── Jugador/
│   ├── index.js            # Clase Jugador: animaciones por dirección, irHacia(), MEF
│   └── estados.js          # Estados del Jugador: Espera, Caminando, Intercambio
├── Recursos/
│   └── Sprites/            # Spritesheets del jugador (64x64px por frame, 4 frames)
│       ├── JugadorDeLado.png
│       ├── JugadorArriba.png
│       ├── JugadorAbajo.png
│       └── JugadorEspera.png
├── node_modules/           # PixiJS instalado localmente (no modificar)
├── package.json
└── package-lock.json
```

---

## Arquitectura del código

### MEF (Máquina de Estados Finitos)
Clase genérica en `MEF.js`. Tanto el Jugador como el GatiNPC tienen su propia instancia.  
Métodos: `cambiarEstado(nombre, datos)`, `actualizar(datos)`.  
Cada estado hereda de la clase `Estado` e implementa `alEntrar()`, `alActualizar()`, `alSalir()`.

### Jugador (`Jugador/`)
- Animaciones por dirección: `lado`, `arriba`, `abajo`, `espera` (spritesheets de 4 frames, 64px)
- Se mueve hacia un punto con `irHacia(punto, distanciaFreno)`
- Estados: `espera` → `caminando` → `espera`. Estado `intercambio` pendiente de implementar.
- La dirección de la animación se calcula comparando `dx` vs `dy` en el estado `Caminando`.

### GatiNPC (`GatiNPC/`)
- Recibe `(posX, posY, idObjetoQueTiene, idObjetoQuePide, jugador)` en el constructor
- Al hacer clic, Gurrfield camina hacia él (con `distanciaFreno: 60`)
- Estados: `espera`, `intercambio`, `agradecido`, `enojado` (los últimos tres pendientes de implementar)
- Por ahora usa emoji 🐱 como sprite temporal

### Inventario (`inventario.js`)
- 3 ranuras fijas, centradas en la parte inferior de la pantalla
- Cada ranura tiene hover con burbuja de nombre del objeto
- `actualizarRanura(indice, nuevoObjeto)` para modificar el contenido
- `realizarTrueque(npc, inventarioInstancia)` busca el objeto que pide el NPC y lo intercambia

### Datos (`datos.js`)
- `catálogoObjetos`: diccionario de objetos disponibles. Clave = id string, valor = instancia de `Objeto`.
- Objetos actuales: `manzanaRoja`, `pezFresco`, `ovilloLana`, `libro`
- Para agregar objetos nuevos: agregar entrada al `catálogoObjetos` con `new Objeto(id, nombre, emoji)`

---

## Estado actual del desarrollo

- [x] Estructura base del proyecto y loop principal
- [x] Sistema de cámara que sigue al jugador con límites del mundo
- [x] Jugador con animaciones por dirección (spritesheet 4 frames)
- [x] Movimiento del jugador con clic (pathfinding simple punto a punto)
- [x] Máquina de estados finitos (MEF) genérica
- [x] Estados del jugador: Espera, Caminando
- [x] GatiNPC básico con interacción por clic
- [x] Sistema de inventario (UI con 3 ranuras + hover)
- [x] Catálogo de objetos y función de trueque
- [ ] Implementar estado Intercambio del jugador (bloquear movimiento durante trueque)
- [ ] Implementar estados del GatiNPC: Intercambio, Agradecido, Enojado
- [ ] Movimiento autónomo de GatiNPCs por el mapa
- [ ] Sistema de objetivo aleatorio al inicio de partida
- [ ] Timer / cuenta regresiva visible
- [ ] UI de objetivo (mostrar qué ítem busca Gurrfield)
- [ ] Mapa con assets de feria (reemplazar fondo verde)
- [ ] Sprites reales para GatiNPCs (reemplazar emoji temporal)
- [ ] Condición de victoria y derrota
- [ ] Polish visual y animaciones

---

## Notas para la IA

- **Idioma del código:** español siempre. Variables, funciones, clases, comentarios: todo en español. No sugerir inglés aunque sea "más estándar".
- El juego usa **ES Modules nativos** (`import`/`export`). No usar `require()` ni sintaxis CommonJS.
- No usar TypeScript, JSX, ni nada que requiera compilación o bundler.
- **PixiJS**: toda la lógica visual pasa por esta librería. Se importa siempre desde `'./pixi.js'` (o `'../pixi.js'` desde subcarpetas).
- **MEF**: antes de agregar un estado nuevo, leer `MEF.js` y el archivo `estados.js` correspondiente. Los estados heredan de `Estado` e implementan `alEntrar()`, `alActualizar()`, `alSalir()`.
- **Inventario**: siempre tiene 3 ranuras. El trueque se hace con `realizarTrueque()` en `inventario.js`.
- **Catálogo de objetos**: agregar objetos nuevos en `datos.js`, no hardcodearlos en otros archivos.
- Antes de crear un archivo nuevo, verificar si la lógica corresponde a uno existente.
