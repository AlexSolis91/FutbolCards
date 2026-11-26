// André-Pierre Gignac. Categoría Base: solo Común y Raro (ídolo de Tigres,
// finalista de la Euro 2016). Atributos en Raro (Común resta 6). Un punto por
// encima de Guillermo Franco (81) y por debajo del Raro de las Figuras (83).
export default {
  id: 'andre-pierre-gignac',
  nombre: 'André-Pierre Gignac',
  nacion: 'Francia',
  escuela: 'Potencia',
  categoria: 'base',
  roles: ['delanteroArea'],
  pie: 'derecho',
  pieMalo: 3,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-26)
  atributos: {
    definicion: 83, cabeza: 80, tiroLejano: 84,
    paseCorto: 78, paseLargo: 70, vision: 76, centros: 66,
    regate: 74, control: 78,
    entrada: 42, marcaje: 32, anticipacion: 68,
    velocidad: 70, resistencia: 78, fuerza: 84, salto: 76,
    posicionamiento: 82, compostura: 82,
    reflejos: 10, colocacion: 10, juegoAereo: 10, juegoPie: 20,
  },
  bonificaciones: [
    {
      nombre: 'Bomba',
      descripcion: 'Si juega de Delantero de área: él gana +3 Tiro lejano y +2 Definición.',
      condicion: { tipo: 'rol', roles: ['delanteroArea'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { tiroLejano: 3, definicion: 2 } },
    },
    {
      nombre: 'Fuerza bruta',
      descripcion: 'Con al menos 2 compañeros de escuela Potencia: todos los de Potencia ganan +2 Fuerza y +2 Definición.',
      condicion: { tipo: 'companeros', filtro: { escuela: 'Potencia' }, minimo: 2 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { escuela: 'Potencia' } }, atributos: { fuerza: 2, definicion: 2 } },
    },
  ],
  capitan: {
    nombre: 'Ídolo felino',
    descripcion: 'Con el brazalete: todos los delanteros ganan +2 Definición y +1 Tiro lejano.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'DEL' } }, atributos: { definicion: 2, tiroLejano: 1 } },
  },
};
