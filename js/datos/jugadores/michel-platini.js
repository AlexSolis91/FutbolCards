// Michel Platini. Categoría Estrella: solo Épico y Legendario (tres Balones
// de Oro). Atributos en Legendario (Épico resta 6). Como mediapunta, justo
// por debajo de Zidane y Ronaldinho (95), sin llegar al 96 de la cúspide.
export default {
  id: 'michel-platini',
  nombre: 'Michel Platini',
  nacion: 'Francia',
  escuela: 'Fútbol total',
  categoria: 'estrella',
  roles: ['mediapunta', 'segundoDelantero', 'regista'],
  pie: 'derecho',
  pieMalo: 4,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-26)
  atributos: {
    definicion: 93, cabeza: 80, tiroLejano: 92,
    paseCorto: 94, paseLargo: 90, vision: 96, centros: 86,
    regate: 92, control: 95,
    entrada: 50, marcaje: 42, anticipacion: 80,
    velocidad: 78, resistencia: 82, fuerza: 72, salto: 76,
    posicionamiento: 92, compostura: 94,
    reflejos: 10, colocacion: 10, juegoAereo: 10, juegoPie: 22,
  },
  bonificaciones: [
    {
      nombre: 'Le Roi',
      descripcion: 'Si juega de Mediapunta o Segundo delantero: él gana +3 Definición y +2 Visión.',
      condicion: { tipo: 'rol', roles: ['mediapunta', 'segundoDelantero'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { definicion: 3, vision: 2 } },
    },
    {
      nombre: 'Llegada desde atrás',
      descripcion: 'Con al menos 1 compañero de Regista: todos los Mediapuntas ganan +2 Tiro lejano y +2 Definición.',
      condicion: { tipo: 'companeros', filtro: { rol: 'regista' }, minimo: 1 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { rol: 'mediapunta' } }, atributos: { tiroLejano: 2, definicion: 2 } },
    },
  ],
  capitan: {
    nombre: 'Triple Balón de Oro',
    descripcion: 'Con el brazalete: todos los mediocampistas y delanteros ganan +2 Definición y +1 Visión.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: ['MED', 'DEL'] } }, atributos: { definicion: 2, vision: 1 } },
  },
};
