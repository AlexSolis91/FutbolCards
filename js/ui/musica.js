// Música del juego: arranca con una pista al azar; luego suenan una tras otra
// en orden (tras la última, la primera). Volumen y silencio se guardan en el navegador.
// Los navegadores no dejan sonar audio hasta que el usuario toca la página,
// así que si el arranque se bloquea, empieza con el primer clic o tecla.

export const PISTAS = [
  { titulo: 'We Are One (Ole Ola)', archivo: 'assets/audio/musica/we-are-one.mp3' },
  { titulo: 'Drive — moa moa', archivo: 'assets/audio/musica/drive-moa-moa.mp3' },
  { titulo: 'Made of Gold — Ibeyi & Pa Salieu', archivo: 'assets/audio/musica/made-of-gold.mp3' },
  { titulo: 'On Our Way — The Royal Concept', archivo: 'assets/audio/musica/on-our-way.mp3' },
  { titulo: 'Get Down — Amplify Dot', archivo: 'assets/audio/musica/get-down.mp3' },
  { titulo: 'Runnin’ — David Dallas', archivo: 'assets/audio/musica/runnin.mp3' },
];

const CLAVE = 'fc-musica';
const audio = new Audio();
let indice = 0;
let fallosSeguidos = 0;
let cfg = { volumen: 0.5, silencio: false };
const oyentes = new Set();

function guardar() {
  try { localStorage.setItem(CLAVE, JSON.stringify(cfg)); } catch (e) { /* sin almacenamiento */ }
}

function avisar() {
  for (const fn of oyentes) fn(estadoMusica());
}

function cargar(i) {
  indice = (i + PISTAS.length) % PISTAS.length;
  audio.src = PISTAS[indice].archivo;
}

function reproducir() {
  return audio.play().then(() => { fallosSeguidos = 0; avisar(); return true; }, () => false);
}

function siguiente() {
  cargar(indice + 1);
  reproducir();
  avisar();
}

export function iniciarMusica() {
  try { cfg = { ...cfg, ...JSON.parse(localStorage.getItem(CLAVE)) }; } catch (e) { /* valores por defecto */ }
  if (!PISTAS.length) return;
  audio.preload = 'auto';
  audio.volume = cfg.volumen;
  audio.muted = cfg.silencio;
  audio.addEventListener('ended', siguiente);
  audio.addEventListener('error', () => {
    // Si una pista no carga, pasa a la siguiente (sin bucle infinito si fallan todas).
    if (++fallosSeguidos < PISTAS.length) siguiente();
  });
  cargar(Math.floor(Math.random() * PISTAS.length));
  reproducir().then((ok) => {
    if (ok) return;
    const arrancar = () => {
      reproducir().then((sono) => {
        if (!sono) return;
        document.removeEventListener('pointerdown', arrancar);
        document.removeEventListener('keydown', arrancar);
      });
    };
    document.addEventListener('pointerdown', arrancar);
    document.addEventListener('keydown', arrancar);
  });
}

export function estadoMusica() {
  return { volumen: cfg.volumen, silencio: cfg.silencio, pista: PISTAS[indice]?.titulo ?? '', sonando: !audio.paused };
}

export function cambiarVolumen(v) {
  cfg.volumen = Math.max(0, Math.min(1, v));
  audio.volume = cfg.volumen;
  if (cfg.volumen > 0 && cfg.silencio) { cfg.silencio = false; audio.muted = false; }
  guardar();
  avisar();
}

export function alternarSilencio() {
  cfg.silencio = !cfg.silencio;
  audio.muted = cfg.silencio;
  if (!cfg.silencio && audio.paused) reproducir();
  guardar();
  avisar();
}

export function alCambiarMusica(fn) {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
}

export function iconoSonido(e = estadoMusica()) {
  if (e.silencio || e.volumen === 0) return '🔇';
  return e.volumen < 0.5 ? '🔉' : '🔊';
}

// Solo para depuración desde la consola.
export { audio as audioMusica };
