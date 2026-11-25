// Fabio Cannavaro. Categoría Figura: solo Raro y Épico (decisión del usuario,
// 2026-11-25, pese al Balón de Oro 2006). Atributos en Épico (Raro resta 6).
// A la par de Nesta (89), por debajo de Ramos (92) y Maldini (94).
export default {
  id: 'fabio-cannavaro',
  nombre: 'Fabio Cannavaro',
  nacion: 'Italia',
  escuela: 'Catenaccio',
  categoria: 'figura',
  roles: ['central', 'libero'],
  pie: 'derecho',
  pieMalo: 3,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-25)
  atributos: {
    definicion: 48, cabeza: 84, tiroLejano: 54,
    paseCorto: 78, paseLargo: 74, vision: 70, centros: 58,
    regate: 68, control: 76,
    entrada: 91, marcaje: 90, anticipacion: 91,
    velocidad: 82, resistencia: 82, fuerza: 82, salto: 88,
    posicionamiento: 88, compostura: 86,
    reflejos: 10, colocacion: 10, juegoAereo: 12, juegoPie: 25,
  },
  bonificaciones: [
    {
      nombre: 'Muro de Berlín',
      descripcion: 'Si juega de Central: él gana +3 Anticipación y +2 Salto.',
      condicion: { tipo: 'rol', roles: ['central'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { anticipacion: 3, salto: 2 } },
    },
    {
      nombre: 'Pareja de centrales',
      descripcion: 'Con al menos 1 compañero de Central: todos los Centrales ganan +2 Anticipación y +2 Velocidad.',
      condicion: { tipo: 'companeros', filtro: { rol: 'central' }, minimo: 1 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { rol: 'central' } }, atributos: { anticipacion: 2, velocidad: 2 } },
    },
  ],
  capitan: {
    nombre: 'Balón de Oro 2006',
    descripcion: 'Con el brazalete: el portero y todos los defensas ganan +2 Marcaje y +1 Salto.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: ['POR', 'DEF'] } }, atributos: { marcaje: 2, salto: 1 } },
  },
};
