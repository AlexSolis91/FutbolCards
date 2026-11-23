// Utilidades de alineación (sin DOM): auto-alinear y construir la definición
// de equipo que usa el motor a partir de la plantilla y la táctica del club.

import { FORMACIONES, PUESTOS } from './reglas.js';
import { atributosDeRareza, mediaEnRol, familiaridad } from './encaje.js';

// Mejor rol de una carta para un puesto y su valor estimado (sin química).
export function valorEnPuesto(carta, puesto) {
  const attrs = atributosDeRareza(carta.ficha, carta.rareza);
  let mejor = null;
  for (const rol of PUESTOS[puesto].roles) {
    const valor = mediaEnRol(attrs, rol) + familiaridad(carta.ficha, rol);
    if (!mejor || valor > mejor.valor) mejor = { rol, valor };
  }
  return mejor;
}

// Elige los 11 mejores para la formación (emparejamiento voraz global).
// cartas: [{ uid, ficha, rareza }]. Devuelve [{ uid, rol }] × 11.
export function autoAlinear(cartas, formacion) {
  const huecos = FORMACIONES[formacion].huecos;
  const pares = [];
  huecos.forEach((h, i) => {
    for (const c of cartas) {
      const v = valorEnPuesto(c, h.puesto);
      pares.push({ i, uid: c.uid, rol: v.rol, valor: v.valor });
    }
  });
  pares.sort((a, b) => b.valor - a.valor);
  const res = new Array(huecos.length).fill(null);
  const usados = new Set();
  for (const p of pares) {
    if (res[p.i] || usados.has(p.uid)) continue;
    res[p.i] = { uid: p.uid, rol: p.rol };
    usados.add(p.uid);
  }
  return res;
}

// tactica: { formacion, ofensiva, defensiva, capitan (uid), alineacion: [{ uid, rol }] }
export function definicionEquipo(nombre, cartas, tactica) {
  const porUid = new Map(cartas.map((c) => [c.uid, c]));
  const alineacion = tactica.alineacion.map(({ uid, rol }) => {
    const c = porUid.get(uid);
    return { ficha: c.ficha, rareza: c.rareza, rol, uid };
  });
  return {
    nombre,
    formacion: tactica.formacion,
    ofensiva: tactica.ofensiva,
    defensiva: tactica.defensiva,
    capitan: tactica.alineacion.findIndex((a) => a.uid === tactica.capitan),
    alineacion,
  };
}

// Reubica a los mismos 11 en otra formación conservando a los jugadores.
export function cambiarFormacion(cartas, tactica, formacion) {
  const enCampo = new Set(tactica.alineacion.map((a) => a.uid));
  const titulares = cartas.filter((c) => enCampo.has(c.uid));
  return { ...tactica, formacion, alineacion: autoAlinear(titulares, formacion) };
}
