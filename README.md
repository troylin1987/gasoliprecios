# GASOLIPRECIOS

Buscador responsive de estaciones de servicio en España con precios oficiales, filtros por ubicación, combustible, apertura actual, vista lista y vista mapa.

## Desarrollo local

```bash
npm install
npm run dev
```

La app usa Vite. En local, las llamadas a la API oficial pasan por el proxy `/api/precios-carburantes/estaciones-terrestres` para evitar problemas de CORS en navegador.

## Scripts

```bash
npm run update:data
npm run lint
npm run build
```

`npm run update:data` descarga los datos oficiales y actualiza `public/sampledata.json` y `sampledata/sampledata.json`.

## GitHub Pages

El despliegue está preparado en `.github/workflows/deploy.yml`.

Para publicar:

1. En GitHub, entra en `Settings > Pages`.
2. En `Build and deployment`, selecciona `GitHub Actions` como source.
3. Haz push a `main`.
4. El workflow instalará dependencias, refrescará los datos oficiales, hará build con `GITHUB_PAGES=true` y publicará `dist`.

URL esperada:

`https://troylin1987.github.io/gasoliprecios/`

## Privacidad

La ubicación se usa únicamente en el navegador para calcular distancias y mostrar el mapa. No se guarda ni se envía a ningún servidor. Google Analytics sólo se carga si el usuario acepta el aviso de analítica.
