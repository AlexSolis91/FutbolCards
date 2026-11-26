// Guillermo Franco. Categoría Base: solo Común y Raro (ídolo del Monterrey,
// mundialista con México). Atributos en Raro (Común resta 6). Primer jugador
// Base del juego: muy por debajo de Shevchenko (Figura, 89) como delantero.
export default {
  id: 'guillermo-franco',
  nombre: 'Guillermo Franco',
  nacion: 'México',
  escuela: 'Potencia',
  categoria: 'base',
  roles: ['delanteroArea'],
  pie: 'derecho',
  pieMalo: 3,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-26)
  atributos: {
    definicion: 82, cabeza: 82, tiroLejano: 72,
    paseCorto: 74, paseLargo: 64, vision: 70, centros: 62,
    regate: 74, control: 76,
    entrada: 42, marcaje: 32, anticipacion: 66,
    velocidad: 74, resistencia: 80, fuerza: 82, salto: 80,
    posicionamiento: 80, compostura: 78,
    reflejos: 10, colocacion: 10, juegoAereo: 10, juegoPie: 20,
  },
  bonificaciones: [
    {
      nombre: 'Rematador',
      descripcion: 'Si juega de Delantero de área: él gana +3 Cabeza y +2 Fuerza.',
      condicion: { tipo: 'rol', roles: ['delanteroArea'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { cabeza: 3, fuerza: 2 } },
    },
    {
      nombre: 'Servicio por banda',
      descripcion: 'Con al menos 1 compañero de Extremo: los Delanteros de área ganan +2 Cabeza y +2 Posicionamiento.',
      condicion: { tipo: 'companeros', filtro: { rol: 'extremo' }, minimo: 1 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { rol: 'delanteroArea' } }, atributos: { cabeza: 2, posicionamiento: 2 } },
    },
  ],
  capitan: {
    nombre: 'Ídolo rayado',
    descripcion: 'Con el brazalete: todos los delanteros ganan +2 Fuerza y +1 Cabeza.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'DEL' } }, atributos: { fuerza: 2, cabeza: 1 } },
  },
};
