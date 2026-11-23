// Constantes oficiales del juego. Toda regla aquí debe estar en docs/reglas.md.

// ---------------------------------------------------------------- Atributos
export const ATRIBUTOS = {
  definicion: 'Definición',
  cabeza: 'Remate de cabeza',
  tiroLejano: 'Tiro lejano',
  paseCorto: 'Pase corto',
  paseLargo: 'Pase largo',
  vision: 'Visión',
  centros: 'Centros',
  regate: 'Regate',
  control: 'Control',
  entrada: 'Entrada',
  marcaje: 'Marcaje',
  anticipacion: 'Anticipación',
  velocidad: 'Velocidad',
  resistencia: 'Resistencia',
  fuerza: 'Fuerza',
  salto: 'Salto',
  posicionamiento: 'Posicionamiento',
  compostura: 'Compostura',
  reflejos: 'Reflejos',
  colocacion: 'Colocación',
  juegoAereo: 'Juego aéreo',
  juegoPie: 'Juego con el pie',
};
export const LISTA_ATRIBUTOS = Object.keys(ATRIBUTOS);
export const ATRIBUTOS_PORTERO = ['reflejos', 'colocacion', 'juegoAereo', 'juegoPie'];

// ---------------------------------------------------------------- Rarezas
// Probabilidad = de que una carta de sobre salga de esa rareza.
export const RAREZAS = {
  comun: { nombre: 'Común', color: 'blanco', probabilidad: 0.9 },
  raro: { nombre: 'Raro', color: 'azul', probabilidad: 0.09 },
  epico: { nombre: 'Épico', color: 'morado', probabilidad: 0.0099 },
  legendario: { nombre: 'Legendario', color: 'dorado', probabilidad: 0.0001 },
};
export const ORDEN_RAREZAS = ['comun', 'raro', 'epico', 'legendario'];
// Cada jugador real existe solo en 2 rarezas seguidas, según su categoría.
// Sus atributos se escriben en la rareza alta; la baja resta PASO_RAREZA.
export const CATEGORIAS = {
  estrella: { nombre: 'Estrella', rarezas: ['epico', 'legendario'] },
  figura: { nombre: 'Figura', rarezas: ['raro', 'epico'] },
  base: { nombre: 'Base', rarezas: ['comun', 'raro'] },
};
export const PASO_RAREZA = 6;
// Rarezas en las que existe un jugador (los ficticios de prueba, sin
// categoría, existen en las 4).
export function rarezasDe(ficha) {
  return CATEGORIAS[ficha?.categoria]?.rarezas ?? ORDEN_RAREZAS;
}
export const COPIAS_PARA_MEJORAR = 5;
// Techo de la media base (rol natural, Legendario). Cristiano Ronaldo, Messi,
// Pelé y Maradona son la cúspide y comparten este techo; nadie lo supera.
// El encaje y las bonificaciones sí pueden subir o bajar la media en el partido.
export const MEDIA_MAXIMA_LEGENDARIO = 96;
export const JUGADORES_POR_SOBRE = 3;

// ---------------------------------------------------------------- Roles
// pesos: cómo se calcula la media del jugador en ese rol (suman 1).
// presencia: ajuste a la presencia del puesto en cada franja del campo.
export const ROLES = {
  portero: { nombre: 'Portero', linea: 'POR', pesos: { reflejos: 0.35, colocacion: 0.3, juegoAereo: 0.2, juegoPie: 0.15 } },
  central: { nombre: 'Central', linea: 'DEF', pesos: { marcaje: 0.25, entrada: 0.25, anticipacion: 0.15, salto: 0.1, fuerza: 0.1, posicionamiento: 0.1, velocidad: 0.05 } },
  libero: { nombre: 'Líbero', linea: 'DEF', pesos: { anticipacion: 0.2, posicionamiento: 0.15, paseCorto: 0.15, paseLargo: 0.15, marcaje: 0.15, entrada: 0.1, compostura: 0.1 }, presencia: { med: 0.2 } },
  lateral: { nombre: 'Lateral', linea: 'DEF', pesos: { velocidad: 0.2, entrada: 0.2, marcaje: 0.15, centros: 0.15, resistencia: 0.15, anticipacion: 0.15 } },
  carrilero: { nombre: 'Carrilero', linea: 'DEF', pesos: { velocidad: 0.2, resistencia: 0.2, centros: 0.2, regate: 0.1, entrada: 0.15, paseCorto: 0.15 }, presencia: { def: -0.1, med: 0.15, ata: 0.2 } },
  ancla: { nombre: 'Ancla', linea: 'MED', pesos: { entrada: 0.2, anticipacion: 0.2, marcaje: 0.15, posicionamiento: 0.15, fuerza: 0.1, paseCorto: 0.1, resistencia: 0.1 }, presencia: { def: 0.15, med: -0.1 } },
  regista: { nombre: 'Regista', linea: 'MED', pesos: { vision: 0.25, paseCorto: 0.2, paseLargo: 0.2, compostura: 0.15, control: 0.1, anticipacion: 0.1 } },
  boxToBox: { nombre: 'Box-to-box', linea: 'MED', pesos: { resistencia: 0.2, paseCorto: 0.15, entrada: 0.15, tiroLejano: 0.1, fuerza: 0.1, regate: 0.1, anticipacion: 0.1, posicionamiento: 0.1 }, presencia: { def: 0.1, ata: 0.1 } },
  mediapunta: { nombre: 'Mediapunta', linea: 'MED', pesos: { vision: 0.25, paseCorto: 0.2, regate: 0.2, control: 0.15, tiroLejano: 0.1, compostura: 0.1 } },
  extremo: { nombre: 'Extremo', linea: 'DEL', pesos: { velocidad: 0.25, regate: 0.25, centros: 0.2, control: 0.1, definicion: 0.1, resistencia: 0.1 } },
  interior: { nombre: 'Delantero interior', linea: 'DEL', pesos: { regate: 0.25, definicion: 0.25, velocidad: 0.2, control: 0.15, tiroLejano: 0.15 }, presencia: { ata: 0.1, med: -0.1 } },
  segundoDelantero: { nombre: 'Segundo delantero', linea: 'DEL', pesos: { definicion: 0.2, regate: 0.2, vision: 0.15, paseCorto: 0.15, control: 0.15, velocidad: 0.15 }, presencia: { med: 0.15 } },
  falso9: { nombre: 'Falso 9', linea: 'DEL', pesos: { vision: 0.2, paseCorto: 0.2, regate: 0.2, control: 0.15, definicion: 0.15, compostura: 0.1 }, presencia: { med: 0.3, ata: -0.15 } },
  delanteroArea: { nombre: 'Delantero de área', linea: 'DEL', pesos: { definicion: 0.35, cabeza: 0.2, posicionamiento: 0.2, compostura: 0.15, fuerza: 0.1 } },
};

// ---------------------------------------------------------------- Puestos
// Cada hueco de una formación es un puesto. presencia = cuánto participa en
// cada franja (def = propio tercio defensivo, med, ata = tercio rival).
export const PUESTOS = {
  POR: { nombre: 'Portero', linea: 'POR', roles: ['portero'], presencia: {} },
  DFC: { nombre: 'Defensa central', linea: 'DEF', roles: ['central', 'libero'], presencia: { def: 1 } },
  LI: { nombre: 'Lateral izquierdo', linea: 'DEF', roles: ['lateral', 'carrilero'], presencia: { def: 1, med: 0.4, ata: 0.1 } },
  LD: { nombre: 'Lateral derecho', linea: 'DEF', roles: ['lateral', 'carrilero'], presencia: { def: 1, med: 0.4, ata: 0.1 } },
  MCD: { nombre: 'Contención', linea: 'MED', roles: ['ancla', 'regista'], presencia: { def: 0.45, med: 0.8 } },
  MC: { nombre: 'Mediocentro', linea: 'MED', roles: ['boxToBox', 'regista', 'ancla', 'mediapunta'], presencia: { def: 0.2, med: 1, ata: 0.25 } },
  II: { nombre: 'Interior izquierdo', linea: 'MED', roles: ['boxToBox', 'mediapunta', 'regista'], presencia: { def: 0.2, med: 1, ata: 0.35 } },
  ID: { nombre: 'Interior derecho', linea: 'MED', roles: ['boxToBox', 'mediapunta', 'regista'], presencia: { def: 0.2, med: 1, ata: 0.35 } },
  MI: { nombre: 'Medio izquierdo', linea: 'MED', roles: ['extremo', 'carrilero', 'boxToBox'], presencia: { def: 0.2, med: 0.9, ata: 0.4 } },
  MD: { nombre: 'Medio derecho', linea: 'MED', roles: ['extremo', 'carrilero', 'boxToBox'], presencia: { def: 0.2, med: 0.9, ata: 0.4 } },
  MCO: { nombre: 'Mediapunta', linea: 'MED', roles: ['mediapunta', 'falso9'], presencia: { med: 0.6, ata: 0.65 } },
  EI: { nombre: 'Extremo izquierdo', linea: 'DEL', roles: ['extremo', 'interior'], presencia: { med: 0.3, ata: 1 } },
  ED: { nombre: 'Extremo derecho', linea: 'DEL', roles: ['extremo', 'interior'], presencia: { med: 0.3, ata: 1 } },
  SD: { nombre: 'Segundo delantero', linea: 'DEL', roles: ['segundoDelantero', 'falso9', 'interior'], presencia: { med: 0.45, ata: 0.85 } },
  DC: { nombre: 'Delantero centro', linea: 'DEL', roles: ['delanteroArea', 'falso9', 'interior'], presencia: { med: 0.15, ata: 1 } },
};

// ---------------------------------------------------------------- Formaciones
// x: 0 = banda izquierda, 100 = banda derecha. y: 0 = portería propia.
// vinculos: pares de huecos conectados (química). Todas tienen 17 para que
// ninguna formación tenga más química posible que otra.
const p = (puesto, x, y) => ({ puesto, x, y });
const POR = p('POR', 50, 5);
const DEF4 = [p('LI', 12, 25), p('DFC', 37, 20), p('DFC', 63, 20), p('LD', 88, 25)];

export const FORMACIONES = {
  '4-4-2': { huecos: [POR, ...DEF4, p('MI', 12, 55), p('MC', 37, 50), p('MC', 63, 50), p('MD', 88, 55), p('DC', 37, 82), p('DC', 63, 82)],
    vinculos: [[0, 2], [0, 3], [1, 2], [2, 3], [3, 4], [1, 5], [2, 6], [3, 7], [4, 8], [5, 6], [6, 7], [7, 8], [6, 9], [7, 10], [9, 10], [5, 9], [8, 10]] },
  '4-3-3': { huecos: [POR, ...DEF4, p('II', 25, 50), p('MCD', 50, 42), p('ID', 75, 50), p('EI', 15, 80), p('DC', 50, 85), p('ED', 85, 80)],
    vinculos: [[0, 2], [0, 3], [1, 2], [2, 3], [3, 4], [1, 5], [2, 6], [3, 6], [4, 7], [5, 6], [6, 7], [5, 8], [7, 10], [8, 9], [9, 10], [1, 8], [4, 10]] },
  '4-2-3-1': { huecos: [POR, ...DEF4, p('MCD', 37, 40), p('MCD', 63, 40), p('MI', 15, 65), p('MCO', 50, 65), p('MD', 85, 65), p('DC', 50, 87)],
    vinculos: [[0, 2], [0, 3], [1, 2], [2, 3], [3, 4], [2, 5], [3, 6], [5, 6], [1, 7], [4, 9], [5, 7], [6, 9], [7, 8], [8, 9], [8, 10], [7, 10], [9, 10]] },
  '3-5-2': { huecos: [POR, p('DFC', 25, 20), p('DFC', 50, 18), p('DFC', 75, 20), p('MI', 10, 55), p('II', 30, 50), p('MCD', 50, 42), p('ID', 70, 50), p('MD', 90, 55), p('DC', 37, 82), p('DC', 63, 82)],
    vinculos: [[0, 1], [0, 2], [0, 3], [1, 2], [2, 3], [1, 4], [3, 8], [1, 5], [2, 6], [3, 7], [4, 5], [5, 6], [6, 7], [7, 8], [5, 9], [7, 10], [9, 10]] },
  '5-3-2': { huecos: [POR, p('LI', 8, 30), p('DFC', 28, 20), p('DFC', 50, 18), p('DFC', 72, 20), p('LD', 92, 30), p('II', 25, 50), p('MC', 50, 48), p('ID', 75, 50), p('DC', 37, 82), p('DC', 63, 82)],
    vinculos: [[0, 2], [0, 3], [0, 4], [1, 2], [2, 3], [3, 4], [4, 5], [1, 6], [2, 6], [3, 7], [4, 8], [5, 8], [6, 7], [7, 8], [6, 9], [8, 10], [9, 10]] },
  // 4-4-2 en rombo: contención, dos interiores y mediapunta.
  '4-1-2-1-2': { huecos: [POR, ...DEF4, p('MCD', 50, 40), p('II', 25, 52), p('ID', 75, 52), p('MCO', 50, 65), p('DC', 37, 85), p('DC', 63, 85)],
    vinculos: [[0, 2], [0, 3], [1, 2], [2, 3], [3, 4], [1, 6], [4, 7], [2, 5], [3, 5], [5, 6], [5, 7], [6, 8], [7, 8], [8, 9], [8, 10], [9, 10], [5, 8]] },
  // Segundo delantero por detrás del 9.
  '4-4-1-1': { huecos: [POR, ...DEF4, p('MI', 12, 50), p('MC', 37, 45), p('MC', 63, 45), p('MD', 88, 50), p('SD', 50, 68), p('DC', 50, 87)],
    vinculos: [[0, 2], [0, 3], [1, 2], [2, 3], [3, 4], [1, 5], [2, 6], [3, 7], [4, 8], [5, 6], [6, 7], [7, 8], [6, 9], [7, 9], [9, 10], [5, 10], [8, 10]] },
  '4-1-4-1': { huecos: [POR, ...DEF4, p('MCD', 50, 38), p('MI', 12, 58), p('II', 37, 55), p('ID', 63, 55), p('MD', 88, 58), p('DC', 50, 86)],
    vinculos: [[0, 2], [0, 3], [1, 2], [2, 3], [3, 4], [2, 5], [3, 5], [1, 6], [4, 9], [5, 7], [5, 8], [6, 7], [7, 8], [8, 9], [6, 10], [9, 10], [7, 10]] },
  '3-4-3': { huecos: [POR, p('DFC', 25, 20), p('DFC', 50, 18), p('DFC', 75, 20), p('MI', 12, 50), p('MC', 37, 46), p('MC', 63, 46), p('MD', 88, 50), p('EI', 18, 80), p('DC', 50, 86), p('ED', 82, 80)],
    vinculos: [[0, 1], [0, 2], [0, 3], [1, 2], [2, 3], [1, 4], [3, 7], [1, 5], [3, 6], [4, 5], [5, 6], [6, 7], [4, 8], [7, 10], [8, 9], [9, 10], [5, 9]] },
};
export const ORDEN_FORMACIONES = ['4-4-2', '4-3-3', '4-2-3-1', '3-5-2', '5-3-2', '4-1-2-1-2', '4-4-1-1', '4-1-4-1', '3-4-3'];

// Regla de oro: contra las otras formaciones, cada una tiene la MISMA cantidad
// de ++ (+2), + (+1), − (−1) y −− (−2): con 9 formaciones, dos de cada.
// Contra sí misma, neutral. Tabla cíclica antisimétrica (si A tiene ++ contra
// B, B tiene −− contra A): valor según la distancia en ORDEN_FORMACIONES.
// El número de formaciones debe ser impar y la tabla seguir el patrón.
const CICLO_FORMACION = [0, 2, -1, 1, -2, 2, -1, 1, -2];
export function ventajaFormacion(propia, rival) {
  const n = ORDEN_FORMACIONES.length;
  const i = ORDEN_FORMACIONES.indexOf(propia);
  const j = ORDEN_FORMACIONES.indexOf(rival);
  return CICLO_FORMACION[(j - i + n) % n];
}

export const CARRILES = ['izq', 'cen', 'der'];
export function carrilDeX(x) {
  if (x < 35) return 'izq';
  if (x > 65) return 'der';
  return 'cen';
}
export const ESPEJO_CARRIL = { izq: 'der', cen: 'cen', der: 'izq' };
export const ESPEJO_FRANJA = { def: 'ata', med: 'med', ata: 'def' };

// ---------------------------------------------------------------- Estrategias
// Atributos que pesan en cada fase del ataque, según la estrategia ofensiva.
export const OFENSIVAS = {
  posesion: {
    nombre: 'Posesión',
    salida: { paseCorto: 0.45, control: 0.3, compostura: 0.25 },
    creacion: { paseCorto: 0.35, vision: 0.35, control: 0.3 },
    ocasion: { regate: 0.35, control: 0.3, vision: 0.35 },
    carriles: { izq: 0.25, cen: 0.5, der: 0.25 },
    cabezazo: 0.1,
    reciclaje: 0.4,
    tempo: 1.25,
  },
  contraataque: {
    nombre: 'Contraataque',
    salida: { paseLargo: 0.4, vision: 0.3, compostura: 0.3 },
    creacion: { velocidad: 0.45, regate: 0.3, paseCorto: 0.25 },
    ocasion: { velocidad: 0.45, regate: 0.25, definicion: 0.3 },
    carriles: { izq: 0.3, cen: 0.4, der: 0.3 },
    cabezazo: 0.1,
    reciclaje: 0.15,
    tempo: 0.8,
    transicion: 0.35,
  },
  directo: {
    nombre: 'Juego directo',
    salida: { paseLargo: 0.6, fuerza: 0.2, compostura: 0.2 },
    creacion: { paseLargo: 0.35, fuerza: 0.3, control: 0.35 },
    ocasion: { fuerza: 0.35, cabeza: 0.3, posicionamiento: 0.35 },
    carriles: { izq: 0.2, cen: 0.6, der: 0.2 },
    cabezazo: 0.45,
    reciclaje: 0.2,
    tempo: 0.75,
  },
  bandas: {
    nombre: 'Juego por bandas',
    salida: { paseCorto: 0.4, velocidad: 0.3, control: 0.3 },
    creacion: { velocidad: 0.35, regate: 0.3, resistencia: 0.35 },
    ocasion: { centros: 0.4, velocidad: 0.3, regate: 0.3 },
    carriles: { izq: 0.38, cen: 0.24, der: 0.38 },
    cabezazo: 0.65,
    reciclaje: 0.3,
    tempo: 1.0,
  },
};
export const ORDEN_OFENSIVAS = ['posesion', 'contraataque', 'directo', 'bandas'];

// presencia: multiplica cuántos defensores hay en cada franja (propia).
export const DEFENSIVAS = {
  presionAlta: { nombre: 'Presión alta', atributos: { velocidad: 0.35, resistencia: 0.3, entrada: 0.35 }, presencia: { ata: 1.35, med: 1.1, def: 0.85 }, fatiga: 1.5 },
  bloqueMedio: { nombre: 'Bloque medio', atributos: { anticipacion: 0.4, posicionamiento: 0.35, entrada: 0.25 }, presencia: { ata: 0.9, med: 1.25, def: 1.0 }, fatiga: 1.0 },
  bloqueBajo: { nombre: 'Bloque bajo', atributos: { marcaje: 0.3, posicionamiento: 0.3, fuerza: 0.2, salto: 0.2 }, presencia: { ata: 0.65, med: 1.0, def: 1.35 }, fatiga: 0.85 },
  marcajeHombre: { nombre: 'Marcaje al hombre', atributos: { marcaje: 0.4, velocidad: 0.3, fuerza: 0.3 }, presencia: { ata: 1.0, med: 1.1, def: 1.1 }, fatiga: 1.2 },
};
export const ORDEN_DEFENSIVAS = ['presionAlta', 'bloqueMedio', 'bloqueBajo', 'marcajeHombre'];

// Regla de oro: cada fila y cada columna tienen ++ (+2), + (+1), − (−1), −− (−2).
export const TABLA_ESTRATEGIAS = {
  posesion: { presionAlta: -2, bloqueMedio: 2, bloqueBajo: -1, marcajeHombre: 1 },
  contraataque: { presionAlta: 2, bloqueMedio: 1, bloqueBajo: -2, marcajeHombre: -1 },
  directo: { presionAlta: 1, bloqueMedio: -1, bloqueBajo: 2, marcajeHombre: -2 },
  bandas: { presionAlta: -1, bloqueMedio: -2, bloqueBajo: 1, marcajeHombre: 2 },
};

// ---------------------------------------------------------------- Encaje (oculto)
export const ENCAJE = {
  // Ajuste a todos los atributos según el rol asignado.
  familiaridad: [0, -3, -5], // rol natural, 1.er secundario, 2.º secundario
  fueraDeRol: -12,
  // Afinidad con las estrategias: desviación / divisor, con tope.
  afinidadDivisor: 3,
  afinidadTope: 4,
  // Peso de la estrategia ofensiva (el resto, defensiva) según la línea.
  pesoOfensivo: { POR: 0, DEF: 0.2, MED: 0.5, DEL: 0.8 },
  // Química: puntos de vínculo con compañeros conectados → ajuste.
  quimica: [-2, -1, 0, 1, 2, 3], // 0, 1, 2, 3, 4, 5+ puntos
};

// ---------------------------------------------------------------- Escuelas de juego
// Estilo con el que se identifica cada jugador (química: misma escuela = +1).
// Son estilos, no países, para no repetir la química por nación.
export const ESCUELAS = {
  tikiTaka: { nombre: 'Tiki-taka', descripcion: 'Toque, posesión y pase corto' },
  jogoBonito: { nombre: 'Jogo bonito', descripcion: 'Regate, fantasía e improvisación' },
  catenaccio: { nombre: 'Catenaccio', descripcion: 'Orden defensivo y contra' },
  futbolTotal: { nombre: 'Fútbol total', descripcion: 'Versatilidad e intercambio de posiciones' },
  gegenpressing: { nombre: 'Gegenpressing', descripcion: 'Presión e intensidad' },
  garra: { nombre: 'Garra', descripcion: 'Lucha, carácter y duelo' },
  vertigo: { nombre: 'Vértigo', descripcion: 'Velocidad, verticalidad y gol' },
  potencia: { nombre: 'Potencia', descripcion: 'Físico, juego aéreo y juego directo' },
};
