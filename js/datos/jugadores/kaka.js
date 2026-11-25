// Kaká. Categoría Estrella: solo Épico y Legendario (Balón de Oro 2007).
// Atributos en Legendario (Épico resta 6). Antes era Figura; pasó a Estrella
// por coherencia con el resto (2026-11-25).
export default {
  id: 'kaka',
  nombre: 'Kaká',
  nacion: 'Brasil',
  escuela: 'Vértigo',
  categoria: 'estrella',
  roles: ['mediapunta', 'segundoDelantero', 'interior'],
  pie: 'derecho',
  pieMalo: 3,
  estado: 'aprobada', // publicada 2026-11-24; Estrella desde 2026-11-25
  atributos: {
    definicion: 90, cabeza: 72, tiroLejano: 90,
    paseCorto: 92, paseLargo: 86, vision: 93, centros: 80,
    regate: 94, control: 93,
    entrada: 45, marcaje: 40, anticipacion: 70,
    velocidad: 95, resistencia: 88, fuerza: 78, salto: 72,
    posicionamiento: 90, compostura: 92,
    reflejos: 10, colocacion: 10, juegoAereo: 10, juegoPie: 20,
  },
  bonificaciones: [
    {
      nombre: 'Arrancada',
      descripcion: 'Si juega de Mediapunta: él gana +3 Velocidad y +2 Regate.',
      condicion: { tipo: 'rol', roles: ['mediapunta'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { velocidad: 3, regate: 2 } },
    },
    {
      nombre: 'Contragolpe letal',
      descripcion: 'Con al menos 4 defensas compañeros: todos los mediocampistas ganan +2 Velocidad y +2 Pase corto.',
      condicion: { tipo: 'companeros', filtro: { linea: 'DEF' }, minimo: 4 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'MED' } }, atributos: { velocidad: 2, paseCorto: 2 } },
    },
  ],
  capitan: {
    nombre: 'Balón de Oro 2007',
    descripcion: 'Con el brazalete: todos los mediocampistas ganan +2 Resistencia y +1 Velocidad.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'MED' } }, atributos: { resistencia: 2, velocidad: 1 } },
  },
};
