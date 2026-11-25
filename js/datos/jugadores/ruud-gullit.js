// Ruud Gullit. Categoría Estrella: solo Épico y Legendario (Balón de Oro 1987).
// Atributos en Legendario (Épico resta 6). Por debajo del techo de 96.
export default {
  id: 'ruud-gullit',
  nombre: 'Ruud Gullit',
  nacion: 'Países Bajos',
  escuela: 'Fútbol total',
  categoria: 'estrella',
  roles: ['mediapunta', 'segundoDelantero', 'boxToBox'],
  pie: 'derecho',
  pieMalo: 4,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-25)
  atributos: {
    definicion: 88, cabeza: 90, tiroLejano: 88,
    paseCorto: 92, paseLargo: 86, vision: 94, centros: 82,
    regate: 92, control: 93,
    entrada: 78, marcaje: 70, anticipacion: 84,
    velocidad: 88, resistencia: 90, fuerza: 94, salto: 88,
    posicionamiento: 89, compostura: 93,
    reflejos: 10, colocacion: 10, juegoAereo: 12, juegoPie: 25,
  },
  bonificaciones: [
    {
      nombre: 'Tulipán negro',
      descripcion: 'Si juega de Mediapunta o Segundo delantero: él gana +3 Regate y +2 Fuerza.',
      condicion: { tipo: 'rol', roles: ['mediapunta', 'segundoDelantero'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { regate: 3, fuerza: 2 } },
    },
    {
      nombre: 'Libertad para atacar',
      descripcion: 'Con al menos 1 compañero de Ancla: todos los mediocampistas ganan +2 Tiro lejano y +2 Regate.',
      condicion: { tipo: 'companeros', filtro: { rol: 'ancla' }, minimo: 1 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'MED' } }, atributos: { tiroLejano: 2, regate: 2 } },
    },
  ],
  capitan: {
    nombre: 'Balón de Oro 1987',
    descripcion: 'Con el brazalete: todos los mediocampistas y delanteros ganan +2 Fuerza y +1 Definición.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: ['MED', 'DEL'] } }, atributos: { fuerza: 2, definicion: 1 } },
  },
};
