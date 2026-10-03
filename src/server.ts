/**
 * Launcher server Next.js (TypeScript) yang membaca port secara dinamis
 * dari APP_PORT pada berkas .env (atau .env.example sebagai cadangan).
 *
 * Jalankan:  bun run serve                       (mode development)
 *            NODE_ENV=production bun src/server.ts   (setelah `bun run build`)
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import next from 'next';

function loadEnvFile(file: string): void {
  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  }
}

loadEnvFile('.env');
loadEnvFile('.env.example');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = Number(process.env.APP_PORT ?? 3000);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, hostname, () => {
    console.log(`> Ruang Post siap di http://localhost:${port} (${dev ? 'development' : 'production'})`);
  });
});
