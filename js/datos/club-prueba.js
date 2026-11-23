// Club y rival de prueba con jugadores ficticios, hasta que lleguen los reales.

import { crearRng } from '../motor/rng.js';
import { ORDEN_FORMACIONES, ORDEN_OFENSIVAS, ORDEN_DEFENSIVAS } from '../motor/reglas.js';
import { autoAlinear } from '../motor/alineacion.js';
import { generarFicha } from './prueba.js';

const NOMBRES = ['Mateo', 'Iker', 'Bruno', 'Thiago', 'Luca', 'Darío', 'Hugo', 'Enzo', 'Joaquín', 'Rafael', 'Tomás', 'Andrés',
  'Nicolás', 'Marco', 'Pablo', 'Diego', 'Samuel', 'Gael', 'León', 'Iván', 'Óscar', 'Félix', 'Emilio', 'Simón'];
const APELLIDOS = ['Valdés', 'Moreira', 'Castell', 'Ferraro', 'Duarte', 'Lemaire', 'Okafor', 'Brandt', 'Rossetti', 'Sandoval',
  'Albino', 'Quiroga', 'Varela', 'Noguera', 'Bellini', 'Fontaine', 'Kruger', 'Salas', 'Medina', 'Ibarra', 'Peralta', 'Rivas',
  'Cortés', 'Lindqvist'];

// 24 cartas: 2 porteros y el resto repartido por roles.
const ROLES_PLANTILLA = ['portero', 'portero', 'central', 'central', 'central', 'libero', 'lateral', 'lateral', 'carrilero',
  'ancla', 'ancla', 'regista', 'regista', 'boxToBox', 'boxToBox', 'mediapunta', 'mediapunta', 'extremo', 'extremo',
  'extremo', 'interior', 'falso9', 'delanteroArea', 'delanteroArea'];

function rarezaAleatoria(rng) {
  const r = rng();
  if (r < 0.04) return 'legendario';
  if (r < 0.12) return 'epico';
  if (r < 0.35) return 'raro';
  return 'comun';
}

// Apellidos distintos para el rival, para que la crónica no confunda jugadores.
const APELLIDOS_RIVAL = ['Acosta', 'Bianchi', 'Carvalho', 'Dumont', 'Esposito', 'Fischer', 'Gallardo', 'Haas', 'Iriarte',
  'Jansen', 'Kovač', 'Lombardi', 'Mendes', 'Navarro', 'Olsen', 'Pires', 'Quintero', 'Russo', 'Soler', 'Toledo', 'Urrutia',
  'Vidal', 'Weber', 'Zamora'];

export function crearPlantillaPrueba(semilla, prefijo = 'p') {
  const rng = crearRng(semilla);
  const nombres = [...NOMBRES].sort(() => rng() - 0.5);
  const apellidos = [...(prefijo === 'p' ? APELLIDOS : APELLIDOS_RIVAL)].sort(() => rng() - 0.5);
  return ROLES_PLANTILLA.map((rol, i) => {
    const ficha = generarFicha(rng, rol, rng.entero(84, 92));
    ficha.id = `${prefijo}${i + 1}`;
    ficha.nombre = `${nombres[i % nombres.length]} ${apellidos[i % apellidos.length]}`;
    ficha.prueba = true;
    return { uid: ficha.id, ficha, rareza: rarezaAleatoria(rng) };
  });
}

export function crearClubPrueba() {
  const cartas = crearPlantillaPrueba(2026, 'p');
  const formacion = '4-3-3';
  const alineacion = autoAlinear(cartas, formacion);
  return {
    version: 1,
    nombre: 'Mi Club',
    cartas,
    tactica: { formacion, ofensiva: 'posesion', defensiva: 'bloqueMedio', capitan: alineacion[5].uid, alineacion },
  };
}

export function crearRivalPrueba(semilla) {
  const rng = crearRng(semilla);
  const cartas = crearPlantillaPrueba(semilla, 'r');
  const formacion = rng.elegir(ORDEN_FORMACIONES);
  const alineacion = autoAlinear(cartas, formacion);
  return {
    nombre: rng.elegir(['Atlético Norte', 'Real Costa', 'Deportivo Sur', 'Unión Central', 'Sporting Valle', 'Racing Puerto']),
    cartas,
    tactica: {
      formacion,
      ofensiva: rng.elegir(ORDEN_OFENSIVAS),
      defensiva: rng.elegir(ORDEN_DEFENSIVAS),
      capitan: alineacion[rng.entero(0, 10)].uid,
      alineacion,
    },
  };
}
