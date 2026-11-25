// David Beckham. Categoría Estrella con 3 rarezas: Raro, Épico y Legendario.
// Atributos en Legendario (Épico resta 6, Raro resta 12).
export default {
  id: 'david-beckham',
  nombre: 'David Beckham',
  nacion: 'Inglaterra',
  escuela: 'Potencia',
  categoria: 'estrella',
  rarezas: ['raro', 'epico', 'legendario'],
  roles: ['regista', 'extremo', 'carrilero'],
  pie: 'derecho',
  pieMalo: 3,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-25)
  atributos: {
    definicion: 78, cabeza: 66, tiroLejano: 92,
    paseCorto: 90, paseLargo: 96, vision: 90, centros: 99,
    regate: 80, control: 88,
    entrada: 70, marcaje: 64, anticipacion: 82,
    velocidad: 80, resistencia: 94, fuerza: 74, salto: 66,
    posicionamiento: 84, compostura: 90,
    reflejos: 10, colocacion: 10, juegoAereo: 10, juegoPie: 25,
  },
  bonificaciones: [
    {
      nombre: 'Golpe con efecto',
      descripcion: 'Si juega de Regista, Extremo o Carrilero: él gana +3 Pase largo y +2 Tiro lejano.',
      condicion: { tipo: 'rol', roles: ['regista', 'extremo', 'carrilero'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { paseLargo: 3, tiroLejano: 2 } },
    },
    {
      nombre: 'Centro medido',
      descripcion: 'Con al menos 1 Delantero de área compañero: los Delanteros de área ganan +3 Cabeza y +2 Salto.',
      condicion: { tipo: 'companeros', filtro: { rol: 'delanteroArea' }, minimo: 1 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { rol: 'delanteroArea' } }, atributos: { cabeza: 3, salto: 2 } },
    },
  ],
  capitan: {
    nombre: 'Three Lions',
    descripcion: 'Con el brazalete: todos los mediocampistas ganan +2 Centros y +2 Resistencia.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'MED' } }, atributos: { centros: 2, resistencia: 2 } },
  },
};
