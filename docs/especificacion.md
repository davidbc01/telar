# Especificación de Telar v0.4

> Este documento define qué es Telar, qué problema resuelve, cómo se ve el código
> y cuál es la hoja de ruta. Es el documento fundacional del proyecto.

---

## 1. Qué es Telar

Telar es un lenguaje de programación declarativo para la web. Está diseñado para que un desarrollador pueda describir lo que quiere construir usando frases estructuradas en español, sin tener que preocuparse por cómo se implementa por debajo.

El compilador de Telar traduce esas instrucciones a HTML, CSS y JavaScript optimizados. El desarrollador nunca toca esos archivos directamente.

> **La idea en una frase:** Escribes lo que quieres. Telar construye cómo hacerlo.

### El problema que resuelve

El desarrollo web moderno tiene un problema de complejidad acumulada. Para construir una aplicación simple hoy, un desarrollador necesita aprender JavaScript y sus peculiaridades históricas, elegir entre decenas de frameworks, configurar bundlers, gestionar dependencias, pensar en optimización, manejar errores asíncronos, y escribir CSS responsivo.

Todo eso es trabajo que no tiene nada que ver con el problema que el desarrollador quería resolver. Telar elimina esa carga.

### Lo que Telar no es

- No es un framework de JavaScript
- No es un generador de código por IA
- No es un lenguaje de propósito general
- No es un lenguaje visual o de bloques

---

## 2. Filosofía de diseño

### Principio 1 — Declarativo siempre

El desarrollador describe qué quiere, nunca cómo conseguirlo.

```telar
✓  mostrar productos recientes
     máximo 8
     ordenados por precio
```

### Principio 2 — El silencio no existe

Telar nunca falla en silencio. Los errores son claros, en español, y sugieren cómo arreglarlos.

```
✗  app.telar:12:9 — se esperaba un número

   10 │  mostrar productos recientes
   11 │    ordenados por precio
→  12 │    máximo muchos
                    ^^^^^
   13 │    si falla

  Sugerencia: los números van sin comillas. Prueba con: máximo 10
```

### Principio 3 — Defaults con opinión

Optimización móvil, caché, accesibilidad ARIA y lazy loading activados por defecto. Sin configuración.

### Principio 4 — Legibilidad humana

El código de Telar debe poder ser leído por alguien sin experiencia técnica.
Es una restricción de diseño, no un objetivo estético.

---

## 3. Sintaxis

Telar usa un dialecto estructurado del español. No es español completamente libre — es un conjunto finito y aprendible de patrones de frase.

### Reglas fundamentales

- La indentación es significativa (2 espacios)
- Los nombres propios van en mayúscula inicial
- Las cadenas de texto van entre comillas dobles
- Los números van sin comillas y sin unidades
- Los comentarios empiezan con `#`

### Estructura de un archivo Telar

```telar
# Declaración de aplicación
aplicación NombreApp
  idioma español

# Modelos de datos
datos Producto
  nombre: texto
  precio: número
  imagen: foto

# Páginas
página inicio en "/"
  título "Bienvenido"

  mostrar productos recientes
    máximo 8
    ordenados por precio

  si el usuario está conectado
    mostrar "Hola, (usuario.nombre)"
    botón "Mi cuenta" ir a cuenta
  si no
    botón "Entrar" ir a login

  caché 10 minutos
  optimizar para móvil
```

### Manejo de errores

```telar
mostrar productos recientes
  máximo 8
  si falla
    mostrar "No hay conexión. Intenta de nuevo."
    reintentar en 5 segundos
```

---

## 4. El compilador

El compilador toma un archivo `.telar` y produce un bundle listo para desplegar en tres fases:

**Lexer** — tokeniza el archivo reconociendo el español con tildes y ñ.

**Parser** — construye el árbol de sintaxis abstracta (AST) desde los tokens.

**Generador** — recorre el AST y produce HTML semántico, CSS responsivo y JavaScript optimizado.

### Qué genera automáticamente

- HTML semántico con atributos ARIA
- CSS mínimo y responsivo
- JavaScript con runtime de condiciones dinámicas y carga de datos
- Lazy loading automático
- Cache headers configurados

### Qué hace el JavaScript generado

- `mostrar Producto recientes` → llamada a `/api/producto?limit=8&sort=precio`
- `si el usuario está conectado` → lee el estado de sesión del localStorage
- `si falla` → muestra el mensaje de error y reintenta si se especifica
- `hacer acción` → POST a `/api/accion/nombre` con feedback visual

---

## 5. CLI

```bash
# Compilar a HTML + CSS + JS
telar compilar app.telar
telar compilar app.telar -o dist/

# Servir con live reload
telar servir app.telar

# Verificar sintaxis
telar verificar app.telar

# Gestionar paquetes
telar añadir formulario
telar quitar formulario
telar paquetes
telar buscar <término>
```

---

## 6. Gestor de paquetes

Los paquetes de Telar son repositorios de GitHub con el prefijo `telar-`.

```bash
telar añadir davidbc01/telar-formulario
# o con alias corto si es un paquete oficial:
telar añadir formulario
```

Los paquetes se instalan en la carpeta `paquetes/` y se registran en `telar.paquetes.json`.

---

## 7. Hoja de ruta

| Versión | Estado | Objetivo |
|---------|--------|----------|
| 0.1 | ✅ Completo | Lexer, parser, generador HTML |
| 0.2 | ✅ Completo | Generador JavaScript, CLI |
| 0.3 | ✅ Completo | Live reload, extensión VS Code, errores visuales |
| 0.4 | ✅ Completo | Gestor de paquetes |
| 0.5 | 🔄 En desarrollo | Sintaxis `usar`, paquetes oficiales, `telar nuevo` |
| 0.6 | 🟪 Pendiente | Tests completos, CI/CD |
| 0.7 | 🟪 Pendiente | Documentación web en telar.dev |
| 1.0 | 🟪 Pendiente | Lanzamiento público |

---

## 8. Comparativa

| | React | Svelte | Elm | Telar |
|---|---|---|---|---|
| Sintaxis | JSX + JS | HTML+JS | Haskell-like | Español natural |
| Curva aprendizaje | Alta | Media | Muy alta | Baja |
| Config inicial | Alta | Media | Media | Ninguna |
| Errores claros | No | Parcial | Sí | Sí |
| Optimización auto | No | Parcial | Parcial | Sí |
| Gestor de paquetes | npm | npm | elm-package | telar añadir |

---

*Especificación v0.4 — Marzo 2026*
