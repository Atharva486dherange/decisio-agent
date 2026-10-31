import { build } from 'vite';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
// Keep the existing Vite/React project. Package its assets and portable API in one Worker.
await build();
const assets = {};
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
async function collect(directory, prefix = '') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'server') continue;
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) await collect(filename, `${prefix}/${entry.name}`);
    else assets[`${prefix}/${entry.name}`] = { body: (await readFile(filename)).toString('base64'), type: types[path.extname(entry.name)] || 'application/octet-stream' };
  }
}
await collect('dist');
await mkdir('.artifacts', { recursive: true });
await writeFile('.artifacts/assets.generated.js', `export default ${JSON.stringify(assets)};\n`);
await build({ configFile: false, publicDir: false, build: { target: 'es2022', outDir: 'dist/server', emptyOutDir: false, minify: true, lib: { entry: path.resolve('worker/index.js'), formats: ['es'], fileName: () => 'index.js' } } });
await mkdir('dist/.openai', { recursive: true });
const manifest = JSON.parse((await readFile('.openai/hosting.json', 'utf8')).replace(/^\uFEFF/, ''));
await writeFile('dist/.openai/hosting.json', JSON.stringify(manifest, null, 2) + '\n');
console.log('Hosted Worker and embedded frontend packaged successfully.');
