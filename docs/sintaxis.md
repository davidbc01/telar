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

## Botones y navegación

```telar
botón "Texto" ir a NombrePagina
botón "Texto" ir a "https://ejemplo.com"
botón "Texto" hacer acción
```

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

## Optimización

```telar
optimizar para móvil
caché N minutos
caché N horas
```

---

## Paquetes

```telar
# Instalar desde terminal
telar añadir formulario

# Próximamente en el código:
usar formulario
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
