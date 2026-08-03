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
  filtrados por campo = "valor"
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
campo "Etiqueta" tipo texto
campo "Etiqueta" tipo email
campo "Etiqueta" tipo contraseña
campo "Etiqueta" tipo área de texto
```

Con validación (v0.10):

```telar
campo "Email" tipo email requerido
campo "Contraseña" tipo contraseña requerido mínimo 8
campo "Nombre" tipo texto máximo 50 caracteres
```

`requerido`, `mínimo N` y `máximo N` se pueden combinar en el mismo campo, en cualquier orden, y generan los atributos HTML5 nativos (`required`, `minlength`, `maxlength`). La palabra `caracteres` tras el número es opcional — solo estilística. Cada campo genera automáticamente un contenedor de mensaje de error, visible cuando el campo no es válido.

Un botón `hacer` valida todos los campos de la página antes de enviar la petición — si alguno falla, no se llega a hacer la llamada. Si todo es válido, se envían los valores reales del formulario como JSON a `/api/accion/<nombre>`.

---

## Botones y navegación

```telar
botón "Texto" ir a NombrePagina
botón "Texto" ir a "https://ejemplo.com"
botón "Texto" hacer acción
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

---

## Rutas dinámicas

Un segmento entre paréntesis en la ruta se convierte en parámetro:

```telar
página detalle en "/producto/(id)"
  mostrar Producto filtrados por id = parametro.id
```

`parametro.<nombre>` referencia el valor real de la URL en tiempo de ejecución. Se puede usar dentro de un modificador `filtrados por`, junto al ya existente valor literal:

```telar
mostrar Producto filtrados por categoria = "ropa"     # valor fijo
mostrar Producto filtrados por id = parametro.id      # valor de la URL
```

`telar servir` resuelve estas rutas en tiempo real: una sola página compilada (`producto-id.html`) atiende cualquier `/producto/<lo-que-sea>`. Requiere que tu API en `/api/<modelo>` soporte el filtro correspondiente como query param.

---

## Manejo de errores

```telar
mostrar algo
  si falla
    mostrar "Mensaje de error"
    reintentar en N segundos
```

```telar
botón "Enviar" hacer enviarFormulario
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
