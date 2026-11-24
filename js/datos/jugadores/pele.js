// Pelé. Categoría Estrella: solo Épico y Legendario.
// Atributos en Legendario (Épico resta 6).
export default {
  id: 'pele',
  nombre: 'Pelé',
  nacion: 'Brasil',
  escuela: 'Jogo bonito',
  categoria: 'estrella',
  roles: ['interior', 'segundoDelantero', 'delanteroArea', 'mediapunta'],
  pie: 'derecho',
  pieMalo: 5,
  estado: 'aprobada', // aprobada por el usuario el 2026-11-23
  atributos: {
    definicion: 98, cabeza: 92, tiroLejano: 94,
    paseCorto: 92, paseLargo: 85, vision: 94, centros: 80,
    regate: 96, control: 96,
    entrada: 40, marcaje: 35, anticipacion: 62,
    velocidad: 94, resistencia: 88, fuerza: 85, salto: 92,
    posicionamiento: 95, compostura: 95,
    reflejos: 12, colocacion: 12, juegoAereo: 15, juegoPie: 20,
  },
  bonificaciones: [
    {
      nombre: 'O Rei',
      descripcion: 'Si juega de Delantero interior, Segundo delantero o Delantero de área: él gana +3 Definición y +3 Compostura.',
      condicion: { tipo: 'rol', roles: ['interior', 'segundoDelantero', 'delanteroArea'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { definicion: 3, compostura: 3 } },
    },
    {
      nombre: 'Canarinha',
      descripcion: 'Con al menos 2 compañeros brasileños: todos los brasileños ganan +2 Regate, +2 Control y +2 Velocidad.',
      condicion: { tipo: 'companeros', filtro: { nacion: 'Brasil' }, minimo: 2 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { nacion: 'Brasil' } }, atributos: { regate: 2, control: 2, velocidad: 2 } },
    },
  ],
  capitan: {
    nombre: 'Tricampeón',
    descripcion: 'Con el brazalete: todo el equipo gana +2 Compostura y +1 Pase corto.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'equipo' }, atributos: { compostura: 2, paseCorto: 1 } },
  },
};
