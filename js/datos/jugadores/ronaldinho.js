// Ronaldinho. Categoría Estrella: solo Épico y Legendario.
// Atributos en Legendario (Épico resta 6). Por debajo del techo de 96.
export default {
  id: 'ronaldinho',
  nombre: 'Ronaldinho',
  nacion: 'Brasil',
  escuela: 'Jogo bonito',
  categoria: 'estrella',
  roles: ['extremo', 'mediapunta', 'interior', 'segundoDelantero'],
  pie: 'derecho',
  pieMalo: 4,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-24)
  atributos: {
    definicion: 88, cabeza: 66, tiroLejano: 90,
    paseCorto: 93, paseLargo: 88, vision: 96, centros: 90,
    regate: 99, control: 98,
    entrada: 35, marcaje: 30, anticipacion: 65,
    velocidad: 90, resistencia: 80, fuerza: 80, salto: 72,
    posicionamiento: 88, compostura: 94,
    reflejos: 10, colocacion: 10, juegoAereo: 10, juegoPie: 22,
  },
  bonificaciones: [
    {
      nombre: 'Elástica',
      descripcion: 'Si juega de Extremo o Delantero interior: él gana +3 Regate y +2 Pase corto.',
      condicion: { tipo: 'rol', roles: ['extremo', 'interior'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { regate: 3, paseCorto: 2 } },
    },
    {
      nombre: 'Samba',
      descripcion: 'Con al menos 2 delanteros compañeros: todos los delanteros ganan +2 Control y +2 Definición.',
      condicion: { tipo: 'companeros', filtro: { linea: 'DEL' }, minimo: 2 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'DEL' } }, atributos: { control: 2, definicion: 2 } },
    },
  ],
  capitan: {
    nombre: 'Sonrisa de Balón de Oro',
    descripcion: 'Con el brazalete: todos los mediocampistas y delanteros ganan +2 Visión y +1 Regate.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: ['MED', 'DEL'] } }, atributos: { vision: 2, regate: 1 } },
  },
};
