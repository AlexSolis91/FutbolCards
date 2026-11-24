// Diego Maradona. Categoría Estrella: solo Épico y Legendario.
// Atributos en Legendario (Épico resta 6).
export default {
  id: 'diego-maradona',
  nombre: 'Diego Maradona',
  nacion: 'Argentina',
  escuela: 'Jogo bonito',
  categoria: 'estrella',
  roles: ['mediapunta', 'segundoDelantero', 'falso9'],
  pie: 'izquierdo',
  pieMalo: 2,
  estado: 'aprobada', // aprobada por el usuario el 2026-11-24
  atributos: {
    definicion: 92, cabeza: 65, tiroLejano: 92,
    paseCorto: 94, paseLargo: 90, vision: 97, centros: 86,
    regate: 99, control: 99,
    entrada: 35, marcaje: 28, anticipacion: 65,
    velocidad: 88, resistencia: 85, fuerza: 78, salto: 70,
    posicionamiento: 90, compostura: 95,
    reflejos: 10, colocacion: 10, juegoAereo: 10, juegoPie: 22,
  },
  bonificaciones: [
    {
      nombre: 'Barrilete cósmico',
      descripcion: 'Si juega de Mediapunta o Segundo delantero: él gana +3 Regate y +3 Tiro lejano.',
      condicion: { tipo: 'rol', roles: ['mediapunta', 'segundoDelantero'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { regate: 3, tiroLejano: 3 } },
    },
    {
      nombre: 'Pibe de Oro',
      descripcion: 'Con al menos 2 compañeros de escuela Jogo bonito: todos los de Jogo bonito ganan +2 Regate, +2 Visión y +2 Compostura.',
      condicion: { tipo: 'companeros', filtro: { escuela: 'Jogo bonito' }, minimo: 2 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { escuela: 'Jogo bonito' } }, atributos: { regate: 2, vision: 2, compostura: 2 } },
    },
  ],
  capitan: {
    nombre: 'Capitán del 86',
    descripcion: 'Con el brazalete: todos los mediocampistas y delanteros ganan +2 Regate y +2 Compostura.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: ['MED', 'DEL'] } }, atributos: { regate: 2, compostura: 2 } },
  },
};
