// Edgar Davids. Categoría Figura: solo Raro y Épico.
// Atributos en Épico (Raro resta 6).
export default {
  id: 'edgar-davids',
  nombre: 'Edgar Davids',
  nacion: 'Países Bajos',
  escuela: 'Garra',
  categoria: 'figura',
  roles: ['boxToBox', 'ancla'],
  pie: 'izquierdo',
  pieMalo: 3,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-24)
  atributos: {
    definicion: 70, cabeza: 66, tiroLejano: 80,
    paseCorto: 88, paseLargo: 80, vision: 82, centros: 72,
    regate: 86, control: 86,
    entrada: 90, marcaje: 84, anticipacion: 88,
    velocidad: 84, resistencia: 95, fuerza: 86, salto: 70,
    posicionamiento: 86, compostura: 84,
    reflejos: 10, colocacion: 10, juegoAereo: 10, juegoPie: 22,
  },
  bonificaciones: [
    {
      nombre: 'Pitbull',
      descripcion: 'Si juega de Box-to-box o Ancla: él gana +3 Entrada y +2 Resistencia.',
      condicion: { tipo: 'rol', roles: ['boxToBox', 'ancla'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { entrada: 3, resistencia: 2 } },
    },
    {
      nombre: 'Oranje',
      descripcion: 'Con al menos 2 compañeros neerlandeses: todos los neerlandeses ganan +2 Pase corto, +2 Resistencia y +2 Anticipación.',
      condicion: { tipo: 'companeros', filtro: { nacion: 'Países Bajos' }, minimo: 2 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { nacion: 'Países Bajos' } }, atributos: { paseCorto: 2, resistencia: 2, anticipacion: 2 } },
    },
  ],
  capitan: {
    nombre: 'Mordida',
    descripcion: 'Con el brazalete: todos los mediocampistas ganan +2 Entrada y +1 Fuerza.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'MED' } }, atributos: { entrada: 2, fuerza: 1 } },
  },
};
