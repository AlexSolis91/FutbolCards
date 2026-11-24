// node herramientas/formaciones-paralelo.mjs [partidos por cruce] [procesos]
// Corre herramientas/formaciones.mjs repartido en varios procesos.
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const K = process.argv[2] ?? '300';
const P = Number(process.argv[3] ?? 4);
const script = fileURLToPath(new URL('./formaciones.mjs', import.meta.url));
const correr = promisify(execFile);
const salidas = await Promise.all(Array.from({ length: P }, (_, i) =>
  correr(process.execPath, [script, K, String(i), String(P)], { maxBuffer: 1 << 24 })));
const lista = salidas.flatMap((s) => Object.values(JSON.parse(s.stdout.trim().split('\n').at(-1))));
const { imprimir } = await import('./formaciones.mjs');
imprimir(lista, K);
