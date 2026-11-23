// Colección del club (sin DOM): agrupar copias y subir de rango.
// Regla: carta + 5 copias de la misma rareza → esa carta sube a la siguiente
// rareza y se consumen las 5 copias (hacen falta 6 en total). Cada jugador solo
// tiene 2 rarezas: en la más alta ya no se puede subir.

import { COPIAS_PARA_MEJORAR, rarezasDe } from './reglas.js';

// Agrupa las cartas por jugador + rareza: [{ ficha, rareza, uids, copias }]
export function agruparColeccion(cartas) {
  const grupos = new Map();
  for (const c of cartas) {
    const clave = `${c.ficha.id}|${c.rareza}`;
    if (!grupos.has(clave)) grupos.set(clave, { ficha: c.ficha, rareza: c.rareza, uids: [] });
    grupos.get(clave).uids.push(c.uid);
  }
  return [...grupos.values()].map((g) => ({ ...g, copias: g.uids.length }));
}

export function siguienteRareza(rareza, ficha) {
  const propias = rarezasDe(ficha);
  const i = propias.indexOf(rareza);
  return i >= 0 && i < propias.length - 1 ? propias[i + 1] : null;
}

export function puedeMejorar(cartas, fichaId, rareza) {
  const grupo = cartas.filter((c) => c.ficha.id === fichaId && c.rareza === rareza);
  if (!grupo.length || !siguienteRareza(rareza, grupo[0].ficha)) return false;
  return grupo.length >= COPIAS_PARA_MEJORAR + 1;
}

// Devuelve { cartas, tactica, uid } nuevos. La carta que sube conserva su uid
// (si estaba en la alineación, sigue en ella); las copias consumidas salen
// de la colección (nunca una que esté alineada).
export function mejorarCarta(cartas, tactica, fichaId, rareza) {
  if (!puedeMejorar(cartas, fichaId, rareza)) throw new Error('No hay copias suficientes para subir de rango');
  const alineados = new Set(tactica.alineacion.map((a) => a.uid));
  const grupo = cartas.filter((c) => c.ficha.id === fichaId && c.rareza === rareza);
  const sube = grupo.find((c) => alineados.has(c.uid)) ?? grupo[0];
  const consumidas = new Set(grupo.filter((c) => c !== sube && !alineados.has(c.uid)).slice(0, COPIAS_PARA_MEJORAR).map((c) => c.uid));
  const nuevaRareza = siguienteRareza(rareza, sube.ficha);
  return {
    uid: sube.uid,
    cartas: cartas
      .filter((c) => !consumidas.has(c.uid))
      .map((c) => (c.uid === sube.uid ? { ...c, rareza: nuevaRareza } : c)),
    tactica,
  };
}
