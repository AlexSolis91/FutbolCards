// Utilidades de alineación (sin DOM): auto-alinear, mover jugadores entre
// casillas, reparar tácticas guardadas y construir la definición de equipo
// que usa el motor.
// tactica: { formacion, ofensiva, defensiva, capitan (uid),
//            alineacion: [{ uid, rol, casilla }] × 11 }

import { FORMACIONES, PUESTOS, CASILLAS, ORDEN_CASILLAS, formacionDeCasillas } from './reglas.js';
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

// Elige los 11 mejores para una plantilla (emparejamiento voraz global).
// Un jugador solo puede estar una vez en el campo (aunque tengas copias).
// cartas: [{ uid, ficha, rareza }]. Devuelve [{ uid, rol, casilla }] × 11.
export function autoAlinear(cartas, formacion) {
  return alinearEnCasillas(cartas, FORMACIONES[formacion].huecos.map((h) => h.casilla));
}

// Igual que autoAlinear pero con cualquier lista de casillas.
export function alinearEnCasillas(cartas, casillas) {
  const pares = [];
  casillas.forEach((id, i) => {
    for (const c of cartas) {
      const v = valorEnPuesto(c, CASILLAS[id].puesto);
      pares.push({ i, uid: c.uid, rol: v.rol, valor: v.valor });
    }
  });
  pares.sort((a, b) => b.valor - a.valor);
  const res = new Array(casillas.length).fill(null);
  const usados = new Set();
  const fichaDe = new Map(cartas.map((c) => [c.uid, c.ficha.id]));
  for (const p of pares) {
    if (res[p.i] || usados.has(p.uid) || usados.has(fichaDe.get(p.uid))) continue;
    res[p.i] = { uid: p.uid, rol: p.rol, casilla: casillas[p.i] };
    usados.add(p.uid).add(fichaDe.get(p.uid));
  }
  return res;
}

export function definicionEquipo(nombre, cartas, tactica) {
  const porUid = new Map(cartas.map((c) => [c.uid, c]));
  const alineacion = tactica.alineacion.map(({ uid, rol, casilla }) => {
    const c = porUid.get(uid);
    return { ficha: c.ficha, rareza: c.rareza, rol, casilla, uid };
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

// Coloca a los mismos 11 en una plantilla (cada uno donde mejor rinde).
export function cambiarFormacion(cartas, tactica, formacion) {
  const enCampo = new Set(tactica.alineacion.map((a) => a.uid));
  const titulares = cartas.filter((c) => enCampo.has(c.uid));
  return { ...tactica, formacion, alineacion: autoAlinear(titulares, formacion) };
}

// Rol para una carta en un puesto: conserva el actual si vale para el puesto
// y es natural del jugador; si no, el que mejor rinde.
export function rolPara(carta, puesto, rolActual) {
  if (rolActual && PUESTOS[puesto].roles.includes(rolActual) && carta.ficha.roles.includes(rolActual)) return rolActual;
  return valorEnPuesto(carta, puesto).rol;
}

// Mueve un jugador. destino: { casilla } (una casilla del campo) o { uid }
// (otra carta, del campo o del banquillo). Devuelve { ok, tactica, motivo }.
// - Campo → casilla vacía: se mueve (el portero no puede dejar POR vacía).
// - Campo ↔ campo: intercambian casillas.
// - Banquillo → jugador del campo (o al revés): el del banquillo entra en su casilla.
// - Banquillo → casilla vacía: no (siempre son 11).
export function moverJugador(cartas, tactica, uid, destino) {
  const porUid = new Map(cartas.map((c) => [c.uid, c]));
  const al = tactica.alineacion.map((a) => ({ ...a }));
  const iOrigen = al.findIndex((a) => a.uid === uid);
  let iDestino = destino.uid ? al.findIndex((a) => a.uid === destino.uid) : al.findIndex((a) => a.casilla === destino.casilla);
  const no = (motivo) => ({ ok: false, tactica, motivo });
  let capitan = tactica.capitan;

  if (iOrigen === -1 && iDestino === -1) return no('Suelta al jugador sobre uno del campo para cambiarlos.');
  if (iOrigen !== -1 && destino.uid && iDestino === -1) {
    // Del campo a una carta del banquillo: es lo mismo que al revés.
    return moverJugador(cartas, tactica, destino.uid, { uid });
  }
  if (iOrigen === -1) {
    // Entra desde el banquillo en la casilla de un titular.
    const entra = porUid.get(uid);
    const repetido = al.some((a, k) => k !== iDestino && porUid.get(a.uid)?.ficha.id === entra.ficha.id);
    if (repetido) return no(`${entra.ficha.nombre} ya está en el campo.`);
    const sale = al[iDestino];
    al[iDestino] = { uid, casilla: sale.casilla, rol: rolPara(entra, CASILLAS[sale.casilla].puesto, null) };
    if (capitan === sale.uid) capitan = uid;
  } else if (iDestino === -1) {
    // A una casilla vacía.
    if (!CASILLAS[destino.casilla]) return no('Casilla desconocida.');
    if (al[iOrigen].casilla === 'POR') return no('La portería no puede quedar vacía: cambia al portero por otro jugador.');
    const carta = porUid.get(uid);
    al[iOrigen] = { uid, casilla: destino.casilla, rol: rolPara(carta, CASILLAS[destino.casilla].puesto, al[iOrigen].rol) };
  } else if (iOrigen !== iDestino) {
    // Intercambio entre dos titulares.
    const a = al[iOrigen];
    const b = al[iDestino];
    al[iOrigen] = { uid: a.uid, casilla: b.casilla, rol: rolPara(porUid.get(a.uid), CASILLAS[b.casilla].puesto, a.rol) };
    al[iDestino] = { uid: b.uid, casilla: a.casilla, rol: rolPara(porUid.get(b.uid), CASILLAS[a.casilla].puesto, b.rol) };
  } else {
    return no('');
  }
  return {
    ok: true,
    tactica: { ...tactica, alineacion: al, capitan, formacion: formacionDeCasillas(al.map((a) => a.casilla)) },
  };
}

// Deja una táctica guardada en estado válido: 11 cartas existentes, sin
// jugador repetido, cada una en una casilla distinta, portero en POR, roles
// válidos y capitán en el campo. Las alineaciones antiguas (sin casillas)
// toman las de su plantilla. Los huecos se rellenan con el mejor del
// banquillo. Devuelve { tactica, cambiada }.
export function repararAlineacion(cartas, tactica) {
  const porUid = new Map(cartas.map((c) => [c.uid, c]));
  const plantilla = FORMACIONES[tactica.formacion]?.huecos.map((h) => h.casilla) ?? FORMACIONES['4-3-3'].huecos.map((h) => h.casilla);
  let cambiada = false;
  const previa = (tactica.alineacion ?? []).slice(0, 11);
  while (previa.length < 11) { previa.push(null); cambiada = true; }
  if (tactica.alineacion?.length > 11) cambiada = true;

  // 1. Casilla de cada puesto (las antiguas, de su plantilla).
  const casillasUsadas = new Set();
  const destinos = previa.map((a, i) => {
    let id = a?.casilla;
    if (!a || !CASILLAS[id] || casillasUsadas.has(id)) {
      cambiada = true;
      id = [plantilla[i], ...plantilla, ...ORDEN_CASILLAS].find((k) => !casillasUsadas.has(k));
    }
    casillasUsadas.add(id);
    return id;
  });

  // 2. Cartas válidas y sin repetir.
  const usados = new Set();
  const fichas = new Set();
  const alineacion = previa.map((a, i) => {
    const c = a && porUid.get(a.uid);
    if (!c || usados.has(c.uid) || fichas.has(c.ficha.id)) { cambiada = true; return null; }
    usados.add(c.uid);
    fichas.add(c.ficha.id);
    return { uid: c.uid, rol: a.rol, casilla: destinos[i] };
  });

  // 3. Rellenar huecos con el mejor disponible para esa casilla.
  alineacion.forEach((a, i) => {
    if (a) return;
    let mejor = null;
    for (const c of cartas) {
      if (usados.has(c.uid) || fichas.has(c.ficha.id)) continue;
      const v = valorEnPuesto(c, CASILLAS[destinos[i]].puesto);
      if (!mejor || v.valor > mejor.v.valor) mejor = { c, v };
    }
    if (!mejor) return;
    usados.add(mejor.c.uid);
    fichas.add(mejor.c.ficha.id);
    alineacion[i] = { uid: mejor.c.uid, rol: mejor.v.rol, casilla: destinos[i] };
  });

  // 4. Siempre hay portero: si nadie está en POR, va a POR quien mejor para.
  const llenos = alineacion.filter(Boolean);
  if (!llenos.some((a) => a.casilla === 'POR') && llenos.length) {
    const mejorPortero = llenos.reduce((m, a) => (valorEnPuesto(porUid.get(a.uid), 'POR').valor > valorEnPuesto(porUid.get(m.uid), 'POR').valor ? a : m));
    mejorPortero.casilla = 'POR';
    cambiada = true;
  }

  // 5. Roles válidos para cada casilla.
  for (const a of llenos) {
    const puesto = CASILLAS[a.casilla].puesto;
    if (!PUESTOS[puesto].roles.includes(a.rol)) {
      a.rol = rolPara(porUid.get(a.uid), puesto, null);
      cambiada = true;
    }
  }

  let capitan = tactica.capitan;
  if (!llenos.some((a) => a.uid === capitan)) { capitan = llenos[0]?.uid; cambiada = true; }
  const formacion = formacionDeCasillas(llenos.map((a) => a.casilla));
  if (formacion !== tactica.formacion) cambiada = true;
  return { tactica: { ...tactica, formacion, alineacion: llenos, capitan }, cambiada };
}

// Banquillo: una carta por jugador (la de mayor rareza y, si hay varias, la
// primera), sin los jugadores que ya están en el campo. Las copias se ven y
// se usan en Colección. Devuelve [{ carta, copias }].
export function banquillo(cartas, alineacion, ordenRarezas) {
  const enCampo = new Set(alineacion.map((a) => a.uid));
  const fichasEnCampo = new Set(cartas.filter((c) => enCampo.has(c.uid)).map((c) => c.ficha.id));
  const porJugador = new Map();
  for (const c of cartas) {
    if (fichasEnCampo.has(c.ficha.id)) continue;
    const previo = porJugador.get(c.ficha.id);
    if (!previo) porJugador.set(c.ficha.id, { carta: c, copias: 1 });
    else {
      previo.copias++;
      if (ordenRarezas.indexOf(c.rareza) > ordenRarezas.indexOf(previo.carta.rareza)) previo.carta = c;
    }
  }
  return [...porJugador.values()];
}
