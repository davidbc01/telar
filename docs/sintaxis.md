# Referencia de sintaxis de Telar

Guía de referencia rápida. Para la explicación completa, ver la [especificación](./especificacion.md).

---

## Estructura básica

```telar
aplicación NombreApp
  idioma español
```

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
componente NombreComponente
  mostrar item.propiedad
```

Se usan pasando un solo argumento con `con` — sin paréntesis ni parámetros posicionales. Dentro del componente, `item` referencia el argumento pasado:

```telar
página inicio en "/"
  NombreComponente con producto
```

Un componente también sirve como plantilla de una lista real completa, con `mostrar ... con`:

```telar
mostrar Producto recientes
  máximo 8
  con TarjetaProducto
```

A diferencia del uso anterior (`NombreComponente con producto`, donde `item.propiedad` es texto fijo sustituido en tiempo de compilación), aquí `item.propiedad` se convierte en una interpolación real: por cada producto que llegue de `/api/producto`, la plantilla se rellena con sus datos reales, uno por uno. Sin `con`, `mostrar Modelo recientes` sigue funcionando como antes — muestra todos los campos de cada elemento sin control de diseño.

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

A nivel de aplicación, en `app.telar`:

```telar
aplicación MiApp
  tema oscuro
```

- Sin declarar `tema`, Telar sigue el sistema operativo del visitante (comportamiento igual que antes de v0.12)
- `tema oscuro` fija el tema oscuro para toda la web, sin importar el sistema operativo
- `tema claro` fija el tema claro de la misma forma

Botón opcional para que el usuario lo cambie en vivo:

```telar
botón "Cambiar tema" alterna tema
```

Alterna entre oscuro y claro en el navegador y lo recuerda entre visitas con `localStorage` — no llama a ninguna API. Se puede combinar con cualquiera de los dos temas fijos: el botón sobreescribe el valor inicial, y la próxima visita respeta lo último elegido.

Pendiente para una versión futura: colores de tema totalmente personalizados, más allá de los presets oscuro/claro.

---

## SEO y metadatos

A nivel de aplicación, en `app.telar`:

```telar
aplicación MiTienda
  dominio "https://mitienda.com"
```

Declarar `dominio` habilita `og:url` con la URL absoluta de cada página, y genera dos archivos nuevos en la raíz del proyecto compilado: `sitemap.xml` y `robots.txt`. Sin `dominio`, esos dos archivos no se generan (un sitemap sin URLs absolutas no es válido), pero el resto de metadatos sí.

`og:title`, `og:description`, `twitter:card`, `twitter:title` y `twitter:description` se generan automáticamente en cada página a partir de `título` y `descripción` — sin nada que declarar.

Imagen, a nivel de página:

```telar
página inicio en "/"
  imagen "https://mitienda.com/img/foto.jpg"
```

`imagen "url"` se renderiza como un `<img>` normal en la página (con el título de la página como texto alternativo). Si es la primera imagen declarada en esa página, además se usa como `og:image` y `twitter:image`, y el `twitter:card` pasa de `summary` a `summary_large_image` automáticamente.

El `sitemap.xml` incluye todas las páginas estáticas. Las rutas dinámicas (`/producto/(id)`) se excluyen automáticamente, porque no representan una URL real sino una plantilla.

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
  idioma español

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
