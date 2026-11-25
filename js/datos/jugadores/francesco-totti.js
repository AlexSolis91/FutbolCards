// Francesco Totti. Categoría Figura: solo Raro y Épico (sin Balón de Oro).
// Atributos en Épico (Raro resta 6). Mejor mediapunta de las Figuras, por
// debajo de los mediapuntas Estrella (Gullit 92, Kaká 93, Zidane 95).
export default {
  id: 'francesco-totti',
  nombre: 'Francesco Totti',
  nacion: 'Italia',
  escuela: 'Jogo bonito',
  categoria: 'figura',
  roles: ['mediapunta', 'segundoDelantero', 'falso9'],
  pie: 'derecho',
  pieMalo: 4,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-25)
  atributos: {
    definicion: 88, cabeza: 72, tiroLejano: 88,
    paseCorto: 90, paseLargo: 86, vision: 91, centros: 82,
    regate: 86, control: 90,
    entrada: 45, marcaje: 38, anticipacion: 70,
    velocidad: 78, resistencia: 80, fuerza: 82, salto: 70,
    posicionamiento: 86, compostura: 90,
    reflejos: 10, colocacion: 10, juegoAereo: 10, juegoPie: 22,
  },
  bonificaciones: [
    {
      nombre: 'Cucchiaio',
      descripcion: 'Si juega de Mediapunta, Segundo delantero o Falso 9: él gana +3 Compostura y +2 Definición.',
      condicion: { tipo: 'rol', roles: ['mediapunta', 'segundoDelantero', 'falso9'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { compostura: 3, definicion: 2 } },
    },
    {
      nombre: 'Asistencia de tacón',
      descripcion: 'Con al menos 1 compañero de Delantero de área: los Delanteros de área ganan +2 Definición y +2 Compostura.',
      condicion: { tipo: 'companeros', filtro: { rol: 'delanteroArea' }, minimo: 1 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { rol: 'delanteroArea' } }, atributos: { definicion: 2, compostura: 2 } },
    },
  ],
  capitan: {
    nombre: 'Er Capitano',
    descripcion: 'Con el brazalete: todos los mediocampistas y delanteros ganan +2 Visión y +1 Pase corto.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: ['MED', 'DEL'] } }, atributos: { vision: 2, paseCorto: 1 } },
  },
};
