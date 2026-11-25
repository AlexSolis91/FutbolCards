// Andriy Shevchenko. Categoría Figura: solo Raro y Épico (el usuario lo puso
// como ejemplo de Figura al crear las categorías, 2026-11-23).
// Atributos en Épico (Raro resta 6). Mejor delantero de área de las Figuras.
export default {
  id: 'andriy-shevchenko',
  nombre: 'Andriy Shevchenko',
  nacion: 'Ucrania',
  escuela: 'Vértigo',
  categoria: 'figura',
  roles: ['delanteroArea', 'interior'],
  pie: 'derecho',
  pieMalo: 4,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-25)
  atributos: {
    definicion: 93, cabeza: 84, tiroLejano: 86,
    paseCorto: 80, paseLargo: 72, vision: 80, centros: 72,
    regate: 86, control: 86,
    entrada: 40, marcaje: 30, anticipacion: 72,
    velocidad: 90, resistencia: 84, fuerza: 84, salto: 80,
    posicionamiento: 90, compostura: 89,
    reflejos: 10, colocacion: 10, juegoAereo: 10, juegoPie: 20,
  },
  bonificaciones: [
    {
      nombre: 'Ariete',
      descripcion: 'Si juega de Delantero de área o Delantero interior: él gana +3 Definición y +2 Posicionamiento.',
      condicion: { tipo: 'rol', roles: ['delanteroArea', 'interior'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { definicion: 3, posicionamiento: 2 } },
    },
    {
      nombre: 'Socio del 10',
      descripcion: 'Con al menos 1 compañero de Mediapunta: todos los delanteros ganan +2 Posicionamiento y +2 Velocidad.',
      condicion: { tipo: 'companeros', filtro: { rol: 'mediapunta' }, minimo: 1 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'DEL' } }, atributos: { posicionamiento: 2, velocidad: 2 } },
    },
  ],
  capitan: {
    nombre: 'Balón de Oro 2004',
    descripcion: 'Con el brazalete: todos los delanteros ganan +2 Posicionamiento y +1 Definición.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'DEL' } }, atributos: { posicionamiento: 2, definicion: 1 } },
  },
};
