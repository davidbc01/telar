# Referencia de sintaxis de Telar

Guía de referencia rápida. Para la explicación completa, ver la [especificación](./especificacion.md).

---

## Estructura básica

```telar
aplicación NombreApp
  idioma español
```

## Modelos de datos

```telar
datos NombreModelo
  campo: tipo
```

**Tipos disponibles**

| Tipo | Descripción |
| ---- | ----------- |
| `texto` | Cadena de caracteres |
| `número` | Entero o decimal |
| `fecha` | Fecha y hora |
| `foto` | Imagen |
| `verdad` | Booleano (verdadero / falso) |

## Página

```telar
página NombrePágina en "/ruta"
  título "Texto del título"
  descripción "Meta descripción"
```

## Mostrar datos

```telar
mostrar NombreModelo
mostrar NombreModelo recientes
mostrar NombreModelo recientes
  máximo 10
  ordenados por campo
  filtrados por campo = "valor"
```

## Condicionales

```telar
si condición
  ···
si no
  ···
```

**Condiciones disponibles:**
- `si el usuario está conectado`
- `si el usuario no es administrador`
- `si hay resultados`
- `si campo = "valor"`

## Botones y navegación

```telar
botón "Texto" ir a NombrePagina
botón "Texto" ir a "https://ejemplo.com"
botón "Texto" hacer acción
```

## Manejo de errores

```telar
mostrar algo
  si falla
  mostrar "Mensaje de error"
  reintentar en N segundos
```

## Optimización

```telar
optimizar para móvil
caché N minutos
caché N horas
```

## Comentarios

```telar
# Esto es un comentario
```

---

*Esta referencia se actualiza con cada versión del lenguaje.*
