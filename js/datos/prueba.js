// Jugadores y equipos de prueba (ficticios) para simular y equilibrar el motor.
// También alimentan el modo de prueba de la interfaz hasta que lleguen los jugadores reales.

import {
  ROLES, PUESTOS, FORMACIONES, ORDEN_FORMACIONES, ORDEN_OFENSIVAS, ORDEN_DEFENSIVAS,
  LISTA_ATRIBUTOS, ATRIBUTOS_PORTERO,
} from '../motor/reglas.js';

export const NACIONES_PRUEBA = ['Argentina', 'Brasil', 'Francia', 'Italia', 'España', 'Alemania', 'Inglaterra', 'Uruguay'];
export const ESCUELAS_PRUEBA = ['Tiki-taka', 'Jogo bonito', 'Catenaccio', 'Fútbol total', 'Garra', 'Gegenpressing'];

const limitar = (x) => Math.max(1, Math.min(99, Math.round(x)));
let contador = 0;

// media = media aproximada en Legendario para su rol natural.
export function generarFicha(rng, rol, media) {
  const pesos = ROLES[rol].pesos;
  const campo = LISTA_ATRIBUTOS.filter((a) => !ATRIBUTOS_PORTERO.includes(a));
  const atributos = {};
  for (const a of LISTA_ATRIBUTOS) {
    if (rol === 'portero') {
      atributos[a] = ATRIBUTOS_PORTERO.includes(a) ? media + rng.entero(-4, 4) : rng.entero(25, 55);
    } else if (ATRIBUTOS_PORTERO.includes(a)) {
      atributos[a] = rng.entero(5, 25);
    } else if (pesos[a]) {
      atributos[a] = media + rng.entero(-3, 5);
    } else {
      atributos[a] = media + rng.entero(-28, -4);
    }
  }
  if (rol !== 'portero') {
    for (let k = 0; k < 2; k++) atributos[rng.elegir(campo)] += rng.entero(4, 12);
  }
  for (const a of LISTA_ATRIBUTOS) atributos[a] = limitar(atributos[a]);
  const otros = Object.keys(ROLES).filter((r) => r !== rol && ROLES[r].linea === ROLES[rol].linea);
  const id = `prueba-${++contador}`;
  return {
    id,
    nombre: `Prueba ${contador}`,
    nacion: rng.elegir(NACIONES_PRUEBA),
    escuela: rng.elegir(ESCUELAS_PRUEBA),
    roles: otros.length ? [rol, rng.elegir(otros)] : [rol],
    atributos,
  };
}

// Equipo aleatorio. opciones: { media, formacion, ofensiva, defensiva, fueraDeRol, nacion }
export function equipoAleatorio(rng, opciones = {}) {
  const media = opciones.media ?? 80;
  const formacion = opciones.formacion ?? rng.elegir(ORDEN_FORMACIONES);
  const alineacion = FORMACIONES[formacion].huecos.map((h) => {
    const rol = rng.elegir(PUESTOS[h.puesto].roles);
    let natural = rol;
    if (opciones.fueraDeRol && h.puesto !== 'POR') {
      // Natural de otra línea: juega fuera de su rol.
      const ajenos = Object.keys(ROLES).filter((r) => r !== 'portero' && ROLES[r].linea !== ROLES[rol].linea);
      natural = rng.elegir(ajenos);
    }
    const ficha = generarFicha(rng, natural, media + rng.entero(-3, 3));
    if (opciones.nacion) ficha.nacion = opciones.nacion;
    if (opciones.fueraDeRol) ficha.roles = [natural];
    return { ficha, rareza: 'legendario', rol };
  });
  return {
    nombre: opciones.nombre ?? 'Equipo de prueba',
    formacion,
    ofensiva: opciones.ofensiva ?? rng.elegir(ORDEN_OFENSIVAS),
    defensiva: opciones.defensiva ?? rng.elegir(ORDEN_DEFENSIVAS),
    capitan: rng.entero(0, 10),
    alineacion,
  };
}
