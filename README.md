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

👉 ¿Primera vez? La **[guía de inicio rápido](./docs/inicio-rapido.md)** te lleva de cero a tu primera web interactiva en 5 minutos.

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

## Diseños y componentes

Un diseño envuelve el contenido de tus páginas — navbar, pie, lo que sea compartido. Si declaras uno, se aplica automáticamente a todas las páginas sin tener que hacer nada más:

```telar
diseño principal
  navbar
    título "Mi Tienda"
  pie
    descripción "© 2026 Mi Tienda"

página inicio en "/"
  título "Bienvenido"   # se inserta al final del diseño, automáticamente
```

Si una página necesita un diseño distinto, lo declara explícitamente:

```telar
página contacto en "/contacto"
  diseño principal
  título "Contacto"
```

Los componentes son piezas reutilizables sin paréntesis ni argumentos posicionales. Dentro del componente, accedes a las propiedades con `item.propiedad`:

```telar
componente TarjetaProducto
  mostrar item.nombre
  mostrar item.precio

página inicio en "/"
  TarjetaProducto con producto
```

Y se pueden usar como plantilla de una lista real, para que cada elemento se vea con tu diseño en vez del genérico "campo: valor":

```telar
página inicio en "/"
  mostrar Producto recientes
    máximo 8
    con TarjetaProducto
```

`con TarjetaProducto` conecta el componente a los datos reales que llegan de `/api/producto` — cada `item.propiedad` se rellena con el valor real de cada producto, uno por uno, no con texto fijo.

Si escribes mal el nombre de un diseño o un componente, Telar lo detecta al compilar (`telar verificar` o `telar compilar`) y te dice cuáles están declarados de verdad — antes de v0.18 esto compilaba en silencio y el error solo se notaba mirando la web ya en el navegador.

---

## Rutas dinámicas

Un segmento entre paréntesis en la ruta se convierte en un parámetro. `telar servir` lo resuelve en tiempo real: una sola página compilada sirve cualquier valor de `id`, la resolución ocurre en el navegador.

```telar
página detalle en "/producto/(id)"
  título "Detalle del producto"
  mostrar Producto según id = parametro.id
```

`GET /producto/42` y `GET /producto/999` sirven el mismo `producto-id.html`; el `id` real se lee de la URL y se usa para pedir `/api/producto?id=42` a tu backend. Tu API tiene que soportar ese filtro — Telar solo genera la petición, no el servidor de datos.

---

## Formularios con validación

```telar
página registro en "/registro"
  campo "Email" email requerido
  campo "Contraseña" contraseña requerido mínimo 8
  botón "Registrarse" registrar
```

`requerido`, `mínimo N` y `máximo N` generan los atributos HTML5 correspondientes (`required`, `minlength`, `maxlength`) y un mensaje de error visible por campo. Al pulsar un botón con una acción, Telar valida todos los campos de la página antes de enviar nada — si algo no es válido, no se llega a hacer la petición. Si todo es correcto, los valores reales del formulario se envían como JSON a `/api/accion/<nombre>`.

---

## Variables y estado local

```telar
página contador en "/"
  variable cuenta = 0

  título "Contador"
  texto cuenta

  botón "Sumar" suma cuenta
  botón "Restar" resta cuenta
```

`variable` declara estado local a la página, sin llamar a ninguna API. `texto cuenta` muestra el valor y se actualiza sola cada vez que cambia. `suma <variable>` / `resta <variable>` son acciones incorporadas — todo pasa en el navegador, al hacer clic, sin red de por medio. Las variables a nivel de aplicación (compartidas entre páginas) y la asignación de valores arbitrarios quedan para una versión futura.

---

## Temas visuales

```telar
aplicación MiApp
  tema oscuro

página inicio en "/"
  botón "🌙 Cambiar tema" alterna tema
```

Sin declarar `tema`, Telar sigue el sistema operativo del visitante (igual que siempre). `tema oscuro` o `tema claro` lo fija para toda la web, sin importar el sistema operativo. El botón `alterna tema` es opcional y se puede combinar con cualquiera de los dos: alterna en vivo y lo recuerda entre visitas con `localStorage`, sin llamar a ninguna API.

---

## SEO y metadatos

```telar
aplicación MiTienda
  dominio "https://mitienda.com"

página inicio en "/"
  imagen "https://mitienda.com/img/portada.jpg"
  título "Bienvenido a Mi Tienda"
  descripción "La mejor tienda online de zapatillas"
```

Cada página genera automáticamente sus etiquetas `og:title`, `og:description`, `twitter:card` y similares a partir del título y la descripción — sin nada que configurar. `imagen "url"` se muestra en la página como una imagen normal y, si es la primera de esa página, se usa también como `og:image`/`twitter:image`.

Declarar `dominio` en `app.telar` añade dos cosas más: `og:url` con la URL absoluta real de cada página, y dos archivos nuevos generados en la raíz — `sitemap.xml` y `robots.txt`, listos para subir tal cual. Las rutas dinámicas (`/producto/(id)`) se excluyen del sitemap automáticamente, porque no representan una URL real.

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
| Tests completos (198) + CI/CD | ✅ Completo |
| Proyectos multi-archivo con `incluir` | ✅ Completo |
| Estilos personalizables + Tailwind | ✅ Completo |
| Palabra clave `clase` en elementos | ✅ Completo |
| Diseños y componentes reutilizables | ✅ Completo |
| Rutas dinámicas con parámetros | ✅ Completo |
| Formularios con validación | ✅ Completo |
| Variables y estado local | ✅ Completo |
| Temas visuales | ✅ Completo |
| SEO y metadatos automáticos | ✅ Completo |
| Documentación escrita | ✅ Completo |
| Tests del CLI + cobertura ampliada | ✅ Completo |
| Gramática limpia (sin `tipo`/`filtrados por`/`hacer`) | ✅ Completo |
| Componentes conectados a listas de datos reales | ✅ Completo |
| Validación semántica (diseños/componentes inexistentes) | ✅ Completo |
| Lanzamiento público | 🟪 Pendiente |
| Web oficial de Telar | 🟪 Pendiente |

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

### v0.8 — Diseños y componentes ✅
- Sintaxis `diseño <nombre>` para estructuras compartidas entre páginas
- Diseño por defecto aplicado automáticamente si existe uno declarado
- Sintaxis `componente <Nombre>` para elementos reutilizables, sin paréntesis ni argumentos posicionales
- Uso con `NombreComponente con argumento`, accediendo a propiedades vía `item.propiedad`

### v0.9 — Rutas dinámicas ✅
- Parámetros en URLs: `página detalle en "/producto/(id)"`
- Acceso al parámetro con `mostrar Modelo según campo = parametro.nombre`
- `telar servir` resuelve rutas dinámicas en tiempo real, no solo archivos estáticos

### v0.10 — Formularios con validación ✅
- `campo requerido`, `campo mínimo N [caracteres]`, `campo máximo N [caracteres]`
- Mensajes de error por campo, mostrados junto al campo inválido
- Los botones `hacer` ahora validan los campos antes de enviar, y envían sus valores reales en el POST (antes no se enviaba nada)

### v0.11 — Variables y estado local ✅
- `variable cuenta = 0` — estado local por página
- `texto cuenta` — muestra el valor y se actualiza sola
- `botón "Sumar" suma cuenta` / `resta cuenta` — acciones incorporadas que mutan la variable sin llamar a ninguna API

### v0.12 — Temas visuales ✅
- `tema oscuro` / `tema claro` en `app.telar`, fijo para toda la web
- Sin declarar tema, sigue el sistema operativo automáticamente (comportamiento igual que antes de v0.12)
- `botón "X" alterna tema` — alterna en vivo, recordado entre visitas con `localStorage`
- Colores de tema totalmente personalizados (más allá de oscuro/claro) quedan para una versión futura

### v0.13 — SEO y metadatos ✅
- `og:title`, `og:description`, `og:image`, `twitter:card` automáticos a partir de título/descripción/imagen — sin configuración
- `dominio "https://..."` en `app.telar` habilita `og:url` absoluta, `sitemap.xml` y `robots.txt`
- `imagen "url"` — se muestra en la página y, si es la primera de esa página, se usa también como imagen para compartir en redes
- Las rutas dinámicas (`/producto/(id)`) se excluyen del sitemap automáticamente

### v0.14 — Documentación escrita ✅
- `docs/inicio-rapido.md` — guía de 5 minutos, de instalación a primera web interactiva
- `docs/sintaxis.md` — referencia completa (ya se mantenía al día desde v0.8)
- `examples/blog/` y `examples/tienda/` — reescritos desde cero: los anteriores usaban sintaxis que nunca existió y ni siquiera compilaban. Los nuevos sí, verificado
- De paso, dos bugs reales de `telar nuevo`: no respetaba rutas absolutas (creaba el proyecto en el sitio equivocado sin avisar) y generaba un nombre de aplicación inválido en ese caso

### v0.15 — Tests y estabilidad ✅
- Tests del CLI (`nuevo`, `compilar`, `verificar`) — antes no tenían ninguna cobertura automática
- Cobertura de combinaciones diseño + rutas dinámicas + componentes
- **Bug real corregido:** el CDN de Tailwind (`estilos "https://cdn.tailwindcss.com"`, el ejemplo destacado del propio README) generaba `<link rel="stylesheet">` en vez de `<script src="...">` — nunca había funcionado
- 22 tests nuevos (181 en total)

### v0.16 — Gramática más limpia ✅
- Rediseño deliberado de la sintaxis antes de comprometerse a la estabilidad de v1.0: cada palabra clave tiene que aportar significado
- `campo "X" tipo email` → `campo "X" email` — `tipo` no aportaba nada
- `mostrar Modelo filtrados por id = parametro.id` → `mostrar Modelo según id = parametro.id`
- `botón "X" hacer sumar/restar/cambiar tema/acción` → `suma` / `resta` / `alterna tema` / `acción` a secas — `hacer` era puro pegamento
- De paso, dos paquetes locales (`formulario`, `lista`) tenían sintaxis que nunca fue real (un `si funciona` tras un botón que no existe, una interpolación de texto que Telar nunca ha soportado) — corregidos

### v0.17 — Componentes conectados a listas reales ✅
- `mostrar Modelo ... con NombreComponente` — antes, los componentes y las listas de datos eran dos sistemas que nunca se hablaban entre sí
- Cada `item.propiedad` del componente se rellena con el valor real de cada elemento de la lista, no con texto fijo
- Probado de extremo a extremo con un DOM real y datos simulados

### v0.18 — Validación semántica ✅
- Referenciar un `diseño` o `componente` que no existe (típicamente un typo) ahora es un **error de compilación**, con las opciones válidas declaradas en la sugerencia
- Antes compilaba en silencio: el diseño simplemente no se aplicaba, o el componente generaba un comentario HTML invisible en la práctica
- La validación cubre páginas, diseños, y bloques `si`/`si no` anidados

### v1.0 — Lanzamiento público
- Sintaxis estable — sin breaking changes
- Comunidad activa
- Al menos un proyecto real construido con Telar

### Después de v1.0 — Web oficial de Telar
- Sitio en telar.dev con guía de inicio rápido y referencia de sintaxis
- Playground online para escribir y compilar Telar desde el navegador
- Showcase de proyectos reales construidos con el lenguaje

---

## ¿Por qué en español?

La mayoría de los lenguajes de programación usan palabras clave en inglés. Esto añade una barrera invisible para los más de 500 millones de hispanohablantes que aprenden a programar.

Telar no pretende reemplazar el inglés como lengua franca de la programación. Pretende demostrar que la sintaxis de un lenguaje puede ser un dialecto estructurado de cualquier idioma humano, y que eso reduce drásticamente la curva de aprendizaje.

---

## Cómo contribuir

El proyecto está en sus primeras fases. La contribución más valiosa ahora mismo es **probar la sintaxis**:

1. Sigue la [guía de inicio rápido](./docs/inicio-rapido.md) (5 minutos, de cero a tu primera web)
2. Lee la [especificación](./docs/especificacion.md) y la [referencia de sintaxis](./docs/sintaxis.md)
3. Intenta escribir tu caso de uso real en Telar
4. Abre un issue con lo que se sintió forzado o incómodo

Toda la discusión de diseño del lenguaje ocurre en [Issues](../../issues).

---

## Licencia

Apache 2.0 — Ve [LICENSE](./LICENSE) para más detalles.

---

*Telar está en sus primeras fases. La sintaxis puede cambiar. Las ideas son bienvenidas.*
