# Futbol Cards — Registro oficial de reglas

Documento vivo: toda regla aprobada se anota aquí antes o junto con el código.
Última actualización: 2026-11-22.

---

## 1. Plataforma

- Juego web (HTML + CSS + JavaScript con módulos ES, sin compilación), jugable en PC y celular, instalable como PWA.
- Backend: Supabase (proyecto propio, plan gratuito) para cuentas, clubes, mercado, ligas y partidos automáticos.
- Publicación: GitHub Pages (misma dinámica que Overstrike 2). Se juega solo con cuenta.
- Interfaz con **modo oscuro (negro)** y **modo claro (blanco)**; el usuario elige.

## 2. Cartas y rarezas

| Rareza | Color (marco + panel de información) | Probabilidad por carta |
|---|---|---|
| Común | Blanco | 90 % |
| Raro | Azul | 9 % |
| Épico | Morado | 0.99 % |
| Legendario | Dorado | 0.01 % |

- **Cada jugador real existe solo en 2 rarezas seguidas** (regla del 2026-11-23), según su categoría, cada una con su propia imagen:

| Categoría | Rarezas | Ejemplos |
|---|---|---|
| Estrella | Épico y Legendario | Cristiano Ronaldo, Messi |
| Figura | Raro y Épico | Shevchenko |
| Base | Común y Raro | Rogelio Funes Mori |

- El usuario manda 2 fotos por jugador, en orden (rareza baja, rareza alta).
- Sobres (cuando existan): la rareza de cada carta sale con las probabilidades de la tabla y luego se elige un jugador que exista en esa rareza. Por eso un Legendario solo puede ser una Estrella.
- Imágenes: el usuario pasa solo la foto. El juego dibuja el marco, el color, el nombre, la media y los datos.
- Nombre de archivo = nombre del jugador + rareza (ej. `Messi Legendario.png`).

### Media por rareza

- Cada jugador se define con sus atributos en su **rareza alta**; la rareza baja resta **6** a cada atributo.
- Los jugadores ficticios de prueba (sin categoría) siguen en las 4 rarezas con base en Legendario.
- **Techo: 96 de media base en Legendario** (rol natural). Cristiano Ronaldo, Messi, Pelé y Maradona son la cúspide del juego y comparten ese techo; nadie lo supera (prueba automática). Así ninguno de los cuatro queda "por encima" de otro.
- El techo es de la media base: en el partido el encaje y las bonificaciones la suben o la bajan. Un crack mal usado (−5) puede quedar por debajo de otro jugador bien aprovechado (+6).
- Ejemplo: Cristiano Ronaldo Épico 90, Legendario 96.

### Fichas de jugadores reales

- Un archivo por jugador en `js/datos/jugadores/`, listado en `index.js`.
- `estado: 'propuesta'` hasta que el usuario la aprueba, luego `'aprobada'`.
- Fotos: `python herramientas/optimizar_imagenes.py` convierte `assets/originales/jugadores/<Nombre> <Rareza>.<ext>` en `assets/jugadores/<nombre>-<rareza>.webp`. Solo reduce, **nunca recorta**.
- La carta encuadra la foto anclada arriba: si sobra, se recorta de abajo o de los lados, nunca la cabeza.
- Escuelas de juego (estilos, no países): Tiki-taka, Jogo bonito, Catenaccio, Fútbol total, Gegenpressing, Garra, Vértigo, Potencia.
- Aprobados: Cristiano Ronaldo (2026-11-23), Lionel Messi (2026-11-23), Pelé (2026-11-23), Diego Maradona (2026-11-24), Zinedine Zidane (2026-11-24), Paolo Maldini (2026-11-24), Gianluigi Buffon (2026-11-24).
- Desde 2026-11-24 el usuario no revisa las fichas: cada jugador nuevo se publica directamente como `'aprobada'`.

### Mejora por copias

- Carta + 5 copias de la misma rareza = la carta sube a la siguiente rareza (se consumen las 5 copias).
- Solo dentro de sus 2 rarezas: una Estrella sube de Épico a Legendario, una Figura de Raro a Épico, una Base de Común a Raro. En la rareza alta ya no sube más.

## 3. Atributos (1–99)

| Grupo | Atributos |
|---|---|
| Ataque | Definición, Remate de cabeza, Tiro lejano |
| Creación | Pase corto, Pase largo, Visión, Centros |
| Técnica | Regate, Control |
| Defensa | Entrada, Marcaje, Anticipación |
| Físico | Velocidad, Resistencia, Fuerza, Salto |
| Mental | Posicionamiento, Compostura |
| Portero | Reflejos, Colocación, Juego aéreo, Juego con el pie |

Además: rol natural + hasta 2 secundarios, pie bueno / pie malo (1–5), nacionalidad.

## 4. Media visible y encaje (oculto)

- **Media visible** = media de la rareza en el rol asignado + **ajuste de encaje** + **bonificaciones**.
- El usuario **solo ve el resultado final** (ej. Messi Legendario 96 o 102), nunca el desglose.
- La media puede superar 99.
- El ajuste se suma a **todos** los atributos del jugador (por eso mueve la media y el rendimiento en el partido). Se compone de:
  - **Rol**: natural 0, 1.er secundario −3, 2.º secundario −5, fuera de sus roles −12.
  - **Afinidad con las estrategias** (−4…+4): lo que destacan sus atributos clave para la estrategia elegida respecto a las demás. Pesa más la ofensiva en delanteros (80 %), mitad y mitad en medios, más la defensiva en defensas (80 %). Porteros: sin afinidad.
  - **Química** (−2…+3), ver §5.
- La media de cada rol es un promedio ponderado de atributos (`ROLES` en js/motor/reglas.js).
- Roles: Portero, Central, Líbero, Lateral, Carrilero, Ancla, Regista, Box-to-box, Mediapunta, Extremo, Delantero interior, **Segundo delantero**, Falso 9, Delantero de área.

## 5. Química

- Solo entre compañeros **vinculados** en la formación. Cada formación tiene exactamente 17 vínculos (ninguna tiene más química posible que otra).
- Cada vínculo da 1 punto por misma nación y 1 por misma escuela de juego.
- Puntos → ajuste: 0 → −2, 1 → −1, 2 → 0, 3 → +1, 4 → +2, 5 o más → +3.
- **No hay bonus por duplas históricas**: el juego premia inventar combinaciones nuevas (ej. Matthäus + Iniesta), no copiar equipos reales.

## 6. Bonificaciones de jugador y de capitán

- Algunos jugadores tienen **bonificaciones** con condición + efecto cuantificable.
  Ejemplo de forma: "si juega de Mediapunta: +3 Pase corto a los medios".
- **Habilidad de Capitán**: solo capitanes emblemáticos; se activa si llevan el brazalete.
- Toda bonificación es un número aplicado a atributos (nunca texto sin efecto).
- Regla de código: una función universal por tipo de condición y por tipo de efecto; las fichas solo combinan esas piezas.

## 7. Equilibrio (regla de oro)

Ningún elemento es superior a los demás. En cada familia (estrategias ofensivas, defensivas, formaciones…), cada opción tiene contra las opciones rivales exactamente:
**una Mucha ventaja, una Neutral +, una Neutral − y una Mucha desventaja**.

### Estrategias ofensivas vs defensivas

| Ataque \ Defensa | Presión alta | Bloque medio | Bloque bajo | Marcaje al hombre |
|---|---|---|---|---|
| Posesión (tiki-taka) | −− | ++ | − | + |
| Contraataque | ++ | + | −− | − |
| Juego directo | + | − | ++ | −− |
| Juego por bandas | − | −− | + | ++ |

Cada fila y cada columna contienen ++, +, −, −− una sola vez.

Cada estrategia cambia también **qué atributos pesan** en cada fase, por qué carriles se ataca, el ritmo, cuánto se recicla el balón y el cansancio:

- **Posesión**: pase corto, control, visión, compostura. Ataca por el centro, recicla mucho y juega lento.
- **Contraataque**: velocidad, regate, pase largo. Tras recuperar el balón, 35 % de saltarse una fase.
- **Juego directo**: pase largo, fuerza, cabeza, posicionamiento. Remata mucho de cabeza.
- **Juego por bandas**: velocidad, regate, centros, resistencia. Ataca por fuera y remata mucho de cabeza.
- **Presión alta**: velocidad, resistencia, entrada. Más gente arriba; cansa ×1.5.
- **Bloque medio**: anticipación, posicionamiento, entrada. Domina el centro del campo.
- **Bloque bajo**: marcaje, posicionamiento, fuerza, salto. Más gente atrás; cansa ×0.85.
- **Marcaje al hombre**: marcaje, velocidad, fuerza. Cansa ×1.2.

### Formaciones

| Formación \ Rival | 4-4-2 | 4-3-3 | 4-2-3-1 | 3-5-2 | 5-3-2 | 4-1-2-1-2 | 4-4-1-1 | 4-1-4-1 | 3-4-3 |
|---|---|---|---|---|---|---|---|---|---|
| 4-4-2 | = | ++ | − | + | −− | ++ | − | + | −− |
| 4-3-3 | −− | = | ++ | − | + | −− | ++ | − | + |
| 4-2-3-1 | + | −− | = | ++ | − | + | −− | ++ | − |
| 3-5-2 | − | + | −− | = | ++ | − | + | −− | ++ |
| 5-3-2 | ++ | − | + | −− | = | ++ | − | + | −− |
| 4-1-2-1-2 | −− | ++ | − | + | −− | = | ++ | − | + |
| 4-4-1-1 | + | −− | ++ | − | + | −− | = | ++ | − |
| 4-1-4-1 | − | + | −− | ++ | − | + | −− | = | ++ |
| 3-4-3 | ++ | − | + | −− | ++ | − | + | −− | = |

9 formaciones. Contra las demás, cada una tiene **dos ++, dos +, dos − y dos −−** (misma cantidad de cada, regla de oro), y la tabla es simétrica: si A tiene ++ contra B, B tiene −− contra A. Para añadir más, el total debe seguir siendo 4k + 1 (13, 17…) y respetar el patrón (prueba automática).

**Puestos**:
- POR, DFC, LI, LD.
- MCD = **Contención**, MC = Mediocentro.
- **II / ID = Interior izquierdo / derecho**.
- MI / MD = Medio izquierdo / derecho.
- MCO = **Mediapunta**.
- EI / ED = Extremos.
- **SD = Segundo delantero**.
- DC = Delantero centro.

**Formaciones**:
- 4-4-2 (doble pivote).
- 4-3-3 (contención + 2 interiores).
- 4-2-3-1.
- 3-5-2 (contención + 2 interiores).
- 5-3-2 (2 interiores).
- **4-1-2-1-2** (rombo).
- **4-4-1-1** (segundo delantero).
- **4-1-4-1**.
- **3-4-3**.

Cada formación reparte su presencia por franjas (defensa, medio, ataque) y carriles (izquierda, centro, derecha), lo que crea superioridades numéricas en cada zona.

## 8. Motor de partidos (js/motor/partido.js)

- Campo en 9 zonas (3 franjas × 3 carriles). La formación y el rol reparten la presencia de cada jugador por zona.
- El partido es una sucesión de posesiones (~150). Cada posesión avanza por fases: **salida → creación → ocasión → remate**.
- Cada fase es un **duelo** entre los jugadores del atacante y del defensor presentes en esa zona. Probabilidad = logística de:
  - base de la fase
  - + (rating atacante − rating defensor) / 34. El rating es 50 % media en su rol + 50 % atributos que pide la estrategia, multiplicado por el cansancio.
  - + 0.6 × ln(presencia atacante / presencia defensora) (superioridad numérica)
  - + tabla de estrategias (++ 0.17, + 0.06, − −0.06, −− −0.17)
  - + tabla de formaciones (++ 0.09, + 0.04, − −0.04, −− −0.09)
  - + moral (+0.1 durante 10 minutos tras marcar)
  - + calibración automática
- Si pierde el duelo, el equipo puede **reciclar** (volver atrás conservando el balón) o **pierde** la posesión. El rival recupera en la zona espejo, así que perder el balón en la salida es peligroso.
- **Remate**: con el pie, de cabeza o desde lejos. Probabilidad de gol = xG de la jugada × e^((rematador − portero)/30), entre 1 % y 70 %.
- **Cansancio**: baja con los minutos según la estrategia defensiva y la Resistencia; en el descanso se recupera un poco.
- **En vivo**: cambios tácticos y hasta 5 sustituciones; la energía de los que siguen se conserva.
- **Semilla**: el mismo partido con la misma semilla se repite idéntico (repeticiones, anti-trampas).

### Calibración y equilibrio

- `node herramientas/calibrar.mjs` ajusta pequeños valores ocultos para que cada estrategia y formación ronde el 50 % de puntos contra rivales al azar. Hay que volver a ejecutarlo cuando cambien las reglas o el conjunto de jugadores.
- `node herramientas/balance.mjs` genera el informe. El último está en docs/balance-ultimo.txt.
- Objetivos:
  - Cada estrategia y formación entre 48 y 52 %.
  - ~2.8 goles por partido y ~23 % de empates.
  - Un equipo con +5 de media gana ~60 %.
  - Un equipo con −5 de media pero con ++ en todo gana ~45 % y pierde ~36 %.

## 9. Modos de juego

1. **Liga compartida**: todos los usuarios + clubes NPC de relleno. Liga y copa se simulan solas a hora fija (ej. 21:00) con la alineación y táctica guardadas. Si el usuario está conectado a esa hora, puede intervenir en vivo.
2. **Liga en solitario**: solo contra NPC, se juega en vivo o se simula al resultado; temporadas completas en horas. Fuente principal de recursos para el club.
3. **Amistosos**: al instante contra el equipo de un amigo o la IA.
- Divisiones con ascensos y descensos, liga, copa y torneo continental (nombres inventados).

## 10. Club

- Nombre libre (puede ser el de un club real) y escudo creado en el juego.
- **No hay equipaciones**: en el campo se ven las cartas.

## 11. Sobres

- 3 jugadores por sobre.
- Al empezar: **5 sobres de regalo** (15 jugadores) con un **11 completo garantizado**: 1 POR, 4 DEF, 4 MED, 2 DEL; los otros 4 al azar. **2 raros garantizados** dentro de los 15.
- Probabilidades y mejora por copias se quedan **exactamente** como en §2 (decisión del 2026-11-22): los Legendarios son casi míticos a propósito. No hay fragmentos.

## 12. Tutorial

- Recorrido por las funciones y opciones principales.
- Acompaña a abrir los primeros sobres, armar el primer equipo, nombrar el club y crear el escudo.

## 13. Interfaz (versión de prueba)

- `python herramientas/servidor.py` → http://localhost:3300 (sin caché).
- **App instalable (PWA)**:
  - Archivos: `manifest.webmanifest`, `sw.js` e iconos en `assets/iconos/` (se generan con `python herramientas/generar_iconos.py`).
  - Botón **⬇ Instalar** en la cabecera: aparece solo si el navegador permite instalar (Chrome/Edge en PC y Android) y abre la ventana oficial. En iPhone/iPad explica cómo hacerlo con «Compartir → Agregar a pantalla de inicio». Si el juego ya se abre como app, el botón no sale.
  - Service worker: el código se pide primero a la red (siempre llega la última versión) y, sin conexión, usa la copia guardada. Imágenes y fuentes salen primero de la copia. La música, siempre de la red.
  - Subir `VERSION` en `sw.js` si cambia la lista de archivos base.
- **Portada** (`js/ui/portada.js`, lo primero al abrir el juego):
  - Fondo del inicio con las chispas, el logo **FUTBOL CARDS** en grande (FUTBOL blanco, CARDS verde) e **INICIAR** apareciendo y desapareciendo.
  - Un clic (o Enter/Espacio) entra al menú.
  - La música intenta sonar ya en la portada; los navegadores suelen bloquear el sonido hasta el primer clic, así que en ese caso arranca con el clic de Iniciar.
  - Sale en cada carga de la página.
- **Lobby** (pantalla de inicio): fondo `assets/fondos/lobby.webp` (balón dorado sobre roca, aportado por el usuario) con **chispas de fuego animadas** (`js/ui/brasas.js`: canvas detrás del menú; trazos alargados en diagonal hacia arriba, núcleo amarillo con halo naranja y profundidad (las cercanas más grandes, rápidas y difusas); parpadean y se apagan; se detienen al salir del inicio y se reducen si el sistema pide menos movimiento). Encima del fondo, un velo para leer el menú. Arriba, el club (escudo, nombre, media del once). Debajo, 6 recuadros medianos:
  - **Mi Club**: formación, estrategias, roles, capitán y alineación.
  - **Colección**: tus cartas agrupadas con sus copias (×N), filtros por rareza y botón **Subir a …** (6 copias = carta + 5). Pestaña **Álbum de jugadores** con todos los jugadores reales aprobados.
  - **Mercado de Fichajes**: solo abre en ciertas fechas (por ahora, cerrado).
  - **Temporadas**: Liga, Copa y Torneo de Campeones contra la IA (próximamente); de momento, amistoso contra la IA.
  - **Liga Master**: contra los clubes de los amigos y la IA (próximamente).
  - **Tienda del Club**: sobres (próximamente).
- **Música** (`js/ui/musica.js`, archivos en `assets/audio/musica/`):
  - Las pistas de `PISTAS` suenan una tras otra y, al acabar la última, vuelve a empezar la primera. Con una sola pista, se repite.
  - Sigue sonando al cambiar de pantalla.
  - Botón 🔊 en la cabecera: panel con la pista actual, silenciar/activar y volumen 0–100. Se guarda en el navegador (`fc-musica`).
  - Los navegadores no dejan sonar audio hasta que el usuario toca la página, así que si el arranque se bloquea empieza con el primer clic o tecla.
  - Pistas (en orden): We Are One (Ole Ola) → Drive (moa moa) → Made of Gold (Ibeyi & Pa Salieu) → vuelve a empezar.
- **Fondos por pantalla**: `app.js` pone `data-pantalla` en el body. Mi Club usa `assets/fondos/club.webp` (estadio de día, con un velo más fuerte para leer el campo y los paneles). Temporadas usa `assets/fondos/temporadas.webp` (el estadio azul, antiguo fondo del inicio).
- En cada pantalla, la flecha ← vuelve al lobby (desde el partido, a Temporadas). Los avisos y confirmaciones usan diálogos del juego (`js/ui/dialogo.js`), nunca los del navegador.
- Club de prueba: además de los ficticios trae 6 copias Común de cada jugador real aprobado, para probar la subida de rango (se quitará con los sobres).
- **Tema**: oscuro por defecto, claro con el botón ☀️/🌙. Se guarda en el navegador.
- **Cartas**: marco y panel con el color de la rareza; media + puesto arriba a la izquierda, "C" si es capitán. Foto en `assets/jugadores/<nombre>-<rareza>.webp` (ej. `lionel-messi-legendario.webp`); sin foto se ven las iniciales.
- **Alineación**:
  - Campo con las 11 cartas. Tocar un jugador y luego otro del campo (intercambio) o del banquillo (entra).
  - Rol por jugador (★ = rol natural), capitán, formación, ataque, defensa y Auto-alinear.
  - Las medias mostradas ya incluyen el encaje y las bonificaciones; el desglose nunca se ve. Los atributos mostrados son los finales.
- **Partido**:
  - Marcador, campo con el balón y la zona activa, crónica narrada y estadísticas (posesión, tiros, a puerta, goles esperados).
  - Velocidad x1/x2/x4 y "Simular resultado".
  - Cambio de táctica y hasta 5 sustituciones en vivo. Por defecto sale el más cansado y el banquillo se ordena por encaje en el puesto.
- Los jugadores y el rival actuales son **ficticios** (`js/datos/club-prueba.js`) y el club se guarda en el navegador (`localStorage`) hasta que existan cuentas.

---

## Pendiente de decidir

- Más formaciones: el total debe ser 4k + 1 (la próxima tanda sería de 4, hasta 13).
- Rasgos de jugador (Partidos grandes, Pulmón…): aún no implementados.
- Jugadores reales: se crean a partir de las fotos del usuario.
