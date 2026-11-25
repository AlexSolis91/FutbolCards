// Neymar Jr. Categoría Figura: solo Raro y Épico (sin Balón de Oro).
// Atributos en Épico (Raro resta 6). Mejor extremo de las Figuras, por
// debajo de los extremos Estrella (Henry 91.5, Ronaldinho 92, Cristiano 92).
export default {
  id: 'neymar-jr',
  nombre: 'Neymar Jr',
  nacion: 'Brasil',
  escuela: 'Jogo bonito',
  categoria: 'figura',
  roles: ['extremo', 'interior', 'mediapunta'],
  pie: 'derecho',
  pieMalo: 4,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-25)
  atributos: {
    definicion: 84, cabeza: 62, tiroLejano: 82,
    paseCorto: 86, paseLargo: 78, vision: 86, centros: 84,
    regate: 95, control: 92,
    entrada: 32, marcaje: 25, anticipacion: 64,
    velocidad: 92, resistencia: 80, fuerza: 64, salto: 62,
    posicionamiento: 84, compostura: 86,
    reflejos: 10, colocacion: 10, juegoAereo: 10, juegoPie: 20,
  },
  bonificaciones: [
    {
      nombre: 'Ousadia',
      descripcion: 'Si juega de Extremo o Delantero interior: él gana +3 Regate y +2 Control.',
      condicion: { tipo: 'rol', roles: ['extremo', 'interior'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { regate: 3, control: 2 } },
    },
    {
      nombre: 'Tridente',
      descripcion: 'Con al menos 1 compañero de Falso 9: todos los Extremos ganan +2 Definición y +2 Regate.',
      condicion: { tipo: 'companeros', filtro: { rol: 'falso9' }, minimo: 1 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { rol: 'extremo' } }, atributos: { definicion: 2, regate: 2 } },
    },
  ],
  capitan: {
    nombre: 'Menino da Vila',
    descripcion: 'Con el brazalete: todos los delanteros ganan +2 Regate y +1 Control.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'DEL' } }, atributos: { regate: 2, control: 1 } },
  },
};
