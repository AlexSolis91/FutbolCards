// Nahuel Guzmán. Categoría Base: solo Común y Raro (ídolo de Tigres).
// Atributos en Raro (Común resta 6). Primer portero Base: muy por debajo de
// Buffon y Neuer (Estrella, 94), al nivel de los Base de campo (81–82).
export default {
  id: 'nahuel-guzman',
  nombre: 'Nahuel Guzmán',
  nacion: 'Argentina',
  escuela: 'Garra',
  categoria: 'base',
  roles: ['portero'],
  pie: 'derecho',
  pieMalo: 2,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-28)
  atributos: {
    definicion: 15, cabeza: 30, tiroLejano: 30,
    paseCorto: 66, paseLargo: 70, vision: 60, centros: 25,
    regate: 35, control: 58,
    entrada: 25, marcaje: 20, anticipacion: 76,
    velocidad: 62, resistencia: 70, fuerza: 80, salto: 82,
    posicionamiento: 80, compostura: 82,
    reflejos: 84, colocacion: 80, juegoAereo: 82, juegoPie: 76,
  },
  bonificaciones: [
    {
      nombre: 'Patón',
      descripcion: 'Si juega de Portero: él gana +3 Reflejos y +2 Juego aéreo.',
      condicion: { tipo: 'rol', roles: ['portero'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { reflejos: 3, juegoAereo: 2 } },
    },
    {
      nombre: 'Voz del arco',
      descripcion: 'Con al menos 2 compañeros de Central: todos los Centrales ganan +2 Posicionamiento y +2 Compostura.',
      condicion: { tipo: 'companeros', filtro: { rol: 'central' }, minimo: 2 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { rol: 'central' } }, atributos: { posicionamiento: 2, compostura: 2 } },
    },
  ],
  capitan: {
    nombre: 'Ídolo de Tigres',
    descripcion: 'Con el brazalete: todos los defensas ganan +2 Anticipación y +1 Compostura.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'DEF' } }, atributos: { anticipacion: 2, compostura: 1 } },
  },
};
