// Motor de partidos. Sin DOM: produce eventos que la interfaz reproduce.
//
// El partido es una sucesión de posesiones. Cada posesión avanza por franjas
// (salida → creación → ocasión → remate). Cada avance es un duelo entre los
// jugadores del atacante y del defensor presentes en esa zona del campo.
// Probabilidad del duelo = logística de:
//   base de la fase + (rating atacante − rating defensor) / escala
//   + superioridad numérica + tabla de estrategias + tabla de formaciones + moral.

import { crearRng } from './rng.js';
import {
  OFENSIVAS, DEFENSIVAS, TABLA_ESTRATEGIAS, ventajaFormacion, CARRILES,
  ESPEJO_CARRIL, ESPEJO_FRANJA,
} from './reglas.js';
import { prepararEquipo, promedioPonderado } from './encaje.js';

export const MOTOR = {
  duracion: 5400, // segundos
  descanso: 2700,
  base: { salida: 0.9, creacion: 0.0, ocasion: -1.12 },
  escala: 34,
  pesoMedia: 0.5,
  superioridad: 0.6,
  valorEstrategia: { 2: 0.17, 1: 0.06, 0: 0, '-1': -0.06, '-2': -0.17 },
  valorFormacion: { 2: 0.09, 1: 0.04, 0: 0, '-1': -0.04, '-2': -0.09 },
  carrilAdyacente: 0.3,
  segundos: { salida: 12, creacion: 15, ocasion: 10 },
  disparoLejano: 0.1,
  xg: { pieCentro: 0.16, pieBanda: 0.11, cabeza: 0.1, lejano: 0.04 },
  escalaRemate: 30,
  probGol: { min: 0.01, max: 0.7 },
  aPuerta: 0.45,
  moral: { valor: 0.1, duracion: 600 },
  fatiga: { porMinuto: 0.33, efecto: 0.25, descanso: 8 },
  maxCambios: 5,
  // Calibración (logit) para que ninguna estrategia ni formación sea superior
  // por sí sola. La calcula herramientas/calibrar.mjs; no tocar a mano.
  calibracion: {
    ofensiva: { posesion: -0.172, contraataque: -0.121, directo: 0.142, bandas: 0.148 },
    defensiva: { presionAlta: 0.06, bloqueMedio: -0.069, bloqueBajo: -0.003, marcajeHombre: 0.011 },
    formacion: { '4-4-2': -0.055, '4-3-3': 0.044, '4-2-3-1': 0.007, '3-5-2': 0.016, '5-3-2': 0.023, '4-1-2-1-2': -0.013, '4-4-1-1': -0.044, '4-1-4-1': -0.019, '3-4-3': 0.042 },
  },
};

const REMATE = {
  pie: { definicion: 0.6, compostura: 0.4 },
  cabeza: { cabeza: 0.6, salto: 0.4 },
  lejano: { tiroLejano: 0.7, compostura: 0.3 },
};
const PARADA = {
  pie: { reflejos: 0.5, colocacion: 0.5 },
  cabeza: { juegoAereo: 0.5, colocacion: 0.3, reflejos: 0.2 },
  lejano: { reflejos: 0.5, colocacion: 0.5 },
};

const sigmoide = (x) => 1 / (1 + Math.exp(-x));

function factorFatiga(j) {
  return 1 - MOTOR.fatiga.efecto * (1 - j.energia / 100);
}

function presenciaEnCarril(j, carril) {
  if (j.carril === carril) return 1;
  if (j.carril === 'cen' || carril === 'cen') return MOTOR.carrilAdyacente;
  return 0;
}

// Fuerza de un equipo en una zona (franja + carril) con ciertos atributos.
function zona(eq, franja, carril, pesos, multiplicador = 1) {
  let n = 0;
  let suma = 0;
  const participantes = [];
  for (const j of eq.jugadores) {
    if (j.linea === 'POR') continue;
    const w = (j.presencia[franja] ?? 0) * presenciaEnCarril(j, carril);
    if (w <= 0) continue;
    // Mitad calidad general en su rol, mitad atributos que pide la estrategia.
    const r = (MOTOR.pesoMedia * j.mediaExacta + (1 - MOTOR.pesoMedia) * promedioPonderado(j.attrs, pesos)) * factorFatiga(j);
    suma += w * r;
    n += w;
    participantes.push({ j, peso: w * r });
  }
  return { rating: n > 0 ? suma / n : 30, n: Math.max(0.2, n * multiplicador), participantes };
}

function elegirParticipante(rng, z) {
  if (!z.participantes.length) return null;
  return rng.ponderado(z.participantes, (p) => p.peso).j;
}

export function crearPartido({ local, visitante, semilla = 1 }) {
  const rng = crearRng(semilla);
  const st = {
    semilla,
    t: 0,
    definiciones: [local, visitante],
    eq: [prepararEquipo(local), prepararEquipo(visitante)],
    marcador: [0, 0],
    lado: rng() < 0.5 ? 0 : 1,
    franja: 'def',
    moralHasta: [-1, -1],
    cambios: [0, 0],
    eventos: [],
    stats: [0, 1].map(() => ({ posesion: 0, tiros: 0, aPuerta: 0, xg: 0, duelosGanados: 0, duelosPerdidos: 0 })),
    descansoHecho: false,
    terminado: false,
  };
  st.saque = st.lado;

  const emitir = (ev) => {
    const e = { t: Math.round(st.t), minuto: Math.min(90, Math.floor(st.t / 60) + 1), ...ev };
    st.eventos.push(e);
    return e;
  };

  function avanzarTiempo(dt, lado) {
    st.t += dt;
    st.stats[lado].posesion += dt;
    for (const eq of st.eq) {
      const ritmo = DEFENSIVAS[eq.defensiva].fatiga;
      for (const j of eq.jugadores) {
        if (j.linea === 'POR') continue;
        const gasto = (dt / 60) * MOTOR.fatiga.porMinuto * ritmo * Math.max(0.2, 1.35 - j.attrs.resistencia / 100);
        j.energia = Math.max(0, j.energia - gasto);
      }
    }
  }

  function moral(lado) {
    return st.t < st.moralHasta[lado] ? MOTOR.moral.valor : 0;
  }

  function duelo(fase, lado, franja, carril) {
    const atq = st.eq[lado];
    const def = st.eq[1 - lado];
    const of = OFENSIVAS[atq.ofensiva];
    const de = DEFENSIVAS[def.defensiva];
    const A = zona(atq, franja, carril, of[fase]);
    const fr = ESPEJO_FRANJA[franja];
    const D = zona(def, fr, ESPEJO_CARRIL[carril], de.atributos, de.presencia[fr]);
    const logit =
      MOTOR.base[fase] +
      (A.rating - D.rating) / MOTOR.escala +
      MOTOR.superioridad * Math.log(A.n / D.n) +
      MOTOR.valorEstrategia[TABLA_ESTRATEGIAS[atq.ofensiva][def.defensiva]] +
      MOTOR.valorFormacion[ventajaFormacion(atq.formacion, def.formacion)] +
      moral(lado) - moral(1 - lado) +
      MOTOR.calibracion.ofensiva[atq.ofensiva] - MOTOR.calibracion.defensiva[def.defensiva] +
      MOTOR.calibracion.formacion[atq.formacion] - MOTOR.calibracion.formacion[def.formacion];
    const p = sigmoide(logit);
    const exito = rng() < p;
    st.stats[lado][exito ? 'duelosGanados' : 'duelosPerdidos']++;
    return { exito, p, A, D, atacante: elegirParticipante(rng, A), defensor: elegirParticipante(rng, D) };
  }

  function elegirCarril(eq) {
    const of = OFENSIVAS[eq.ofensiva];
    return rng.ponderado(CARRILES, (c) => {
      const z = zona(eq, 'ata', c, { velocidad: 1 });
      return of.carriles[c] * Math.sqrt(z.n);
    });
  }

  function disparo(lado, tipo, carril, zonaAtaque, asistente) {
    const atq = st.eq[lado];
    const def = st.eq[1 - lado];
    const z = zonaAtaque;
    const tirador = z.participantes.length
      ? rng.ponderado(z.participantes, (p) => p.peso * promedioPonderado(p.j.attrs, REMATE[tipo]) / 50).j
      : atq.jugadores[atq.jugadores.length - 1];
    const portero = def.jugadores.find((j) => j.linea === 'POR');
    const S = promedioPonderado(tirador.attrs, REMATE[tipo]) * factorFatiga(tirador);
    const G = promedioPonderado(portero.attrs, PARADA[tipo]);
    const xgBase = tipo === 'lejano' ? MOTOR.xg.lejano
      : tipo === 'cabeza' ? MOTOR.xg.cabeza
      : carril === 'cen' ? MOTOR.xg.pieCentro : MOTOR.xg.pieBanda;
    const p = Math.min(MOTOR.probGol.max, Math.max(MOTOR.probGol.min, xgBase * Math.exp((S - G) / MOTOR.escalaRemate)));
    const s = st.stats[lado];
    s.tiros++;
    s.xg += p;
    const asis = asistente && asistente !== tirador ? asistente : null;
    if (rng() < p) {
      s.aPuerta++;
      st.marcador[lado]++;
      st.moralHasta[lado] = st.t + MOTOR.moral.duracion;
      emitir({ tipo: 'gol', lado, jugador: tirador.id, asistente: asis?.id ?? null, remate: tipo, marcador: [...st.marcador] });
    } else if (rng() < MOTOR.aPuerta) {
      s.aPuerta++;
      emitir({ tipo: 'parada', lado, jugador: tirador.id, portero: portero.id, remate: tipo });
    } else {
      emitir({ tipo: 'fuera', lado, jugador: tirador.id, remate: tipo });
    }
    st.lado = 1 - lado;
    st.franja = 'def';
  }

  function perdida(lado, franja, r) {
    st.lado = 1 - lado;
    st.franja = ESPEJO_FRANJA[franja];
    emitir({ tipo: 'perdida', lado, jugador: r.atacante?.id ?? null, recupera: r.defensor?.id ?? null, franja });
    const nuevo = OFENSIVAS[st.eq[st.lado].ofensiva];
    if (nuevo.transicion && st.franja !== 'ata' && rng() < nuevo.transicion) {
      st.franja = st.franja === 'def' ? 'med' : 'ata';
      emitir({ tipo: 'contragolpe', lado: st.lado, jugador: r.defensor?.id ?? null });
    }
  }

  // Juega una posesión completa. Devuelve los eventos que produjo.
  function paso() {
    if (st.terminado) return [];
    const desde = st.eventos.length;
    if (!st.descansoHecho && st.t >= MOTOR.descanso) {
      st.descansoHecho = true;
      for (const eq of st.eq) for (const j of eq.jugadores) j.energia = Math.min(100, j.energia + MOTOR.fatiga.descanso);
      emitir({ tipo: 'descanso', marcador: [...st.marcador] });
      st.lado = 1 - st.saque;
      st.franja = 'def';
    }
    const lado = st.lado;
    const atq = st.eq[lado];
    const of = OFENSIVAS[atq.ofensiva];
    let franja = st.franja;
    let carril = elegirCarril(atq);
    emitir({ tipo: 'posesion', lado, franja, carril });
    for (let pasos = 0; ; pasos++) {
      if (st.t >= MOTOR.duracion) break;
      if (pasos >= 12) { perdida(lado, 'med', {}); break; }
      const fase = franja === 'ata' ? 'ocasion' : franja === 'med' ? 'creacion' : 'salida';
      avanzarTiempo(MOTOR.segundos[fase] * of.tempo, lado);
      const r = duelo(fase, lado, franja, carril);
      if (r.exito) {
        if (fase === 'salida') {
          franja = 'med';
          emitir({ tipo: 'avance', lado, fase, jugador: r.atacante?.id ?? null, franja, carril });
        } else if (fase === 'creacion') {
          if (rng() < MOTOR.disparoLejano) {
            disparo(lado, 'lejano', carril, zona(atq, 'med', carril, REMATE.lejano), null);
            break;
          }
          franja = 'ata';
          emitir({ tipo: 'avance', lado, fase, jugador: r.atacante?.id ?? null, franja, carril });
        } else {
          const tipo = rng() < of.cabezazo ? 'cabeza' : 'pie';
          disparo(lado, tipo, carril, zona(atq, 'ata', carril, REMATE[tipo]), r.atacante);
          break;
        }
      } else if (fase !== 'salida' && rng() < of.reciclaje) {
        franja = fase === 'ocasion' ? 'med' : 'def';
        carril = elegirCarril(atq);
        emitir({ tipo: 'recicla', lado, jugador: r.atacante?.id ?? null, franja, carril });
      } else {
        perdida(lado, franja, r);
        break;
      }
    }
    if (st.t >= MOTOR.duracion && !st.terminado) {
      st.terminado = true;
      emitir({ tipo: 'final', marcador: [...st.marcador] });
    }
    return st.eventos.slice(desde);
  }

  // Rehace un equipo tras un cambio táctico o una sustitución, conservando
  // la energía de los jugadores que siguen en el campo.
  function rehacer(lado, definicion) {
    const energia = new Map(st.eq[lado].jugadores.map((j) => [j.id, j.energia]));
    st.definiciones[lado] = definicion;
    st.eq[lado] = prepararEquipo(definicion);
    for (const j of st.eq[lado].jugadores) j.energia = energia.get(j.id) ?? 100;
  }

  return {
    estado: st,
    paso,
    get terminado() { return st.terminado; },
    jugarHasta(segundos) {
      while (!st.terminado && st.t < segundos) paso();
    },
    jugarCompleto() {
      while (!st.terminado) paso();
      return this.resumen();
    },
    cambiarTactica(lado, cambios) {
      rehacer(lado, { ...st.definiciones[lado], ...cambios });
      emitir({ tipo: 'tactica', lado, cambios });
    },
    sustituir(lado, hueco, carta) {
      if (st.cambios[lado] >= MOTOR.maxCambios) throw new Error('No quedan cambios');
      const def = st.definiciones[lado];
      const sale = def.alineacion[hueco];
      const alineacion = def.alineacion.map((c, i) => (i === hueco ? carta : c));
      rehacer(lado, { ...def, alineacion });
      st.cambios[lado]++;
      emitir({ tipo: 'cambio', lado, sale: sale.ficha.id, entra: carta.ficha.id });
    },
    resumen() {
      const [a, b] = st.marcador;
      return {
        marcador: [a, b],
        ganador: a > b ? 0 : b > a ? 1 : null,
        stats: st.stats.map((s) => ({ ...s, posesion: s.posesion / Math.max(1, st.stats[0].posesion + st.stats[1].posesion) })),
        goles: st.eventos.filter((e) => e.tipo === 'gol'),
      };
    },
  };
}

export function simularPartido(opciones) {
  return crearPartido(opciones).jugarCompleto();
}
