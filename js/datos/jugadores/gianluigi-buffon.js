// Gianluigi Buffon. Categoría Estrella: solo Épico y Legendario.
// Atributos en Legendario (Épico resta 6). Por debajo del techo de 96.
export default {
  id: 'gianluigi-buffon',
  nombre: 'Gianluigi Buffon',
  nacion: 'Italia',
  escuela: 'Catenaccio',
  categoria: 'estrella',
  roles: ['portero'],
  pie: 'derecho',
  pieMalo: 3,
  estado: 'aprobada', // publicada directamente (2026-11-24)
  atributos: {
    definicion: 15, cabeza: 30, tiroLejano: 20,
    paseCorto: 70, paseLargo: 72, vision: 65, centros: 30,
    regate: 35, control: 60,
    entrada: 25, marcaje: 20, anticipacion: 80,
    velocidad: 65, resistencia: 75, fuerza: 85, salto: 88,
    posicionamiento: 90, compostura: 96,
    reflejos: 97, colocacion: 96, juegoAereo: 94, juegoPie: 82,
  },
  bonificaciones: [
    {
      nombre: 'Superman',
      descripcion: 'Si juega de Portero: él gana +3 Reflejos y +2 Colocación.',
      condicion: { tipo: 'rol', roles: ['portero'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { reflejos: 3, colocacion: 2 } },
    },
    {
      nombre: 'Berlín 2006',
      descripcion: 'Con al menos 2 compañeros italianos: todos los italianos ganan +2 Anticipación, +2 Compostura y +1 Posicionamiento.',
      condicion: { tipo: 'companeros', filtro: { nacion: 'Italia' }, minimo: 2 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { nacion: 'Italia' } }, atributos: { anticipacion: 2, compostura: 2, posicionamiento: 1 } },
    },
  ],
  capitan: {
    nombre: 'Voz de mando',
    descripcion: 'Con el brazalete: el portero y todos los defensas ganan +2 Posicionamiento y +2 Compostura.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: ['POR', 'DEF'] } }, atributos: { posicionamiento: 2, compostura: 2 } },
  },
};
