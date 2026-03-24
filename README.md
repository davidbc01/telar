# Telar 🧵

**Un lenguaje de programación declarativo para la web, escrito en español.**

```telar
aplicación MiTienda
  idioma español

incluir modelos/Producto
incluir paginas/inicio
incluir paginas/detalle

página inicio en "/"
  título "Bienvenido" clase "hero"
  descripción "Los mejores productos al mejor precio"

  mostrar Producto recientes
    máximo 8
    ordenados por precio
    si falla
      mostrar "Sin conexión"
      reintentar en 5 segundos

  si el usuario está conectado
    botón "Mi cuenta" ir a cuenta
  si no
    botón "Entrar" clase "btn-primario" ir a login

  optimizar para móvil
  caché 10 minutos
```

*Eso es todo. Sin webpack. Sin JSX. Sin configuración.*

---

## Instalación

```bash
npm install -g @davidbc01/telar
```

O clona el repositorio para desarrollar:

```bash
git clone https://github.com/davidbc01/telar
cd telar
npm install
npx ts-node src/cli.ts nuevo mi-proyecto
```

---

## Uso

```bash
# Crear un proyecto nuevo
telar nuevo mi-proyecto

# Verificar la sintaxis
telar verificar app.telar

# Compilar a HTML + CSS + JS
telar compilar app.telar
telar compilar app.telar -o dist/

# Servir en el navegador con live reload
telar servir app.telar

# Gestionar paquetes
telar añadir formulario
telar quitar formulario
telar paquetes
telar buscar <término>
```

---

## Estructura de un proyecto

```
mi-proyecto/
  app.telar              → punto de entrada
  paginas/               → una página por archivo
    inicio.telar
    sobre-nosotros.telar
  modelos/               → modelos de datos
    Producto.telar
  componentes/           → componentes reutilizables
  estilos.css            → estilos personalizables
  telar.paquetes.json
```

`app.telar` orquesta el proyecto con `incluir`:

```telar
aplicación MiProyecto
  idioma español
  estilos "https://cdn.tailwindcss.com"   # opcional

incluir modelos/Producto
incluir paginas/inicio
incluir paginas/detalle
```

---

## Estilos

Telar genera un `estilos.css` editable en la raíz del proyecto. Puedes cambiarlo libremente o usar Tailwind:

```telar
# CSS propio — edita estilos.css
título "Hola" clase "hero"
botón "Entrar" clase "btn-grande" ir a login

# Con Tailwind
aplicación MiApp
  estilos "https://cdn.tailwindcss.com"

botón "Entrar" clase "bg-indigo-600 text-white px-6 py-3 rounded-xl" ir a login
```

---

## El problema

El desarrollo web moderno tiene un problema de complejidad acumulada. Para construir una aplicación simple hoy, un desarrollador necesita:

- Aprender JavaScript y sus peculiaridades históricas
- Elegir entre decenas de frameworks
- Configurar bundlers y herramientas de build
- Gestionar dependencias
- Pensar en optimización de rendimiento
- Manejar errores asíncronos
- Escribir CSS responsivo

Todo eso es trabajo que no tiene nada que ver con el problema que el desarrollador quería resolver.

## La hipótesis de Telar

Un lenguaje donde describes la **intención**, y el compilador toma todas las decisiones técnicas.

Telar compila a HTML + CSS + JavaScript optimizados. El desarrollador nunca toca esos archivos. El lenguaje tiene opiniones fuertes y defaults inteligentes: responsive, accesible y optimizado por defecto.

---

## Filosofía

**Declarativo siempre** — Describes qué quieres, no cómo conseguirlo.

**El silencio no existe** — Telar nunca falla silenciosamente. Los errores son claros, en español, y sugieren cómo arreglarlos.

```
✗  app.telar:12:9 — se esperaba un número

   10 │  mostrar productos recientes
   11 │    ordenados por precio
→  12 │    máximo muchos
                    ^^^^^
   13 │    si falla

  Sugerencia: los números van sin comillas. Prueba con: máximo 10
```

**Defaults con opinión** — Optimización móvil, caché, accesibilidad ARIA y lazy loading activados por defecto. Sin configuración.

**Legibilidad humana** — El código de Telar puede ser leído por alguien sin experiencia técnica. No es un objetivo estético: es una restricción de diseño.

---

## Estado actual

🟢 **En desarrollo activo**

| Fase | Estado |
|------|--------|
| Especificación del lenguaje | ✅ Completa (v0.1) |
| Lexer — tokenización | ✅ Completo |
| Parser — validador de sintaxis | ✅ Completo |
| Generación de HTML + CSS | ✅ Completo |
| Generación de JavaScript | ✅ Completo |
| CLI — compilar, servir, verificar, nuevo | ✅ Completo |
| Publicado en npm | ✅ Completo |
| Live reload en telar servir | ✅ Completo |
| Extensión VS Code | ✅ Completo |
| Mensajes de error con contexto visual | ✅ Completo |
| Gestor de paquetes | ✅ Completo |
| Sintaxis `usar` y bloque `código` | ✅ Completo |
| Tests completos (94) + CI/CD | ✅ Completo |
| Proyectos multi-archivo con `incluir` | ✅ Completo |
| Estilos personalizables + Tailwind | ✅ Completo |
| Palabra clave `clase` en elementos | ✅ Completo |
| Layouts y componentes reutilizables | 🟪 Pendiente |
| Rutas dinámicas con parámetros | 🟪 Pendiente |
| Formularios con validación | 🟪 Pendiente |
| Variables y estado local | 🟪 Pendiente |
| Temas visuales | 🟪 Pendiente |
| SEO y metadatos automáticos | 🟪 Pendiente |
| Documentación web | 🟪 Pendiente |
| Lanzamiento público | 🟪 Pendiente |

---

## Hoja de ruta

### v0.1 — Prueba de concepto ✅
- Lexer, parser y generador básico
- Mensajes de error en español
- CLI con `compilar`, `servir` y `verificar`

### v0.2 — Compilador funcional ✅
- Generación de JavaScript
- CLI instalable vía npm
- Condiciones dinámicas y cargadores de datos

### v0.3 — Experiencia de desarrollo ✅
- Live reload en `telar servir`
- Extensión para VS Code
- Mensajes de error con contexto visual

### v0.4 — Gestor de paquetes ✅
- Comandos `añadir`, `quitar`, `buscar` y `paquetes`
- Paquetes como repositorios de GitHub con prefijo `telar-`

### v0.5 — Sintaxis `usar` y paquetes oficiales ✅
- Palabra clave `usar` en el lenguaje
- Bloque `código` para JavaScript directo
- Comando `telar nuevo`

### v0.6 — Tests y robustez ✅
- 94 tests automatizados
- CI/CD con GitHub Actions

### v0.7 — Multi-archivo y estilos ✅
- Directiva `incluir` para proyectos multi-archivo
- Estilos personalizables con `estilos.css`
- Soporte para Tailwind y CSS externo con `estilos "url"`
- Palabra clave `clase` en títulos, botones, campos y más
- `telar nuevo` genera estructura completa con páginas reales
- Live reload en todos los archivos `.telar` y `.css`
- CSS base mejorado con Inter, modo oscuro y variables

### v0.8 — Layouts y componentes
- Sintaxis `layout` para estructuras compartidas entre páginas
- Sintaxis `componente` para elementos reutilizables
- Paso de datos entre componentes

### v0.9 — Rutas dinámicas
- Parámetros en URLs: `página detalle en "/producto/(id)"`
- Acceso al parámetro dentro de la página
- Redirecciones declarativas

### v0.10 — Formularios con validación
- `campo requerido`, `campo validar email`
- Mensajes de error por campo
- Estado de envío: cargando, éxito, error

### v0.11 — Variables y estado local
- `variable contador = 0`
- `al hacer clic incrementar contador`
- `mostrar contador`

### v0.12 — Temas visuales
- `tema oscuro`, `tema claro`
- Tema personalizado con variables declaradas en `app.telar`

### v0.13 — SEO y metadatos
- `og:image`, `og:title`, `twitter:card` automáticos
- `sitemap.xml` y `robots.txt` generados sin configuración

### v0.14 — Documentación web
- Web en telar.dev
- Guía de inicio rápido
- Referencia completa de sintaxis
- Playground online

### v0.15 — Tests y estabilidad
- Cobertura de rutas dinámicas, componentes, layouts
- Edge cases de estilos y Tailwind

### v1.0 — Lanzamiento público
- Sintaxis estable — sin breaking changes
- Comunidad activa
- Al menos un proyecto real construido con Telar

---

## ¿Por qué en español?

La mayoría de los lenguajes de programación usan palabras clave en inglés. Esto añade una barrera invisible para los más de 500 millones de hispanohablantes que aprenden a programar.

Telar no pretende reemplazar el inglés como lengua franca de la programación. Pretende demostrar que la sintaxis de un lenguaje puede ser un dialecto estructurado de cualquier idioma humano, y que eso reduce drásticamente la curva de aprendizaje.

---

## Cómo contribuir

El proyecto está en sus primeras fases. La contribución más valiosa ahora mismo es **probar la sintaxis**:

1. Lee la [especificación](./docs/especificacion.md)
2. Intenta escribir tu caso de uso real en Telar
3. Abre un issue con lo que se sintió forzado o incómodo

Toda la discusión de diseño del lenguaje ocurre en [Issues](../../issues).

---

## Licencia

Apache 2.0 — Ve [LICENSE](./LICENSE) para más detalles.

---

*Telar está en sus primeras fases. La sintaxis puede cambiar. Las ideas son bienvenidas.*
