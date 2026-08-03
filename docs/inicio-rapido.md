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

Esto genera una estructura de carpetas con un proyecto de ejemplo ya navegable — no partes de cero.

---

## 3. Verlo en el navegador

```bash
telar servir app.telar
```

Abre [http://localhost:3000](http://localhost:3000). Cualquier cambio que guardes en un archivo `.telar` recarga la página sola — no hace falta que reinicies nada.

---

## 4. Tu primera página, línea a línea

Abre `app.telar` y mira algo parecido a esto:

```telar
aplicación MiWeb
  idioma español

página inicio en "/"
  título "Hola, mundo"
  descripción "Mi primera web con Telar"
```

- `aplicación MiWeb` — el nombre de tu proyecto. Una sola vez, arriba del todo.
- `página inicio en "/"` — declara una página y la ruta donde vive. `inicio` es el nombre interno; `"/"` es la URL.
- `título` y `descripción` — se convierten en un `<h1>` y una etiqueta `<meta description>`, listos para buscadores.

Prueba a cambiar el texto y guarda el archivo. La página en el navegador se actualiza sola.

---

## 5. Añade algo interactivo

Sin tocar HTML, CSS ni JavaScript:

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
telar compilar app.telar
```

Esto genera una carpeta `dist/` con HTML, CSS y JS estáticos — sin dependencias, sin build adicional. Puedes subir esa carpeta tal cual a cualquier hosting de archivos estáticos.

---

## Siguientes pasos

- **[Referencia completa de sintaxis](./sintaxis.md)** — todo lo que Telar sabe hacer, con ejemplos
- **`examples/blog/`** y **`examples/tienda/`** en este mismo repo — dos proyectos completos, comentados, que compilan tal cual
- Si algo no compila, `telar verificar app.telar` te dice exactamente qué línea y qué se esperaba en su lugar

¿Dudas o encontraste un bug? Abre un issue en el repo — es exactamente para eso.
