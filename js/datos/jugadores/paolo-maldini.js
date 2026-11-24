// Paolo Maldini. Categoría Estrella: solo Épico y Legendario.
// Atributos en Legendario (Épico resta 6). Por debajo del techo de 96.
export default {
  id: 'paolo-maldini',
  nombre: 'Paolo Maldini',
  nacion: 'Italia',
  escuela: 'Catenaccio',
  categoria: 'estrella',
  roles: ['central', 'libero', 'lateral'],
  pie: 'derecho',
  pieMalo: 5,
  estado: 'aprobada', // publicada directamente (2026-11-24)
  atributos: {
    definicion: 50, cabeza: 85, tiroLejano: 55,
    paseCorto: 84, paseLargo: 82, vision: 78, centros: 80,
    regate: 76, control: 84,
    entrada: 97, marcaje: 97, anticipacion: 97,
    velocidad: 88, resistencia: 90, fuerza: 86, salto: 88,
    posicionamiento: 96, compostura: 95,
    reflejos: 12, colocacion: 12, juegoAereo: 15, juegoPie: 30,
  },
  bonificaciones: [
    {
      nombre: 'Muro rossonero',
      descripcion: 'Si juega de Central o Lateral: él gana +3 Marcaje y +3 Anticipación.',
      condicion: { tipo: 'rol', roles: ['central', 'lateral'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { marcaje: 3, anticipacion: 3 } },
    },
    {
      nombre: 'Azzurri',
      descripcion: 'Con al menos 2 compañeros italianos: todos los italianos ganan +2 Entrada, +2 Posicionamiento y +2 Compostura.',
      condicion: { tipo: 'companeros', filtro: { nacion: 'Italia' }, minimo: 2 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { nacion: 'Italia' } }, atributos: { entrada: 2, posicionamiento: 2, compostura: 2 } },
    },
  ],
  capitan: {
    nombre: 'Il Capitano',
    descripcion: 'Con el brazalete: todos los defensas ganan +3 Marcaje y +2 Posicionamiento.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'DEF' } }, atributos: { marcaje: 3, posicionamiento: 2 } },
  },
};
