// Fabio Cannavaro. Categoría Estrella: solo Épico y Legendario (Balón de Oro 2006).
// Atributos en Legendario (Épico resta 6). Entre Ramos (92) y Maldini (94).
export default {
  id: 'fabio-cannavaro',
  nombre: 'Fabio Cannavaro',
  nacion: 'Italia',
  escuela: 'Catenaccio',
  categoria: 'estrella',
  roles: ['central', 'libero'],
  pie: 'derecho',
  pieMalo: 3,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-25)
  atributos: {
    definicion: 52, cabeza: 88, tiroLejano: 58,
    paseCorto: 82, paseLargo: 78, vision: 74, centros: 62,
    regate: 72, control: 80,
    entrada: 95, marcaje: 94, anticipacion: 95,
    velocidad: 86, resistencia: 86, fuerza: 86, salto: 92,
    posicionamiento: 92, compostura: 90,
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
