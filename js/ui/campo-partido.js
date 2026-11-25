// Campo del partido en vivo: las cartas de los dos equipos, su movimiento y el
// balón con cada pase, centro, robo y remate.
//
// Las posiciones se calculan en un marco "de juego": u = largo del campo
// (0 = portería del local, 100 = portería del visitante; el local ataca hacia
// u = 100) y v = ancho (0 = banda izquierda del local). En pantalla ancha el
// campo es horizontal (el local ataca a la derecha); en un celular vertical se
// pone de pie (el local ataca hacia arriba). Todo en % para que no dependa del
// tamaño.

import { h } from './dom.js';
import { crearCarta } from './carta.js';

// Centro de cada zona del motor, en el marco del equipo que ataca.
const U_FRANJA = { def: 22, med: 50, ata: 78 };
const V_CARRIL = { izq: 18, cen: 50, der: 82 };
const ESPEJO_CARRIL = { izq: 'der', cen: 'cen', der: 'izq' };
const limitar = (x, a, b) => Math.min(b, Math.max(a, x));

// Ruido estable por jugador y evento (para que el bloque no se vea rígido).
function ruido(clave, t) {
  let x = 0;
  for (const ch of `${clave}:${t}`) x = (x * 31 + ch.charCodeAt(0)) % 9973;
  return x / 9973 - 0.5;
}

export function crearCampoPartido() {
  const lineas = h('div', { class: 'lineas-campo' });
  const estela = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  estela.setAttribute('class', 'estela');
  estela.setAttribute('viewBox', '0 0 100 100');
  estela.setAttribute('preserveAspectRatio', 'none');
  const balon = h('div', { class: 'balon' });
  const capaCartas = h('div', { class: 'capa-cartas' });
  const el = h('div', { class: 'campo-partido' }, lineas, capaCartas, estela, balon);

  let vertical = false;
  let velocidad = 1;
  const fichas = new Map(); // `${lado}:${id}` → { lado, j, el, u, v }
  let pelota = { u: 50, v: 50 };
  let posesion = { lado: 0, franja: 'def', carril: 'cen' };
  let temporizadores = [];
  // Margen (en % del marco u/v) para que ninguna carta se salga del campo.
  let margen = { u: 3, v: 8 };

  // ---------------------------------------------------------- Pantalla
  function aPantalla(u, v) {
    return vertical ? { x: v, y: 100 - u } : { x: u, y: v };
  }

  function dibujarLineas() {
    // Medidas reales (105 × 68 m) en el marco u/v, convertidas a % del campo.
    const L = 105;
    const A = 68;
    const pu = (m) => (m / L) * 100;
    const pv = (m) => (m / A) * 100;
    const rect = (u0, v0, du, dv) => {
      const a = aPantalla(u0, v0);
      const b = aPantalla(u0 + du, v0 + dv);
      return `<rect x="${Math.min(a.x, b.x)}" y="${Math.min(a.y, b.y)}" width="${Math.abs(a.x - b.x)}" height="${Math.abs(a.y - b.y)}"/>`;
    };
    const medio = aPantalla(50, 0);
    const medio2 = aPantalla(50, 100);
    const c = aPantalla(50, 50);
    const radio = vertical ? { rx: pv(9.15), ry: pu(9.15) } : { rx: pu(9.15), ry: pv(9.15) };
    const area = [pu(16.5), pv(40.3)];
    const chica = [pu(5.5), pv(18.3)];
    const porteria = [pu(1.6), pv(7.32)];
    lineas.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      ${rect(0, 0, 100, 100)}
      <line x1="${medio.x}" y1="${medio.y}" x2="${medio2.x}" y2="${medio2.y}"/>
      <ellipse cx="${c.x}" cy="${c.y}" rx="${radio.rx}" ry="${radio.ry}"/>
      ${rect(0, 50 - area[1] / 2, area[0], area[1])}
      ${rect(100 - area[0], 50 - area[1] / 2, area[0], area[1])}
      ${rect(0, 50 - chica[1] / 2, chica[0], chica[1])}
      ${rect(100 - chica[0], 50 - chica[1] / 2, chica[0], chica[1])}
      <g class="porteria">${rect(-porteria[0] + 0.4, 50 - porteria[1] / 2, porteria[0], porteria[1])}${rect(100 - 0.4, 50 - porteria[1] / 2, porteria[0], porteria[1])}</g>
    </svg>`;
  }

  function ajustar() {
    const nuevo = window.innerWidth < 760 && window.innerHeight > window.innerWidth;
    if (nuevo !== vertical || !lineas.firstChild) {
      vertical = nuevo;
      el.classList.toggle('vertical', vertical);
      dibujarLineas();
      for (const f of fichas.values()) colocar(f, f.u, f.v);
      ponerBalon(pelota.u, pelota.v);
    }
    // Cartas tan grandes como deja el campo sin que una línea tape a la otra.
    const ancho = el.clientWidth;
    const alto = el.clientHeight;
    if (ancho && alto) {
      const carta = limitar(vertical ? ancho * 0.085 : ancho * 0.05, 20, 58);
      el.style.setProperty('--carta-campo', `${carta}px`);
      // Media carta (más el contorno) en % de cada eje de pantalla.
      const mx = ((carta / 2 + 3) / ancho) * 100;
      const my = ((carta * 0.76 + 3) / alto) * 100;
      margen = vertical ? { u: my, v: mx } : { u: mx, v: my };
      for (const f of fichas.values()) colocar(f, f.u, f.v);
    }
  }
  const observador = new ResizeObserver(ajustar);
  observador.observe(el);

  // ---------------------------------------------------------- Jugadores
  // eqs = partido.estado.eq. Crea o actualiza las cartas (cambios incluidos).
  function sincronizar(eqs) {
    const vivas = new Set();
    let nuevas = false;
    eqs.forEach((eq, lado) => {
      for (const j of eq.jugadores) {
        const clave = `${lado}:${j.id}`;
        vivas.add(clave);
        let f = fichas.get(clave);
        if (!f) {
          f = { lado, j, el: h('div', { class: `ficha-campo ${lado === 0 ? 'local' : 'visitante'}` }), u: 50, v: 50 };
          fichas.set(clave, f);
          capaCartas.append(f.el);
          nuevas = true;
        }
        f.j = j;
        f.el.replaceChildren(crearCarta({
          ficha: j.ficha, rareza: j.rareza, media: j.media, etiqueta: j.casilla, mini: true, capitan: j.esCapitan,
        }));
        f.el.title = `${j.nombre} · ${j.casilla}`;
      }
    });
    for (const [clave, f] of fichas) {
      if (!vivas.has(clave)) { f.el.remove(); fichas.delete(clave); }
    }
    // Quien entra de cambio aparece ya en su sitio.
    if (nuevas) formar();
  }

  function colocar(f, u, v) {
    f.u = limitar(u, margen.u, 100 - margen.u);
    f.v = limitar(v, margen.v, 100 - margen.v);
    const p = aPantalla(f.u, f.v);
    f.el.style.left = `${p.x}%`;
    f.el.style.top = `${p.y}%`;
  }

  // Sitio de cada jugador según dónde está el balón: el equipo con el balón
  // se adelanta, el otro recula y se cierra hacia el lado del balón.
  function formar(t = 0) {
    const ladoBalon = posesion.lado;
    for (const [clave, f] of fichas) {
      const { j, lado } = f;
      // Balón en el marco de este equipo (u = 100 es la portería rival).
      const bu = lado === 0 ? pelota.u : 100 - pelota.u;
      const bv = lado === 0 ? pelota.v : 100 - pelota.v;
      const base = 4 + j.y * 0.5; // reposo: cada equipo en su mitad
      let u;
      let v;
      if (j.linea === 'POR') {
        u = 5 + limitar(bu - 50, -20, 40) * 0.12;
        v = 50 + (bv - 50) * 0.15;
      } else if (lado === ladoBalon) {
        u = base + limitar(bu - 28, -10, 55) * 0.62;
        v = j.x + (bv - 50) * 0.22;
      } else {
        u = base + limitar(bu - 42, -25, 40) * 0.5;
        v = 50 + (j.x - 50) * 0.82 + (bv - 50) * 0.3;
      }
      u += ruido(clave, t) * 3;
      v += ruido(`${clave}v`, t) * 4;
      if (lado === 1) { u = 100 - u; v = 100 - v; }
      colocar(f, u, v);
      f.el.classList.remove('activo');
    }
  }

  function ficha(lado, id) {
    return id ? fichas.get(`${lado}:${id}`) : null;
  }

  // Jugador del equipo `lado` más cerca de un punto (para posesiones sin protagonista).
  function masCercano(lado, u, v, sinPortero = true) {
    let mejor = null;
    let d = Infinity;
    for (const f of fichas.values()) {
      if (f.lado !== lado || (sinPortero && f.j.linea === 'POR')) continue;
      const dd = (f.u - u) ** 2 + ((f.v - v) * 0.65) ** 2;
      if (dd < d) { d = dd; mejor = f; }
    }
    return mejor;
  }

  // ---------------------------------------------------------- Balón
  function ponerBalon(u, v) {
    pelota = { u, v };
    const p = aPantalla(u, v);
    balon.style.left = `${p.x}%`;
    balon.style.top = `${p.y}%`;
  }

  function trazo(desde, hasta, tipo) {
    const a = aPantalla(desde.u, desde.v);
    const b = aPantalla(hasta.u, hasta.v);
    if (Math.hypot(a.x - b.x, a.y - b.y) < 2) return;
    const linea = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    for (const [k, val] of Object.entries({ x1: a.x, y1: a.y, x2: b.x, y2: b.y })) linea.setAttribute(k, val);
    linea.setAttribute('class', tipo);
    linea.setAttribute('vector-effect', 'non-scaling-stroke');
    estela.append(linea);
    setTimeout(() => linea.remove(), 1400 / velocidad + 200);
  }

  function rotulo(texto, u, v, clase = '') {
    if (!texto) return;
    const p = aPantalla(u, v);
    const r = h('div', { class: `rotulo ${clase}`, style: { left: `${p.x}%`, top: `${p.y}%` } }, texto);
    el.append(r);
    setTimeout(() => r.remove(), 1300 / velocidad + 200);
  }

  // Lleva el balón a un jugador (que se acerca al punto de la jugada).
  function balonA(f, u, v, tipo, texto) {
    const desde = { ...pelota };
    if (f) {
      colocar(f, f.u + (u - f.u) * 0.75, f.v + (v - f.v) * 0.75);
      f.el.classList.add('activo');
      u = f.u;
      v = f.v;
    }
    ponerBalon(u, v);
    trazo(desde, pelota, tipo);
    rotulo(texto, u, v, tipo);
  }

  // Punto (u, v) de una zona del motor para el equipo `lado`.
  function puntoZona(lado, franja, carril) {
    const u = U_FRANJA[franja] ?? 50;
    const v = V_CARRIL[carril] ?? 50;
    return lado === 0 ? { u, v } : { u: 100 - u, v: 100 - v };
  }

  // Pasos con pausa entre ellos (para pase + remate + balón a la red).
  function secuencia(pasos) {
    const d = 420 / velocidad;
    pasos.forEach((fn, i) => {
      if (i === 0) fn();
      else temporizadores.push(setTimeout(fn, d * i));
    });
  }

  function limpiar() {
    temporizadores.forEach(clearTimeout);
    temporizadores = [];
  }

  // ---------------------------------------------------------- Eventos
  function saque(lado = posesion.lado) {
    posesion = { lado, franja: 'med', carril: 'cen' };
    ponerBalon(50, 50);
    formar(0);
    // En el saque nadie pisa el campo rival.
    for (const f of fichas.values()) {
      const propio = f.lado === 0 ? f.u : 100 - f.u;
      if (propio > 47) colocar(f, f.lado === 0 ? 46 : 54, f.v);
    }
  }

  function evento(e, rapido = false) {
    limpiar();
    if (rapido) return;
    const t = e.t ?? 0;
    switch (e.tipo) {
      case 'posesion': {
        posesion = { lado: e.lado, franja: e.franja, carril: e.carril };
        const z = puntoZona(e.lado, e.franja, e.carril);
        ponerBalon(z.u, z.v);
        formar(t);
        const quien = e.franja === 'def' ? masCercano(e.lado, z.u, z.v) : masCercano(e.lado, z.u, z.v);
        balonA(quien, z.u, z.v, 'pase', null);
        break;
      }
      case 'avance':
      case 'recicla':
      case 'contragolpe': {
        const franja = e.tipo === 'contragolpe'
          ? (posesion.franja === 'def' ? 'med' : 'ata')
          : e.franja;
        const carril = e.carril ?? posesion.carril;
        posesion = { lado: e.lado, franja, carril };
        const z = puntoZona(e.lado, franja, carril);
        ponerBalon(pelota.u + (z.u - pelota.u) * 0.5, pelota.v + (z.v - pelota.v) * 0.5);
        formar(t);
        const texto = e.tipo === 'recicla' ? 'Pase atrás'
          : e.tipo === 'contragolpe' ? '¡Contragolpe!'
            : e.fase === 'salida' ? 'Pase'
              : carril === 'cen' ? 'Pase filtrado' : 'Desborde';
        balonA(ficha(e.lado, e.jugador) ?? masCercano(e.lado, z.u, z.v), z.u, z.v, e.tipo === 'contragolpe' ? 'tiro' : 'pase', texto);
        break;
      }
      case 'perdida': {
        const lado = 1 - e.lado;
        posesion = { lado, franja: 'def', carril: ESPEJO_CARRIL[posesion.carril] ?? 'cen' };
        const aqui = { ...pelota };
        formar(t);
        const quien = ficha(lado, e.recupera) ?? masCercano(lado, aqui.u, aqui.v);
        balonA(quien, aqui.u, aqui.v, 'robo', e.recupera ? '¡Robo!' : 'Balón perdido');
        break;
      }
      case 'gol':
      case 'parada':
      case 'fuera': {
        const lado = e.lado;
        const atacaU = (u) => (lado === 0 ? u : 100 - u);
        const atacaV = (v) => (lado === 0 ? v : 100 - v);
        const carril = posesion.carril;
        const vCarril = V_CARRIL[carril];
        const tirador = ficha(lado, e.jugador);
        const asistente = ficha(lado, e.asistente);
        const uTiro = e.remate === 'lejano' ? 68 : e.remate === 'cabeza' ? 92 : 86;
        const vTiro = e.remate === 'cabeza' ? 50 + (ruido(e.jugador, t) * 14) : 50 + (vCarril - 50) * 0.35;
        const portero = [...fichas.values()].find((f) => f.lado === 1 - lado && f.j.linea === 'POR');
        const nombreTiro = e.remate === 'cabeza' ? 'Cabezazo' : e.remate === 'lejano' ? 'Disparo lejano' : 'Remate';
        const pasos = [];
        if (asistente && asistente !== tirador) {
          const centro = e.remate === 'cabeza' || carril !== 'cen';
          pasos.push(() => {
            formar(t);
            balonA(asistente, atacaU(centro ? 84 : 74), atacaV(centro ? (carril === 'izq' ? 8 : carril === 'der' ? 92 : vCarril) : vCarril), 'pase', null);
          });
          pasos.push(() => balonA(tirador, atacaU(uTiro), atacaV(vTiro), 'pase', centro ? 'Centro' : 'Pase'));
        } else {
          pasos.push(() => { formar(t); balonA(tirador, atacaU(uTiro), atacaV(vTiro), 'pase', null); });
        }
        pasos.push(() => {
          const desde = { ...pelota };
          rotulo(nombreTiro, desde.u, desde.v, 'tiro');
          let destino;
          if (e.tipo === 'gol') {
            destino = { u: atacaU(100.6), v: atacaV(50 + ruido(`${e.jugador}g`, t) * 8) };
          } else if (e.tipo === 'parada') {
            destino = { u: atacaU(96.5), v: atacaV(50 + ruido(`${e.jugador}p`, t) * 10) };
            if (portero) colocar(portero, destino.u, destino.v);
          } else {
            const lado2 = ruido(`${e.jugador}f`, t) > 0 ? 1 : -1;
            destino = { u: atacaU(101), v: atacaV(50 + lado2 * (8 + Math.abs(ruido(e.jugador, t)) * 12)) };
          }
          ponerBalon(destino.u, destino.v);
          trazo(desde, pelota, 'tiro');
        });
        pasos.push(() => {
          const texto = e.tipo === 'gol' ? null : e.tipo === 'parada' ? '¡Parada!' : 'Fuera';
          rotulo(texto, pelota.u, pelota.v, e.tipo === 'parada' ? 'robo' : '');
        });
        secuencia(pasos);
        break;
      }
      case 'descanso':
      case 'final':
        saque(e.tipo === 'descanso' ? posesion.lado : 0);
        break;
      default:
    }
  }

  return {
    el,
    sincronizar,
    saque,
    evento,
    ajustar,
    // La crónica pide los tiempos de espera ya ajustados; las transiciones también.
    velocidad(v) {
      velocidad = v;
      el.style.setProperty('--vel', String(v));
    },
    destruir() {
      limpiar();
      observador.disconnect();
    },
  };
}
