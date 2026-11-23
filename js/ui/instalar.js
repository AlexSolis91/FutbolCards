// Instalar el juego como app (PWA) en PC y celular.
// - Chrome / Edge (PC y Android): el navegador avisa con "beforeinstallprompt";
//   guardamos el aviso y el botón "Instalar" abre la ventana oficial.
// - iPhone / iPad (Safari): no hay ventana automática; el botón explica los pasos.
// - Si ya está instalada (se abre como app), el botón no aparece.

import { avisar } from './dialogo.js';

let avisoInstalacion = null;

export function estaInstalada() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: fullscreen)').matches
    || window.navigator.standalone === true;
}

function esIOS() {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
}

export function registrarServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* sin app instalable, el juego sigue */ });
  });
}

export function prepararBotonInstalar(boton) {
  const actualizar = () => {
    boton.hidden = estaInstalada() || !(avisoInstalacion || esIOS());
  };
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    avisoInstalacion = e;
    actualizar();
  });
  window.addEventListener('appinstalled', () => {
    avisoInstalacion = null;
    actualizar();
  });
  boton.addEventListener('click', async () => {
    if (avisoInstalacion) {
      avisoInstalacion.prompt();
      await avisoInstalacion.userChoice;
      avisoInstalacion = null;
      actualizar();
      return;
    }
    if (esIOS()) {
      avisar('Instalar en iPhone / iPad',
        'En Safari, toca el botón Compartir (el cuadrado con la flecha hacia arriba) y elige «Agregar a pantalla de inicio». Futbol Cards aparecerá como una app más.');
    }
  });
  actualizar();
}
