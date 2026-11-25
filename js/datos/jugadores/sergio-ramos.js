// Sergio Ramos. Categoría Estrella con 3 rarezas: Raro, Épico y Legendario.
// Atributos en Legendario (Épico resta 6, Raro resta 12).
export default {
  id: 'sergio-ramos',
  nombre: 'Sergio Ramos',
  nacion: 'España',
  escuela: 'Garra',
  categoria: 'estrella',
  rarezas: ['raro', 'epico', 'legendario'],
  roles: ['central', 'lateral'],
  pie: 'derecho',
  pieMalo: 3,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-25)
  atributos: {
    definicion: 70, cabeza: 94, tiroLejano: 70,
    paseCorto: 84, paseLargo: 82, vision: 76, centros: 78,
    regate: 74, control: 80,
    entrada: 94, marcaje: 92, anticipacion: 92,
    velocidad: 84, resistencia: 86, fuerza: 90, salto: 94,
    posicionamiento: 90, compostura: 90,
    reflejos: 10, colocacion: 10, juegoAereo: 12, juegoPie: 25,
  },
  bonificaciones: [
    {
      nombre: 'Muro blanco',
      descripcion: 'Si juega de Central: él gana +3 Entrada y +2 Salto.',
      condicion: { tipo: 'rol', roles: ['central'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { entrada: 3, salto: 2 } },
    },
    {
      nombre: 'Jefe de la zaga',
      descripcion: 'Con al menos 3 defensas compañeros: todos los defensas ganan +2 Marcaje y +2 Fuerza.',
      condicion: { tipo: 'companeros', filtro: { linea: 'DEF' }, minimo: 3 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'DEF' } }, atributos: { marcaje: 2, fuerza: 2 } },
    },
  ],
  capitan: {
    nombre: 'Minuto 93',
    descripcion: 'Con el brazalete: todo el equipo gana +2 Fuerza y +1 Compostura.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'equipo' }, atributos: { fuerza: 2, compostura: 1 } },
  },
};
