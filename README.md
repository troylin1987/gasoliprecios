# GASOLIPRECIOS

**GASOLIPRECIOS** es una aplicación web responsive para consultar estaciones de servicio en España con precios oficiales de carburantes, filtros territoriales, búsqueda por texto, estado de apertura, ordenación por cercanía o precio y visualización en mapa.

La aplicación está pensada con filosofía **mobile first**, soporte de **tema oscuro y claro** con mejora de accesibilidad, y una experiencia rápida tanto en escritorio como en móvil.

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
- Interfaz multidioma con banderas regionales para idiomas co-oficiales.
- **Selector de tema oscuro y claro** con adaptación de colores y accesibilidad mejorada para usuarios con dificultades visuales.
- Google Analytics opcional, sólo con consentimiento del usuario.
- Consentimiento de privacidad obligatorio en pantalla completa.

## Fuente de datos

Los datos proceden de la API pública de precios de carburantes del Ministerio para la Transformación Digital y de la Función Pública:

```text
https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/
```

La información oficial indica que los precios se actualizan cada media hora.

## Privacidad

La ubicación se usa únicamente en el navegador del usuario y sólo para calcular distancias y mostrar el mapa. No se guarda, no se envía a ningún servidor y no se asocia a ningún usuario.

Google Analytics sólo se carga si el usuario acepta el aviso de analítica, y se utiliza únicamente con fines estadísticos para mejorar el sistema.

El consentimiento de privacidad aparece en pantalla completa y es obligatorio para continuar usando la aplicación.

## Accesibilidad

La aplicación incluye un **selector de tema oscuro/claro** accesible desde el menú principal. El modo claro ofrece:

- Paleta de colores clara con mayor contraste para mejorar legibilidad
- Tipografía con tamaño base aumentado para personas con dificultades visuales
- Colores menos saturados para reducir fatiga ocular
- Espaciado y padding adaptado para mejor legibilidad
- Soporte completo en versión responsive y mobile first

Los dos temas mantienen la misma funcionalidad, estructura y branding, adaptando únicamente la paleta visual y el contraste según la preferencia del usuario.

## Multiidioma

La aplicación soporta 12 idiomas:

- Español (SPA) 🇪🇸
- Inglés (ENG) 🇬🇧
- Catalán (CAT) 🗣️
- Gallego (GLG) 🗣️
- Euskera (EUS) 🗣️
- Francés (FRA) 🇫🇷
- Italiano (ITA) 🇮🇹
- Alemán (DEU) 🇩🇪
- Chino (ZHO) 🇨🇳
- Japonés (JPN) 🇯🇵
- Ruso (RUS) 🇷🇺
- Polaco (POL) 🇵🇱

La selección de idioma se persiste en el navegador y se puede cambiar desde el menú en cualquier momento.

## Arquitectura

El proyecto está construido con:

- React
- Vite
- Tailwind CSS con soporte para clase `light` y `dark`
- Flowbite
- Leaflet y OpenStreetMap
- GitHub Actions
- GitHub Pages

**Sistema de temas:**

La aplicación implementa un sistema de temas que permite cambiar entre modo oscuro (por defecto) y modo claro.

- Las preferencias de tema se guardan en `localStorage` como `gasoliprecios:theme`
- Los estilos se adaptan mediante selectores CSS en `src/styles.css`
- El estado del tema se gestiona en `App.jsx` y se pasa como prop a través de la jerarquía de componentes
- El toggle de tema está disponible en el Header tanto en vista desktop como mobile

Para evitar problemas de CORS y reducir llamadas innecesarias:

- En desarrollo local se usa un proxy de Vite.
- En producción se sirve un JSON estático desde el mismo origen de GitHub Pages.
- GitHub Actions refresca los datos oficiales antes de compilar y publicar.
- La aplicación usa caché del navegador para mantener una experiencia rápida.
- Cada build genera un número de versión visible en el footer y un `version.json`.
- Los assets se publican con hash de contenido para evitar servir código antiguo tras un despliegue.

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
Antes de compilar se genera automáticamente `src/generated/version.js` y `public/version.json`.

```bash
npm run preview
```

Sirve localmente la build generada.

## Google Analytics

La integración está preparada mediante la variable:

```bash
VITE_GA_MEASUREMENT_ID=G-CQ3MN53CLR
```

Puedes crear un fichero `.env.local` a partir de `.env.example`.

La analítica no se carga hasta que el usuario acepta el aviso de consentimiento.

En GitHub Actions, define el secret `VITE_GA_MEASUREMENT_ID` en:

```text
Settings > Secrets and variables > Actions
```

Más detalle en [docs/production-setup.md](docs/production-setup.md).

## Despliegue en GitHub Pages

El despliegue está configurado en:

```text
.github/workflows/deploy.yml
```

El workflow:

1. Instala dependencias.
2. Refresca los datos oficiales.
3. Compila la aplicación con base `/`, adecuada para el dominio propio.
4. Publica `dist/` usando GitHub Pages.

URL de producción:

```text
https://www.gasoliprecios.com/
```

## Configuración de GitHub Pages

En GitHub:

1. Entra en el repositorio.
2. Ve a `Settings`.
3. Entra en `Pages`.
4. En `Build and deployment`, selecciona `GitHub Actions`.
5. Lanza el workflow manualmente o haz push a `main`.

El workflow también está programado para ejecutarse cada 30 minutos y mantener actualizado el JSON publicado.

## Dominio propio

La app está preparada para funcionar en GitHub Pages con:

```text
www.gasoliprecios.com
```

El fichero `public/CNAME` ya contiene el dominio final. En el proveedor DNS debe existir un registro `CNAME` para `www` apuntando a `troylin1987.github.io`.

Más detalle en [docs/production-setup.md](docs/production-setup.md).

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
