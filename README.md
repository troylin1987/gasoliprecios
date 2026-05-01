# GASOLIPRECIOS

**GASOLIPRECIOS** es una aplicación web responsive para consultar estaciones de servicio en España con precios oficiales de carburantes, filtros territoriales, búsqueda por texto, estado de apertura, ordenación por cercanía o precio y visualización en mapa.

La aplicación está pensada con filosofía **mobile first**, tema oscuro permanente y una experiencia rápida tanto en escritorio como en móvil.

## Funcionalidades

- Búsqueda de gasolineras cercanas usando la ubicación del usuario.
- Filtros por comunidad autónoma, provincia y municipio.
- Búsqueda libre por rótulo, dirección, localidad, municipio, provincia o código postal.
- Filtro por tipo de combustible.
- Opción para mostrar sólo estaciones abiertas ahora.
- Ordenación de resultados por cercanía o por precio.
- Vista de lista scrollable con las 20 estaciones más relevantes.
- Vista de mapa con OpenStreetMap y marcadores interactivos.
- Enlaces directos a Google Maps para llegar a cada estación.
- Interfaz multidioma.
- Google Analytics opcional, sólo con consentimiento del usuario.

## Fuente de datos

Los datos proceden de la API pública de precios de carburantes del Ministerio para la Transformación Digital y de la Función Pública:

```text
https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/
```

La información oficial indica que los precios se actualizan cada media hora.

## Privacidad

La ubicación se usa únicamente en el navegador del usuario y sólo para calcular distancias y mostrar el mapa. No se guarda, no se envía a ningún servidor y no se asocia a ningún usuario.

Google Analytics sólo se carga si el usuario acepta el aviso de analítica, y se utiliza únicamente con fines estadísticos para mejorar el sistema.

## Arquitectura

El proyecto está construido con:

- React
- Vite
- Tailwind CSS
- Flowbite
- Leaflet y OpenStreetMap
- GitHub Actions
- GitHub Pages

Para evitar problemas de CORS y reducir llamadas innecesarias:

- En desarrollo local se usa un proxy de Vite.
- En producción se sirve un JSON estático desde el mismo origen de GitHub Pages.
- GitHub Actions refresca los datos oficiales antes de compilar y publicar.
- La aplicación usa caché del navegador para mantener una experiencia rápida.

## Requisitos

- Node.js 20 o superior.
- npm.

## Instalación

```bash
npm install
```

## Desarrollo local

```bash
npm run dev
```

La aplicación quedará disponible normalmente en:

```text
http://localhost:5173/
```

Si el puerto está ocupado, Vite usará el siguiente puerto disponible.

## Scripts disponibles

```bash
npm run dev
```

Arranca el servidor de desarrollo.

```bash
npm run update:data
```

Descarga los datos oficiales y actualiza:

- `public/sampledata.json`
- `sampledata/sampledata.json`

```bash
npm run lint
```

Ejecuta ESLint.

```bash
npm run build
```

Genera la build de producción en `dist/`.

```bash
npm run preview
```

Sirve localmente la build generada.

## Google Analytics

La integración está preparada mediante la variable:

```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Puedes crear un fichero `.env.local` a partir de `.env.example`.

La analítica no se carga hasta que el usuario acepta el aviso de consentimiento.

## Despliegue en GitHub Pages

El despliegue está configurado en:

```text
.github/workflows/deploy.yml
```

El workflow:

1. Instala dependencias.
2. Refresca los datos oficiales.
3. Compila la aplicación con la base correcta para GitHub Pages.
4. Publica `dist/` usando GitHub Pages.

URL esperada:

```text
https://troylin1987.github.io/gasoliprecios/
```

## Configuración de GitHub Pages

En GitHub:

1. Entra en el repositorio.
2. Ve a `Settings`.
3. Entra en `Pages`.
4. En `Build and deployment`, selecciona `GitHub Actions`.
5. Lanza el workflow manualmente o haz push a `main`.

El workflow también está programado para ejecutarse cada 30 minutos y mantener actualizado el JSON publicado.

## Estructura principal

```text
src/
  components/         Componentes de interfaz
  content/copy.json   Textos multidioma
  lib/                Normalización, búsqueda, geolocalización, caché y analítica
public/
  sampledata.json     Datos usados por la web desplegada
sampledata/
  sampledata.json     Snapshot local de análisis
scripts/
  fetch-fuel-data.mjs Script de actualización de datos
```

## Licencia

Este proyecto se distribuye bajo licencia MIT.

## Autor

Creado por [Mario Gijón](https://www.mariogijon.es).
