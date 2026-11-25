// Neymar Jr. Categoría Estrella: solo Épico y Legendario (decisión del
// usuario, 2026-11-25). Atributos en Legendario (Épico resta 6). Como
// extremo, a la par de Henry (91) y por debajo de Ronaldinho y Cristiano (92).
export default {
  id: 'neymar-jr',
  nombre: 'Neymar Jr',
  nacion: 'Brasil',
  escuela: 'Jogo bonito',
  categoria: 'estrella',
  roles: ['extremo', 'interior', 'mediapunta'],
  pie: 'derecho',
  pieMalo: 4,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-25)
  atributos: {
    definicion: 86, cabeza: 64, tiroLejano: 84,
    paseCorto: 88, paseLargo: 80, vision: 88, centros: 86,
    regate: 97, control: 94,
    entrada: 34, marcaje: 27, anticipacion: 66,
    velocidad: 94, resistencia: 82, fuerza: 66, salto: 64,
    posicionamiento: 86, compostura: 88,
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
