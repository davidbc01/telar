# Guía de inicio rápido

En 5 minutos vas a tener una página web real, escrita en español, corriendo en tu navegador.

---

## 1. Instalar Telar

Necesitas [Node.js](https://nodejs.org) 18 o superior.

```bash
npm install -g @davidbc01/telar
```

Comprueba que se instaló bien:

```bash
telar --version
```

---

## 2. Crear tu primer proyecto

```bash
telar nuevo mi-primera-web
cd mi-primera-web
```

Esto genera una estructura completa, lista para trabajar — nada que crear tú a mano:

```
mi-primera-web/
  telar.config.json   — idioma, dominio, tema... configuración del sitio
  src/
    app.telar          — tu aplicación: páginas, diseños, componentes
    paginas/
      inicio.telar
      sobre-nosotros.telar
  public/
    estilos.css        — editable; aquí también van favicon, imágenes, etc.
```

---

## 3. Verlo en el navegador

```bash
telar servir src/app.telar
```

Abre [http://localhost:3000](http://localhost:3000). Cualquier cambio que guardes en un archivo `.telar`, `.md` o en `telar.config.json` recarga la página sola — no hace falta que reinicies nada.

---

## 4. Tu primera página, línea a línea

Abre `src/app.telar` y mira algo parecido a esto:

```telar
aplicación MiWeb

incluir paginas/inicio
```

Y `src/paginas/inicio.telar`:

```telar
página inicio en "/"
  título "Hola, mundo"
  descripción "Mi primera web con Telar"
```

- `aplicación MiWeb` — el nombre de tu proyecto. Una sola vez, arriba del todo, en `src/app.telar`.
- `incluir paginas/inicio` — cada página vive en su propio archivo dentro de `src/paginas/`.
- `página inicio en "/"` — declara una página y la ruta donde vive. `inicio` es el nombre interno; `"/"` es la URL.
- `título` y `descripción` — se convierten en un `<h1>` y una etiqueta `<meta description>`, listos para buscadores.

Prueba a cambiar el texto y guarda el archivo. La página en el navegador se actualiza sola.

El idioma, el dominio, el tema visual, el favicon y las meta tags personalizadas no van en ningún archivo `.telar` — son configuración del sitio, y viven en `telar.config.json`, en la raíz del proyecto:

```json
{
  "idioma": "español",
  "dominio": "https://miweb.com",
  "tema": "oscuro"
}
```

---

## 5. Añade algo interactivo

Sin tocar HTML, CSS ni JavaScript — en `src/paginas/inicio.telar`:

```telar
página inicio en "/"
  título "Contador"

  variable cuenta = 0
  texto cuenta

  botón "Sumar" suma cuenta
  botón "Restar" resta cuenta
```

Guarda, recarga, y haz clic en los botones. Eso ya es una web con estado real, funcionando en el navegador.

---

## 6. Compilar para producción

Cuando quieras subir tu web a algún sitio (Vercel, Netlify, tu propio servidor):

```bash
telar compilar src/app.telar
```

Esto genera una carpeta `dist/` con HTML, CSS y JS estáticos — sin dependencias, sin build adicional. Todo lo que haya en `public/` (favicon, imágenes, lo que sea) se copia tal cual. Puedes subir esa carpeta tal cual a cualquier hosting de archivos estáticos.

---

## Siguientes pasos

- **[Referencia completa de sintaxis](./sintaxis.md)** — todo lo que Telar sabe hacer, con ejemplos
- **`examples/blog/`** y **`examples/tienda/`** en este mismo repo — dos proyectos completos, comentados, que compilan tal cual
- Si algo no compila, `telar verificar src/app.telar` te dice exactamente qué línea y qué se esperaba en su lugar

¿Dudas o encontraste un bug? Abre un issue en el repo — es exactamente para eso.
