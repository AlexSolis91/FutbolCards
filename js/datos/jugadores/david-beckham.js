// David Beckham. Categoría Figura con 3 rarezas: Común, Raro y Épico.
// Atributos en Épico (Raro resta 6, Común resta 12). Antes llegaba a
// Legendario; bajó por coherencia con el resto (2026-11-25).
export default {
  id: 'david-beckham',
  nombre: 'David Beckham',
  nacion: 'Inglaterra',
  escuela: 'Potencia',
  categoria: 'figura',
  rarezas: ['comun', 'raro', 'epico'],
  roles: ['regista', 'extremo', 'carrilero'],
  pie: 'derecho',
  pieMalo: 3,
  estado: 'aprobada', // publicada 2026-11-25; Figura desde 2026-11-25
  atributos: {
    definicion: 76, cabeza: 64, tiroLejano: 90,
    paseCorto: 88, paseLargo: 94, vision: 88, centros: 97,
    regate: 78, control: 86,
    entrada: 68, marcaje: 62, anticipacion: 80,
    velocidad: 78, resistencia: 92, fuerza: 72, salto: 64,
    posicionamiento: 82, compostura: 88,
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
