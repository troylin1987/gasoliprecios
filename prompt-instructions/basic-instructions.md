# Instrucciones base del proyecto Gasoliprecios

## Fuente de datos

La fuente principal es la API publica del Ministerio:

`https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/`

El fichero de muestra inicial esta guardado en:

`sampledata/sampledata.json`

## Estructura observada

La respuesta es JSON y contiene cuatro campos de primer nivel:

- `Fecha`: fecha y hora de generacion de la respuesta en formato `DD/MM/YYYY HH:mm:ss`.
- `ListaEESSPrecio`: array principal con las estaciones de servicio.
- `Nota`: texto informativo de la API.
- `ResultadoConsulta`: estado de la consulta, observado como `OK`.

En la muestra del 01/05/2026 12:15:04 se han recibido 11.429 estaciones.

## Reglas de interpretacion de datos

- Tratar todos los valores recibidos como strings de origen.
- Los precios llegan como texto con coma decimal, por ejemplo `1,669`; convertirlos a numero solo en la capa de normalizacion.
- Los campos sin dato llegan como cadena vacia `""`, no como `null`.
- Las coordenadas `Latitud` y `Longitud (WGS84)` tambien usan coma decimal.
- Los campos con nombres especiales, acentos, puntos, porcentajes o parentesis deben accederse con notacion de corchetes, por ejemplo `station["Precio Gasoleo A"]`.
- `IDEESS` debe considerarse el identificador estable de una estacion dentro de esta fuente.
- No asumir que todas las estaciones tienen todos los combustibles disponibles.

## Campos principales por estacion

Campos de ubicacion e identificacion:

- `IDEESS`
- `Rótulo`
- `Dirección`
- `C.P.`
- `Localidad`
- `Municipio`
- `Provincia`
- `IDMunicipio`
- `IDProvincia`
- `IDCCAA`
- `Latitud`
- `Longitud (WGS84)`

Campos operativos:

- `Horario`
- `Margen`
- `Tipo Venta`
- `Remisión`
- `% BioEtanol`
- `% Éster metílico`

Campos de precio:

- `Precio Adblue`
- `Precio Amoniaco`
- `Precio Biodiesel`
- `Precio Bioetanol`
- `Precio Biogas Natural Comprimido`
- `Precio Biogas Natural Licuado`
- `Precio Diésel Renovable`
- `Precio Gas Natural Comprimido`
- `Precio Gas Natural Licuado`
- `Precio Gases licuados del petróleo`
- `Precio Gasoleo A`
- `Precio Gasoleo B`
- `Precio Gasoleo Premium`
- `Precio Gasolina 95 E10`
- `Precio Gasolina 95 E25`
- `Precio Gasolina 95 E5`
- `Precio Gasolina 95 E5 Premium`
- `Precio Gasolina 95 E85`
- `Precio Gasolina 98 E10`
- `Precio Gasolina 98 E5`
- `Precio Gasolina Renovable`
- `Precio Hidrogeno`
- `Precio Metanol`

## Criterios para el desarrollo

- Mantener una copia de muestra en `sampledata/` para pruebas locales y analisis sin depender siempre de la red.
- Crear una capa de normalizacion antes de consumir los datos desde la UI o desde calculos.
- Separar el modelo normalizado interno de los nombres originales de la API.
- Preservar el dato original cuando sea util para depuracion.
- Validar explicitamente conversiones de precio y coordenadas.
- Considerar la API como datos vivos: la nota indica actualizacion cada media hora.

## Requisitos funcionales de la aplicacion

- La aplicacion se llamara `GASOLIPRECIOS`.
- La primera seccion funcional sera `Buscador de Gasolineras`.
- Debe existir una seccion `Acerca de` para explicar la fuente de datos y el creador.
- El buscador debe permitir localizar gasolineras cercanas usando la ubicacion del usuario y solicitando permiso de geolocalizacion.
- Debe permitir filtro encadenado por comunidad autonoma, provincia y municipio.
- El filtro territorial debe construirse desde `IDCCAA`, `IDProvincia` e `IDMunicipio`.
- La seleccion territorial debe ser progresiva: primero comunidad autonoma, despues provincias de esa comunidad, despues municipios de esa provincia.
- Debe permitir busqueda libre por texto sobre rotulo, direccion, localidad, municipio, provincia y codigo postal.
- Debe permitir filtro por tipo de combustible.
- El filtro de combustible debe venir por defecto en `Todos`.
- Si una estacion no tiene precio para un combustible, se considera que no ofrece ese combustible.
- Debe interpretar `Horario` para estimar si la estacion esta abierta en el momento de la busqueda.
- Debe existir un flag `Mostrar solo abiertas ahora`.
- El flag `Mostrar solo abiertas ahora` debe venir marcado por defecto.
- Los resultados deben mostrar siempre como maximo las 20 gasolineras mas cercanas al usuario que cumplan los filtros.
- Los resultados deben poder ordenarse por cercania o por precio.
- Ordenar por precio significa ordenar esas 20 gasolineras cercanas por el mejor precio EUR/l del combustible seleccionado.
- Si no hay combustible seleccionado, el precio de referencia puede ser el mejor precio disponible de la estacion.
- Cada resultado debe mostrar rotulo, direccion, horario, localidad, precios de combustibles y distancia al usuario.
- La distancia solo debe mostrarse cuando exista ubicacion del usuario; si no hay permisos o no se puede obtener ubicacion, no debe mostrarse ningun texto tipo "Sin ubicacion".
- Al tocar un resultado se debe abrir Google Maps con una ruta o destino a la estacion.
- Debe existir vista de lista y vista de mapa.
- La vista de lista debe ser scrollable.
- La vista de mapa debe usar OpenStreetMap.
- En el mapa se debe indicar la ubicacion del usuario cuando exista.
- En el mapa se deben ubicar las gasolineras cercanas con marcadores.
- El zoom del mapa debe ajustarse a los resultados visibles.
- Al tocar una gasolinera en el mapa se debe mostrar la misma informacion basica definida para la lista.

## Requisitos de UX y responsive

- La filosofia de construccion debe ser mobile first.
- En mobile, los filtros deben aparecer arriba y los resultados debajo.
- En desktop, debe haber un panel izquierdo para filtros y un panel derecho para resultados.
- El header debe contener titulo `GASOLIPRECIOS`, espacio para icono y menu hamburguesa.
- El subtitulo del header debe ser `Buscador de gasolina barata`.
- En mobile, el menu hamburguesa debe abrir un menu con `Buscador` y `Acerca de`, no navegar directamente a otra pagina.
- El menu hamburguesa debe mostrarse como panel superpuesto/deslizante sobre el contenido, sin empujar la pagina hacia abajo.
- Debe mostrarse la ultima fecha de actualizacion de precios.
- La ultima fecha de actualizacion debe verse tambien en mobile.
- Debe existir footer con informacion relevante de datos, mapas y atribuciones.
- El footer debe ser profesional: marca a la izquierda y copyright con ano automatico a la derecha.
- La aplicacion debe usar tema oscuro permanente.
- El branding principal debe combinar fondo negro con naranja y turquesa.
- Los colores naranja y turquesa deben usarse para jerarquia visual, acentos, estados y datos relevantes, no solo como decoracion.
- La tipografia debe usar solo Bebas Neue, aplicando jerarquia mediante tamano, color, peso visual, bordes y espaciado.
- El texto `GASOLIPRECIOS` y el subtitulo del header deben estar alineados entre si.
- Los textos generales deben ser algo mas compactos para mejorar densidad y legibilidad.
- Los filtros deben estar compactados en altura para que quepan en desktop sin scroll interno siempre que sea razonable.
- En mobile, los filtros tambien deben ocupar la menor altura posible para dejar ver resultados cuanto antes.
- Las secciones principales, como buscador y resultados, deben destacar con un fondo levemente distinto del fondo global.
- Deben existir microanimaciones y microtransiciones en interacciones, cambios de estado y tarjetas.
- Toda carga, espera o procesamiento debe tener feedback visual.
- Todo error debe mostrarse con un mensaje claro y amigable.

## Requisitos tecnicos

- El stack elegido es React + Vite.
- El sistema visual debe apoyarse en Flowbite Design System y Tailwind CSS.
- El mapa debe apoyarse en Leaflet/OpenStreetMap.
- La aplicacion debe prepararse para desplegarse en GitHub Pages.
- El despliegue debe realizarse mediante GitHub Actions.
- La base de Vite debe poder configurarse para GitHub Pages.
- La aplicacion debe intentar consumir la API real y usar cache local si la informacion sigue vigente.
- La cache debe respetar una ventana de 30 minutos, coherente con la frecuencia de actualizacion oficial.
- Si la API falla, la aplicacion puede usar cache caducada o `public/sampledata.json` como fallback para no romper la experiencia.
- Para evitar problemas de CORS, la web desplegada en GitHub Pages no debe llamar directamente a la API del Ministerio desde el navegador.
- En produccion, la web debe leer `sampledata.json` desde el mismo origen de GitHub Pages.
- GitHub Actions debe refrescar `public/sampledata.json` desde la API oficial antes de compilar y desplegar.
- En desarrollo local con Vite se puede usar un proxy local `/api/precios-carburantes/estaciones-terrestres` para consultar la API sin CORS en el navegador.
- La muestra completa debe mantenerse en `sampledata/sampledata.json`; para uso web local se puede copiar a `public/sampledata.json`.
- Si la aplicacion permanece abierta y se alcanza el intervalo de refresco previsto, debe refrescar automaticamente los datos y recalcular resultados.
- Al entrar en la web no deben mostrarse resultados ni ejecutarse una busqueda por defecto; la busqueda inicial se activa al pulsar `Usar mi ubicacion`.
- Cada build debe generar automaticamente un numero de version visible en el footer: `GASOLIPRECIOS - Version ...`.
- Los assets deben publicarse con hash de contenido y la app debe usar busting de version para datos estaticos para reducir cache obsoleta tras deploys.
- La analitica debe estar preparada para Google Analytics usando `VITE_GA_MEASUREMENT_ID`.
- Eventos recomendados: carga de datos, busqueda, permiso de ubicacion concedido/denegado, apertura de Google Maps, cambio de vista y filtros relevantes.
- Google Analytics no debe cargarse sin consentimiento previo del usuario.
- Debe existir aviso de privacidad/analitica con aceptar y rechazar.
- La ubicacion del usuario se usa solo en memoria del navegador para calcular distancias; no debe guardarse ni enviarse a servidores propios.
- Todos los textos visibles de titulos, labels, botones, mensajes y copy deben vivir en un fichero configurable bilingue.
- El fichero actual de textos es `src/content/copy.json`.
- La aplicacion debe permitir alternar idioma desde el menu, mostrando bandera e ISO de 3 letras.
- El idioma por defecto es castellano.
- Idiomas soportados: castellano (`SPA`), ingles (`ENG`), catalan (`CAT`), gallego (`GLG`), euskera (`EUS`), frances (`FRA`), italiano (`ITA`), aleman (`DEU`), chino (`ZHO`), japones (`JPN`), ruso (`RUS`) y polaco (`POL`).

## Requisitos SEO

- Incluir `title` y `description` orientados a busqueda de gasolineras, precios y cercania.
- Incluir `canonical`.
- Incluir etiquetas Open Graph y Twitter Card.
- Incluir `theme-color`, autor, idioma `es` y robots indexables.
- Incluir datos estructurados JSON-LD de tipo `WebApplication`.
- Preparar imagen social `og-image`.
- Mantener contenido semantico con encabezados claros y textos descriptivos.
- Priorizar rendimiento, accesibilidad, responsive y estabilidad visual.
- Optimizar title, description, keywords, OG y JSON-LD para terminos como `gasolineras cercanas`, `gasolina barata`, `gasolineras con precios bajos`, `gasolineras low cost`, `precio gasolina barato`, `diesel barato` y busquedas locales relacionadas.

## Contenido especifico

- En resultados, el contador debe decir `20 estaciones`, `1 estacion` o el numero correspondiente, sin la palabra `seleccionadas`.
- El texto auxiliar que decia "Siempre se muestran hasta 20 estaciones cercanas..." no debe mostrarse en la UI.
- En lista y popup de mapa, cada estacion debe agrupar informacion con labels: `Localizacion`, `Horario` y `Combustible disponible`.
- La pagina `Acerca de` debe partir del texto aprobado por el usuario y puede ampliarse con una presentacion mas marketiniana y un panel tecnico con datos utiles.
- La pagina `Acerca de` debe mencionar la API publica del Ministerio para la Transformacion Digital y de la Funcion Publica, la actualizacion cada media hora, autoria de Mario Gijon y enlace a `https://www.mariogijon.es`.
- La pagina `Acerca de` debe incluir atribucion cartografica a OpenStreetMap y enlaces de ruta mediante Google Maps.
- La pagina `Acerca de` debe incluir informacion de privacidad: ubicacion local en navegador, no guardado de ubicacion y analitica opcional con consentimiento.
- La seccion de API responsable debe titularse `Uso responsable de la API` y explicar que se utiliza cache del navegador para reducir llamadas y mantener una experiencia rapida.
- La seccion de privacidad debe titularse `Privacidad sin letra pequena`.
- La privacidad debe indicar que la ubicacion se usa solo en el navegador para calcular distancias y mostrar el mapa, que no se guarda, no se envia a ningun servidor y no se asocia a ningun usuario.
- La analitica solo debe activarse con consentimiento y solo debe usarse con fines estadisticos para mejorar el sistema.
- En detalles utiles no debe mostrarse informacion interna de normalizacion de precios ni reglas tecnicas de exclusion por combustible.
- En detalles utiles debe indicarse que la interpretacion de horarios puede contener errores, que los resultados se limitan a 20 estaciones para funcionamiento adecuado y que se recomienda activar la ubicacion.
- La seccion final de `Acerca de` debe titularse `Agradecimientos` y no debe mostrar subtitulo si no aporta contenido.
- El nombre `Mario Gijon` debe ser enlace a `https://www.mariogijon.es`; no debe aparecer el texto suelto `mariogijon.es` al final.
- El dominio final de produccion es `https://www.gasoliprecios.com/`.
- Para produccion, canonical y OG deben apuntar a `https://www.gasoliprecios.com/`.
- El fichero `public/CNAME` debe contener `www.gasoliprecios.com`.
- El ID de Google Analytics configurado para produccion es `G-CQ3MN53CLR`.
- Con dominio propio, Vite debe compilar con `base: '/'`, no con `/gasoliprecios/`.
- La etiqueta base de Google Analytics debe estar presente en `index.html` con Consent Mode denegado por defecto para que Google detecte la etiqueta y la app conceda analitica solo tras consentimiento.

## Supuestos actuales

- Los IDs de comunidad autonoma se mapean localmente a nombres de comunidades autonomas espanolas.
- La interpretacion de horarios cubre patrones comunes como `L-D: 24H`, `L-S: 08:00-22:00; D: 09:00-21:00` y rangos similares.
- Algunos horarios complejos o excepcionales pueden requerir mejoras futuras.
- La geolocalizacion depende de permisos del navegador y de contexto seguro en produccion.
- La API puede tener restricciones CORS; por eso se contempla cache y fallback local.
