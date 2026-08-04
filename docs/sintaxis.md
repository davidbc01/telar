# Referencia de sintaxis de Telar

Guía de referencia rápida. Para la explicación completa, ver la [especificación](./especificacion.md).

---

## Estructura de un proyecto

```
mi-proyecto/
  telar.config.json   — idioma, dominio, tema, favicon, meta: configuración del sitio
  src/
    app.telar          — aplicación, diseños, componentes, colecciones, incluir
    paginas/
      inicio.telar      — una página por archivo
    contenido/
      articulos/*.md     — si usas colecciones
  public/
    estilos.css          — editable; también favicon.ico, imágenes, etc. se copian tal cual
```

`app.telar` es solo código: páginas, diseños, componentes, colecciones. La configuración del sitio (todo lo que en otros frameworks iría en un archivo de config) vive aparte, en `telar.config.json`.

## Estructura básica

```telar
aplicación NombreApp

incluir paginas/inicio
```

---

## Configuración del sitio (telar.config.json)

En la raíz del proyecto, junto a `src/` y `public/`:

```json
{
  "idioma": "español",
  "dominio": "https://mitienda.com",
  "tema": "oscuro",
  "favicon": "https://mitienda.com/favicon.ico",
  "meta": {
    "theme-color": "#0B0B0D",
    "apple-mobile-web-app-title": "MiTienda"
  }
}
```

Todos los campos son opcionales:

- **`idioma`** — controla el atributo `lang` del HTML (`"español"` → `lang="es"`, `"inglés"` → `lang="en"`, etc.). Por defecto, `"español"`.
- **`dominio`** — habilita `og:url` con la URL absoluta de cada página, y genera `sitemap.xml` y `robots.txt`. Sin `dominio`, esos dos archivos no se generan.
- **`tema`** — `"oscuro"` o `"claro"` fija el tema para toda la web. Sin declarar, Telar sigue el sistema operativo del visitante.
- **`favicon`** — URL del icono de pestaña. Si no se declara y existe `public/favicon.ico`, se usa automáticamente sin tener que escribir nada.
- **`meta`** — objeto `"nombre": "valor"`, uno por cada `<meta>` personalizada que necesites — tantas como haga falta.

Si `dominio`/`tema`/`favicon`/`meta`/`idioma` aparecen dentro de un archivo `.telar`, Telar avisa al compilar: ya no van ahí.

---

## Modelos de datos

```telar
datos NombreModelo
  campo: tipo
```

**Tipos disponibles:**

| Tipo | Descripción |
|------|-------------|
| `texto` | Cadena de caracteres |
| `número` | Entero o decimal |
| `fecha` | Fecha y hora |
| `foto` | Imagen |
| `verdad` | Booleano (verdadero / falso) |
| `lista` | Lista de otro tipo |

---

## Páginas

```telar
página NombrePagina en "/ruta"
  título "Texto del título"
  descripción "Meta descripción"
```

---

## Paquetes

```telar
# Instalar desde terminal
telar añadir navbar

# Usar en el código
página inicio en "/"
  usar navbar
  título "Mi App"
```

**Paquetes oficiales:**
- `telar añadir formulario` — formulario de contacto
- `telar añadir navbar` — barra de navegación
- `telar añadir lista` — lista de elementos

---

## Mostrar datos

```telar
mostrar NombreModelo
mostrar NombreModelo recientes
mostrar NombreModelo recientes
  máximo 10
  ordenados por campo
  donde campo = "valor"
```

---

## Condicionales

```telar
si condición
  ...
si no
  ...
```

**Condiciones disponibles:**
- `si el usuario está conectado`
- `si el usuario es administrador`
- `si hay resultados`
- `si campo = "valor"`
- `si campo > número`

---

## Campos de formulario

```telar
campo "Etiqueta" texto
campo "Etiqueta" email
campo "Etiqueta" contraseña
campo "Etiqueta" área de texto
```

Con validación (v0.10):

```telar
campo "Email" email requerido
campo "Contraseña" contraseña requerido mínimo 8
campo "Nombre" texto máximo 50 caracteres
```

`requerido`, `mínimo N` y `máximo N` se pueden combinar en el mismo campo, en cualquier orden, y generan los atributos HTML5 nativos (`required`, `minlength`, `maxlength`). La palabra `caracteres` tras el número es opcional — solo estilística. Cada campo genera automáticamente un contenedor de mensaje de error, visible cuando el campo no es válido.

Un botón con una acción (`botón "Enviar" enviar`) valida todos los campos de la página antes de enviar la petición — si alguno falla, no se llega a hacer la llamada. Si todo es válido, se envían los valores reales del formulario como JSON a `/api/accion/<nombre>`.

---

## Botones y navegación

```telar
botón "Texto" ir a NombrePagina
botón "Texto" ir a "https://ejemplo.com"
botón "Texto" acción
```

---

## Diseños

```telar
diseño NombreDiseno
  navbar
    título "Mi App"
  pie
    descripción "..."
```

El contenido de cada página se inyecta automáticamente al final del diseño. Si hay un diseño declarado en la aplicación, se aplica por defecto a todas las páginas. Una página puede sobreescribirlo declarándolo explícitamente:

```telar
página contacto en "/contacto"
  diseño NombreDiseno
  título "Contacto"
```

---

## Componentes

```telar
componente NombreComponente con param1 y param2
  mostrar param1.propiedad
  si param2
    título "Condicional"
```

Los parámetros se declaran con `con`, separados por `y` — tantos como haga falta. Al usarlo, pasas un argumento por cada parámetro declarado, en el mismo orden, también separados por `y`:

```telar
página inicio en "/"
  NombreComponente con producto y destacado
```

### Contenido pasado desde fuera (slots)

Un componente puede recibir contenido extra como un bloque indentado bajo su uso, insertado donde esté el marcador `contenido`:

```telar
componente Tarjeta con producto
  título producto.nombre
  contenido

página inicio en "/"
  Tarjeta con producto
    descripción "Esto se inserta donde está 'contenido'"
```

Sin marcador `contenido` explícito en el componente, lo que se pase se inserta al final (mismo criterio que usa `diseño` con el contenido de una página).

### `si <parámetro>` — condición sobre un parámetro

```telar
componente Tarjeta con producto y destacado
  si destacado
    título "⭐ Destacado"
```

**Importante:** esto solo se evalúa con datos reales cuando el componente se usa como plantilla de una lista (ver más abajo) — ahí se genera un ternario JavaScript real (`${destacado ? '...' : ''}`) evaluado con el valor de cada elemento. Si el componente se usa suelto (`Tarjeta con producto y destacado`), no hay datos reales detrás — ese camino sigue siendo sustitución de texto en tiempo de compilación, así que el bloque `si <parámetro>` se renderiza siempre, sin condición real.

### Como plantilla de una lista real

Un componente de **un solo parámetro** sirve como plantilla de `mostrar Modelo`, para que cada elemento se vea con tu diseño en vez del genérico "campo: valor":

```telar
componente TarjetaProducto con producto
  mostrar producto.nombre
  mostrar producto.precio

página inicio en "/"
  mostrar Producto recientes
    máximo 8
    con TarjetaProducto
```

A diferencia del uso suelto (`TarjetaProducto con producto`, donde `producto.nombre` es texto fijo sustituido en compilación), aquí se convierte en una interpolación real: por cada producto que llegue de `/api/producto`, la plantilla se rellena con sus datos reales, uno por uno. Sin `con`, `mostrar Modelo recientes` sigue funcionando como antes — muestra todos los campos de cada elemento sin control de diseño. Solo componentes de un único parámetro pueden usarse así — con más de uno, Telar avisa al compilar.

---

## Rutas dinámicas

Un segmento entre paréntesis en la ruta se convierte en parámetro:

```telar
página detalle en "/producto/(id)"
  mostrar Producto donde id = parametro.id
```

`parametro.<nombre>` referencia el valor real de la URL en tiempo de ejecución. Se puede usar dentro de un modificador `donde`, junto al ya existente valor literal:

```telar
mostrar Producto donde categoria = "ropa"     # valor fijo
mostrar Producto donde id = parametro.id      # valor de la URL
```

`telar servir` resuelve estas rutas en tiempo real: una sola página compilada (`producto-id.html`) atiende cualquier `/producto/<lo-que-sea>`. Requiere que tu API en `/api/<modelo>` soporte el filtro correspondiente como query param.

---

## Variables y estado local

```telar
variable cuenta = 0
texto cuenta
```

`variable` declara estado local a la página, con un valor numérico inicial. `texto <nombre>` lo muestra en pantalla y se actualiza sola cuando el valor cambia — no hace falta recargar nada.

Acciones incorporadas para modificar una variable, sin llamar a ninguna API:

```telar
botón "Sumar" suma cuenta
botón "Restar" resta cuenta
```

Cada clic suma o resta 1 a la variable y refresca en pantalla todos los `texto` que la muestren. Esto es distinto de un botón con una acción normal (`botón "Guardar" guardar`), que sí hace una petición POST a `/api/accion/<accion>`.

Pendiente para una versión futura: variables compartidas a nivel de aplicación (no solo por página), y asignar cualquier valor a una variable (no solo sumar/restar 1).

---

## Temas visuales

El tema fijo (`"tema": "oscuro"` / `"claro"`) se declara en `telar.config.json` — ver [Configuración del sitio](#configuración-del-sitio-telarconfigjson). Sin declarar nada, Telar sigue el sistema operativo del visitante.

Botón opcional para que el usuario lo cambie en vivo:

```telar
botón "Cambiar tema" alterna tema
```

Alterna entre oscuro y claro en el navegador y lo recuerda entre visitas con `localStorage` — no llama a ninguna API. Se puede combinar con un tema fijo en la config: el botón sobreescribe el valor inicial, y la próxima visita respeta lo último elegido.

Pendiente para una versión futura: colores de tema totalmente personalizados, más allá de los presets oscuro/claro.

---

## Colecciones de contenido (Markdown)

```telar
colección Articulos en "src/contenido/articulos"
```

Declara una colección respaldada por una carpeta de archivos `.md`, **relativa a la raíz del proyecto** (donde está `telar.config.json`, no donde está `app.telar`). Cada archivo se convierte en un elemento de la colección; el nombre del archivo (sin `.md`) es su `slug`.

Cada archivo `.md` lleva una cabecera YAML simple entre `---`, seguida del contenido:

```markdown
---
título: Mi primer artículo
fecha: 2026-08-01
autor: David
---

Contenido en Markdown normal.
```

La cabecera admite pares `clave: valor` de una sola línea — sin listas ni objetos anidados. `título` (o `titulo`, sin tilde) se usa automáticamente como `<title>` de la página y como `og:title`/`twitter:title`; `descripción`/`descripcion`/`resumen` para la meta descripción, si existen.

El Markdown soportado cubre lo habitual en un artículo: encabezados (`#`, `##`, `###`), párrafos, negrita (`**texto**`), cursiva (`*texto*`), código en línea (`` `código` ``), bloques de código (` ``` `), listas (`- item`), citas (`> texto`) y enlaces (`[texto](url)`). No cubre tablas ni Markdown anidado complejo.

### Listar

```telar
página blog en "/blog"
  listar Articulos
    ordenados por fecha
    máximo 5
```

Genera la lista completa en tiempo de compilación (no en el navegador), enlazando a la URL real de cada artículo. Admite los mismos modificadores `ordenados por` y `máximo` que `mostrar`.

### Artículo

```telar
página detalle en "/blog/(slug)"
  artículo Articulos
```

**Diferencia clave con las rutas dinámicas normales:** `/producto/(id)` genera un único HTML compartido que resuelve el `id` en el navegador con JS, porque los datos vienen de una API en tiempo de ejecución. Una colección de Markdown ya existe en disco al compilar, así que Telar genera **un HTML real y distinto por cada artículo**, con el contenido ya dentro — mejor para SEO, más rápido, sin depender de JS.

Por esto mismo, `artículo` exige que la página tenga un segmento dinámico en la ruta (`(slug)` o el nombre que prefieras) — sin eso, todos los artículos generarían el mismo nombre de archivo y se pisarían entre sí. Telar lo detecta y avisa al compilar.

El `sitemap.xml` (si hay `dominio` declarado) incluye la URL real de cada artículo automáticamente.

---

## SEO y metadatos

`dominio` se declara en `telar.config.json` (ver [Configuración del sitio](#configuración-del-sitio-telarconfigjson)) — habilita `og:url` con la URL absoluta de cada página, y genera `sitemap.xml`/`robots.txt`. Sin `dominio`, esos dos archivos no se generan (un sitemap sin URLs absolutas no es válido), pero el resto de metadatos sí.

`og:title`, `og:description`, `twitter:card`, `twitter:title` y `twitter:description` se generan automáticamente en cada página a partir de `título` y `descripción` — sin nada que declarar.

Imagen, a nivel de página:

```telar
página inicio en "/"
  imagen "https://mitienda.com/img/foto.jpg"
```

`imagen "url"` se renderiza como un `<img>` normal en la página (con el título de la página como texto alternativo). Si es la primera imagen declarada en esa página, además se usa como `og:image` y `twitter:image`, y el `twitter:card` pasa de `summary` a `summary_large_image` automáticamente.

El `sitemap.xml` incluye todas las páginas estáticas, más la URL real de cada artículo de una colección. Las rutas dinámicas normales (`/producto/(id)`) se excluyen automáticamente, porque no representan una URL real sino una plantilla.

`favicon` y `meta` también van en `telar.config.json` — ver la sección de configuración más arriba.

---

## Manejo de errores

```telar
mostrar algo
  si falla
    mostrar "Mensaje de error"
    reintentar en N segundos
```

```telar
botón "Enviar" enviarFormulario
  si falla
    mostrar "No se pudo enviar"
  si funciona
    mostrar "Enviado correctamente"
```

---

## Bloque de código directo

Para JavaScript específico que Telar no cubre:

```telar
código
  console.log('Hola desde JavaScript')
  document.title = 'Mi página'
fin código
```

---

## Optimización

```telar
optimizar para móvil
caché N minutos
caché N horas
```

---

## Comentarios

```telar
# Esto es un comentario
```

---

## Ejemplo completo

```telar
aplicación MiTienda

datos Producto
  nombre: texto
  precio: número
  imagen: foto

página inicio en "/"
  usar navbar
  título "Bienvenido a MiTienda"
  descripción "Los mejores productos"

  mostrar Producto recientes
    máximo 8
    ordenados por precio
    si falla
      mostrar "No se pudieron cargar los productos"
      reintentar en 10 segundos

  si el usuario está conectado
    botón "Mi cuenta" ir a cuenta
  si no
    botón "Entrar" ir a login

  optimizar para móvil
  caché 5 minutos
```

---

*Esta referencia se actualiza con cada versión del lenguaje.*
