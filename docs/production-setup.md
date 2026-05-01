# Puesta en producción

Esta guía cubre los dos últimos pasos antes de publicar GASOLIPRECIOS como web real:

- Crear y conectar Google Analytics.
- Asociar un dominio propio a GitHub Pages.

## Google Analytics 4

1. Entra en [Google Analytics](https://analytics.google.com/).
2. Crea una cuenta o utiliza una existente.
3. Crea una propiedad para `GASOLIPRECIOS`.
4. Selecciona plataforma `Web`.
5. Indica la URL final de producción:

```text
https://troylin1987.github.io/gasoliprecios/
```

Si ya tienes dominio propio, usa el dominio final en lugar de la URL de GitHub Pages.

6. Copia el `Measurement ID`, con formato similar a:

```text
G-XXXXXXXXXX
```

7. En GitHub, entra en:

```text
Settings > Secrets and variables > Actions > New repository secret
```

8. Crea el secret:

```text
Name: VITE_GA_MEASUREMENT_ID
Value: G-XXXXXXXXXX
```

9. Ejecuta de nuevo el workflow `Deploy to GitHub Pages`.

La aplicación sólo cargará Google Analytics cuando el usuario acepte el aviso de analítica.

## Dominio propio en GitHub Pages

1. Decide el dominio final, por ejemplo:

```text
gasoliprecios.com
www.gasoliprecios.com
```

2. En GitHub, entra en:

```text
Settings > Pages > Custom domain
```

3. Escribe el dominio final y guarda.

4. Activa `Enforce HTTPS` cuando GitHub permita hacerlo.

5. Configura DNS en el proveedor del dominio.

Para un subdominio tipo `www`:

```text
Type: CNAME
Name: www
Value: troylin1987.github.io
```

Para un dominio raíz tipo `gasoliprecios.com`, GitHub Pages suele requerir registros `A` hacia las IPs de GitHub Pages y, opcionalmente, registros `AAAA` para IPv6. Consulta siempre la documentación actual de GitHub antes de tocar DNS.

## Fichero CNAME

Cuando el dominio final esté decidido, añade un fichero:

```text
public/CNAME
```

Con una sola línea:

```text
www.tudominio.com
```

No se ha añadido todavía porque el dominio final no está definido. Publicar un `CNAME` incorrecto puede romper el despliegue de Pages.

## Checklist final

- Pages configurado con `GitHub Actions`.
- Workflow ejecutado correctamente.
- Secret `VITE_GA_MEASUREMENT_ID` creado si se quiere Analytics.
- Dominio configurado en `Settings > Pages`.
- DNS propagado.
- HTTPS activado.
- Visita real comprobada desde incógnito o móvil.
