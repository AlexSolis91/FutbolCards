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

- Cada jugador real tiene **4 cartas**, una por rareza, cada una con su propia imagen.
- Imágenes: el usuario pasa solo la foto. El juego dibuja el marco, el color, el nombre, la media y los datos.
- Nombre de archivo = nombre del jugador + rareza (ej. `Messi Legendario.png`).

### Media por rareza

- Cada jugador se define con sus atributos en **Legendario**.
- Las otras rarezas restan a cada atributo: Épico −6, Raro −12, Común −18.
- Ejemplo: Messi Común 80, Raro 86, Épico 92, Legendario 98.

### Mejora por copias

- Carta + 5 copias de la misma rareza = la carta sube a la siguiente rareza (se consumen las 5 copias).
- Común → Raro → Épico → Legendario.

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
- El ajuste de encaje depende de: rol asignado, formación, estrategia ofensiva, estrategia defensiva, química con los compañeros cercanos.
- El usuario **solo ve el resultado final** (ej. Messi Legendario 96 o 102), nunca el desglose.
- La media puede superar 99.

## 5. Química

- Solo entre compañeros conectados en la formación.
- Vínculos: misma nación, misma escuela de juego.
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

### Estrategias ofensivas vs defensivas (propuesta inicial)

| Ataque \ Defensa | Presión alta | Bloque medio | Bloque bajo | Marcaje al hombre |
|---|---|---|---|---|
| Posesión (tiki-taka) | −− | ++ | − | + |
| Contraataque | ++ | + | −− | − |
| Juego directo | + | − | ++ | −− |
| Juego por bandas | − | −− | + | ++ |

Cada fila y cada columna contienen ++, +, −, −− una sola vez.
Las formaciones seguirán la misma regla (por definir y validar con simulaciones).

## 8. Motor de partidos

- Campo en 9 zonas (3 franjas × 3 carriles). La formación reparte jugadores por zona.
- El partido son ~120–160 posesiones. Cada avance es un duelo mano a mano según posición (ej. delantero centro vs central).
- Probabilidad de cada duelo = función logística de (atacante + modificadores) − (defensor + modificadores).
- Modificadores: rol, encaje, superioridad numérica en la zona, química, estrategia (tabla de §7), cansancio, moral/momentum, bonificaciones, azar controlado.
- Semilla aleatoria: un partido se puede repetir idéntico (repeticiones, anti-trampas).
- Objetivo de balance: un equipo 5 puntos de media inferior pero bien armado gana ~35–40 %.

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

---

## Pendiente de decidir

- Lista de formaciones y su tabla de ventajas.
