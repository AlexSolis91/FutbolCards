// Encaje: convierte una alineación (cartas + formación + estrategias + roles)
// en los atributos efectivos que usa el motor y en la media visible.
// El desglose (familiaridad, afinidad, química) es oculto para el usuario.

import {
  ORDEN_RAREZAS, PASO_RAREZA, rarezasDe, ROLES, PUESTOS, FORMACIONES, CASILLAS, OFENSIVAS, DEFENSIVAS, ENCAJE,
  LISTA_ATRIBUTOS, carrilDeX, pesosCarril, formacionDeCasillas,
} from './reglas.js';
import { aplicarBonificaciones } from './bonificaciones.js';

// Atributos de la ficha están en su rareza más alta; cada rareza por debajo
// resta PASO_RAREZA a todos los atributos (mínimo 1).
export function atributosDeRareza(ficha, rareza) {
  const propias = rarezasDe(ficha);
  if (!propias.includes(rareza)) throw new Error(`Rareza no disponible para ${ficha?.nombre ?? 'jugador'}: ${rareza}`);
  const resta = PASO_RAREZA * (ORDEN_RAREZAS.indexOf(propias.at(-1)) - ORDEN_RAREZAS.indexOf(rareza));
  const out = {};
  for (const a of LISTA_ATRIBUTOS) out[a] = Math.max(1, (ficha.atributos[a] ?? 1) - resta);
  return out;
}

export function promedioPonderado(attrs, pesos) {
  let suma = 0;
  let total = 0;
  for (const [a, w] of Object.entries(pesos)) {
    suma += (attrs[a] ?? 0) * w;
    total += w;
  }
  return total ? suma / total : 0;
}

export function mediaEnRol(attrs, rol) {
  return promedioPonderado(attrs, ROLES[rol].pesos);
}

// Pesos de todos los atributos que usa una estrategia ofensiva (3 fases).
const PERFIL_OFENSIVO = {};
for (const [id, s] of Object.entries(OFENSIVAS)) {
  const pesos = {};
  for (const fase of ['salida', 'creacion', 'ocasion']) {
    for (const [a, w] of Object.entries(s[fase])) pesos[a] = (pesos[a] ?? 0) + w;
  }
  PERFIL_OFENSIVO[id] = pesos;
}

// Afinidad del jugador con cada estrategia: lo que destaca en sus atributos
// clave respecto a su promedio en todas las estrategias (suma cero).
export function afinidades(ficha) {
  const calc = (perfiles) => {
    const valores = Object.fromEntries(
      Object.entries(perfiles).map(([id, pesos]) => [id, promedioPonderado(ficha.atributos, pesos)]),
    );
    const media = Object.values(valores).reduce((a, b) => a + b, 0) / Object.keys(valores).length;
    const out = {};
    for (const [id, v] of Object.entries(valores)) {
      const x = (v - media) / ENCAJE.afinidadDivisor;
      out[id] = Math.max(-ENCAJE.afinidadTope, Math.min(ENCAJE.afinidadTope, x));
    }
    return out;
  };
  return {
    ofensiva: calc(PERFIL_OFENSIVO),
    defensiva: calc(Object.fromEntries(Object.entries(DEFENSIVAS).map(([id, d]) => [id, d.atributos]))),
  };
}

export function familiaridad(ficha, rol) {
  const i = ficha.roles.indexOf(rol);
  if (i === -1) return ENCAJE.fueraDeRol;
  return ENCAJE.familiaridad[Math.min(i, ENCAJE.familiaridad.length - 1)];
}

// Vínculos de química por cercanía: cada jugador se une a sus compañeros más
// cercanos (hasta ENCAJE.vecinosCercanos) que estén a ENCAJE.distanciaVinculo
// o menos. Los vínculos son mutuos. posiciones: [{ x, y }].
export function vecinosPorCercania(posiciones) {
  const vecinos = posiciones.map(() => new Set());
  posiciones.forEach((a, i) => {
    posiciones
      .map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
      .filter((o) => o.j !== i && o.d <= ENCAJE.distanciaVinculo)
      .sort((u, v) => u.d - v.d)
      .slice(0, ENCAJE.vecinosCercanos)
      .forEach((o) => { vecinos[i].add(o.j); vecinos[o.j].add(i); });
  });
  return vecinos.map((v) => [...v]);
}

// Vecinos de una plantilla de formación (para pruebas y la interfaz).
export function vecinosFormacion(formacion) {
  return vecinosPorCercania(FORMACIONES[formacion].huecos);
}

// Casillas de una alineación: cada carta trae su casilla; si no (definiciones
// antiguas), se toman de la plantilla de la formación en orden.
export function casillasDeAlineacion(equipo) {
  return equipo.alineacion.map((carta, i) => {
    const id = carta.casilla ?? FORMACIONES[equipo.formacion]?.huecos[i]?.casilla;
    if (!CASILLAS[id]) throw new Error(`Casilla desconocida en la posición ${i + 1}: ${id}`);
    return id;
  });
}

export function puntosQuimica(jugadores, vecinos, i) {
  let puntos = 0;
  for (const j of vecinos[i]) {
    if (jugadores[j].nacion === jugadores[i].nacion) puntos++;
    if (jugadores[j].escuela && jugadores[j].escuela === jugadores[i].escuela) puntos++;
  }
  return puntos;
}

export function ajusteQuimica(puntos) {
  const t = ENCAJE.quimica;
  return t[Math.min(puntos, t.length - 1)];
}

function rolPorDefecto(ficha, puesto) {
  return ficha.roles.find((r) => PUESTOS[puesto].roles.includes(r)) ?? PUESTOS[puesto].roles[0];
}

// equipo: { nombre, formacion?, ofensiva, defensiva, capitan (índice),
//           alineacion: [{ ficha, rareza, rol?, casilla? }] × 11 }
export function prepararEquipo(equipo) {
  if (!OFENSIVAS[equipo.ofensiva]) throw new Error(`Estrategia ofensiva desconocida: ${equipo.ofensiva}`);
  if (!DEFENSIVAS[equipo.defensiva]) throw new Error(`Estrategia defensiva desconocida: ${equipo.defensiva}`);
  if (equipo.alineacion.length !== 11) throw new Error('La alineación debe tener 11 jugadores');
  const ids = new Set(equipo.alineacion.map((c) => c.ficha.id));
  if (ids.size !== equipo.alineacion.length) throw new Error('Un jugador no puede estar dos veces en la alineación');
  const casillas = casillasDeAlineacion(equipo);
  if (new Set(casillas).size !== casillas.length) throw new Error('Dos jugadores no pueden ocupar la misma casilla');
  if (!casillas.includes('POR')) throw new Error('Falta el portero');
  const nombreFormacion = formacionDeCasillas(casillas);

  const jugadores = equipo.alineacion.map((carta, i) => {
    const hueco = { ...CASILLAS[casillas[i]], casilla: casillas[i] };
    const puesto = PUESTOS[hueco.puesto];
    const rol = carta.rol ?? rolPorDefecto(carta.ficha, hueco.puesto);
    if (!puesto.roles.includes(rol)) throw new Error(`El rol ${rol} no existe para el puesto ${hueco.puesto}`);
    const presencia = { def: 0, med: 0, ata: 0 };
    for (const f of Object.keys(presencia)) {
      presencia[f] = Math.max(0, (puesto.presencia[f] ?? 0) + (ROLES[rol].presencia?.[f] ?? 0));
    }
    // Todos los jugadores de campo pesan lo mismo en total: la casilla y el
    // rol solo deciden en qué franjas está (si no, unas formaciones tendrían
    // "más gente" que otras).
    const total = presencia.def + presencia.med + presencia.ata;
    if (total > 0) for (const f of Object.keys(presencia)) presencia[f] *= ENCAJE.presenciaTotal / total;
    return {
      id: carta.ficha.id,
      nombre: carta.ficha.nombre,
      ficha: carta.ficha,
      nacion: carta.ficha.nacion,
      escuela: carta.ficha.escuela,
      rareza: carta.rareza,
      rol,
      puesto: hueco.puesto,
      casilla: hueco.casilla,
      linea: puesto.linea,
      carril: carrilDeX(hueco.x),
      carriles: pesosCarril(hueco.x),
      x: hueco.x,
      y: hueco.y,
      presencia,
      esCapitan: i === equipo.capitan,
      base: atributosDeRareza(carta.ficha, carta.rareza),
      bonos: {},
      energia: 100,
    };
  });

  const vecinos = vecinosPorCercania(jugadores);
  jugadores.forEach((j, i) => {
    const fam = familiaridad(j.ficha, j.rol);
    let afi = 0;
    if (j.linea !== 'POR') {
      const af = afinidades(j.ficha);
      const w = ENCAJE.pesoOfensivo[j.linea];
      afi = w * af.ofensiva[equipo.ofensiva] + (1 - w) * af.defensiva[equipo.defensiva];
    }
    const qui = ajusteQuimica(puntosQuimica(jugadores, vecinos, i));
    j.desglose = { familiaridad: fam, afinidad: afi, quimica: qui };
    j.ajuste = fam + afi + qui;
  });

  const bonificaciones = aplicarBonificaciones(jugadores);

  for (const j of jugadores) {
    j.attrs = {};
    for (const a of LISTA_ATRIBUTOS) j.attrs[a] = Math.max(1, j.base[a] + j.ajuste + (j.bonos[a] ?? 0));
    j.mediaBase = Math.round(mediaEnRol(j.base, j.rol));
    j.mediaExacta = mediaEnRol(j.attrs, j.rol);
    j.media = Math.round(j.mediaExacta);
  }

  return {
    nombre: equipo.nombre,
    formacion: nombreFormacion,
    ofensiva: equipo.ofensiva,
    defensiva: equipo.defensiva,
    jugadores,
    bonificaciones,
    media: Math.round(jugadores.reduce((s, j) => s + j.media, 0) / jugadores.length),
  };
}
