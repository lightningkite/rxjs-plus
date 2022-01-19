mkdir demo/node_modules
mkdir demo/node_modules/@lightningkite
mkdir demo/node_modules/@lightningkite/rxjs-plus
rsync package.json demo/node_modules/@lightningkite/rxjs-plus/package.json
rsync jsx-runtime.js demo/node_modules/@lightningkite/rxjs-plus/jsx-runtime.js
rsync jsx-runtime.d.ts demo/node_modules/@lightningkite/rxjs-plus/jsx-runtime.d.ts
rsync index.js demo/node_modules/@lightningkite/rxjs-plus/index.js
rsync index.d.ts demo/node_modules/@lightningkite/rxjs-plus/index.d.ts
rsync -r --delete dist/ demo/node_modules/@lightningkite/rxjs-plus/dist/
