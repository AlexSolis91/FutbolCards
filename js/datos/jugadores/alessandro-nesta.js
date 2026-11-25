// Alessandro Nesta. Categoría Figura: solo Raro y Épico (sin Balón de Oro).
// Atributos en Épico (Raro resta 6). Mejor central de las Figuras, por
// debajo de Ramos (92) y Maldini (94), que son Estrella.
export default {
  id: 'alessandro-nesta',
  nombre: 'Alessandro Nesta',
  nacion: 'Italia',
  escuela: 'Catenaccio',
  categoria: 'figura',
  roles: ['central', 'libero'],
  pie: 'derecho',
  pieMalo: 3,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-25)
  atributos: {
    definicion: 50, cabeza: 82, tiroLejano: 55,
    paseCorto: 82, paseLargo: 78, vision: 74, centros: 62,
    regate: 72, control: 80,
    entrada: 92, marcaje: 92, anticipacion: 90,
    velocidad: 84, resistencia: 82, fuerza: 84, salto: 84,
    posicionamiento: 88, compostura: 88,
    reflejos: 10, colocacion: 10, juegoAereo: 12, juegoPie: 25,
  },
  bonificaciones: [
    {
      nombre: 'Entrada limpia',
      descripcion: 'Si juega de Central o Líbero: él gana +3 Marcaje y +2 Velocidad.',
      condicion: { tipo: 'rol', roles: ['central', 'libero'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { marcaje: 3, velocidad: 2 } },
    },
    {
      nombre: 'Escuela italiana',
      descripcion: 'Con al menos 2 compañeros de escuela Catenaccio: todos los de Catenaccio ganan +2 Marcaje y +2 Posicionamiento.',
      condicion: { tipo: 'companeros', filtro: { escuela: 'Catenaccio' }, minimo: 2 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { escuela: 'Catenaccio' } }, atributos: { marcaje: 2, posicionamiento: 2 } },
    },
  ],
  capitan: {
    nombre: 'Línea de cuatro',
    descripcion: 'Con el brazalete: todos los defensas ganan +2 Entrada y +1 Velocidad.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'DEF' } }, atributos: { entrada: 2, velocidad: 1 } },
  },
};
