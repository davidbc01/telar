#!/usr/bin/env node
// ---
// cli.ts
// Interfaz de línea de comandos de Telar.
// Comandos: compilar, servir, verificar, añadir, quitar, paquetes, buscar, nuevo
// ---

import * as fs from 'fs'
import * as path from 'path'
import * as http from 'http'
import { Lexer } from './lexer'
import { Parser } from './parser'
import { Generador } from './generador'
import { TelarError } from './tipos'
import { instalarPaquete, listarPaquetes, eliminarPaquete, buscarPaquetes } from './paquetes'

const VERSION = '0.7.0'
 
const AYUDA = `
  Telar v${VERSION} — Lenguaje de programación para la web
 
  Uso:
    telar <comando> [opciones]
 
  Comandos:
    compilar  <archivo.telar>               Compila a HTML + CSS + JS
    compilar  <archivo.telar> -o <carpeta>  Especifica carpeta de salida
    servir    <archivo.telar>               Compila y sirve en localhost
    verificar <archivo.telar>               Verifica la sintaxis sin compilar
    nuevo     <nombre>                      Crea un proyecto nuevo
    añadir    <paquete>                     Instala un paquete
    quitar    <paquete>                     Elimina un paquete
    paquetes                                Lista los paquetes instalados
    buscar    <término>                     Busca paquetes en GitHub
 
  Ejemplos:
    telar compilar app.telar
    telar compilar app.telar -o dist/
    telar servir app.telar
    telar verificar app.telar
    telar nuevo mi-tienda
    telar añadir formulario
    telar buscar lista
 
  Opciones:
    --ayuda, -a       Muestra esta ayuda
    --version, -v     Muestra la versión
`
 
// ── Entrada principal ─────────────────────────────────────────
 
const args = process.argv.slice(2)
 
if (args.length === 0 || args.includes('--ayuda') || args.includes('-a')) {
    console.log(AYUDA)
    process.exit(0)
}
 
if (args.includes('--version') || args.includes('-v')) {
    console.log(`Telar v${VERSION}`)
    process.exit(0)
}
 
const comando = args[0]
 
switch (comando) {
    case 'compilar':
        comandoCompilar(args.slice(1))
        break
    case 'servir':
        comandoServir(args.slice(1))
        break
    case 'verificar':
        comandoVerificar(args.slice(1))
        break
    case 'añadir':
        comandoAñadir(args.slice(1))
        break
    case 'quitar':
        comandoQuitar(args.slice(1))
        break
    case 'paquetes':
        listarPaquetes()
        break
    case 'buscar':
        comandoBuscar(args.slice(1))
        break
    case 'nuevo':
        comandoNuevo(args.slice(1))
        break
    default:
        console.error(`\n✗  Comando desconocido: "${comando}"`)
        console.error(`   Usa "telar --ayuda" para ver los comandos disponibles\n`)
        process.exit(1)
}
 
// ── Resolución de incluciones ─────────────────────────────────
//
// Lee un archivo .telar y resuelve recursivamente todas las
// líneas `incluir ruta` sustituyéndolas por el contenido del
// archivo referenciado.
//
// Ejemplo:
//   app.telar contiene:  incluir paginas/inicio
//   → se sustituye por el contenido de paginas/inicio.telar
//
// Reglas:
//  · La extensión .telar es opcional en la directiva incluir
//  · Las rutas son relativas al archivo que las declara
//  · Se detectan inclusiones circulares
//  · Los archivos incluidos NO necesitan repetir "aplicación ..."
 
function resolverIncluciones(
    rutaArchivo: string,
    visitados: Set<string> = new Set()
): string {
    const rutaAbsoluta = path.resolve(rutaArchivo)
 
    if (visitados.has(rutaAbsoluta)) {
        throw new TelarError({
            mensaje: `Inclusión circular detectada: ${rutaArchivo}`,
            linea: 0,
            columna: 0,
            sugerencia: 'Comprueba que no hay dos archivos que se incluyen mutuamente.'
        })
    }
 
    visitados.add(rutaAbsoluta)
 
    if (!fs.existsSync(rutaAbsoluta)) {
        throw new TelarError({
            mensaje: `No se encontró el archivo incluido: ${rutaArchivo}`,
            linea: 0,
            columna: 0,
            sugerencia: `Comprueba que la ruta es correcta y el archivo existe.`
        })
    }
 
    const contenido = fs.readFileSync(rutaAbsoluta, 'utf-8')
    const dirBase = path.dirname(rutaAbsoluta)
    const lineas = contenido.split('\n')
    const resultado: string[] = []
 
    for (const linea of lineas) {
        const trimmed = linea.trim()
 
        // Detectar directiva: incluir ruta/al/archivo
        if (trimmed.startsWith('incluir ')) {
            const rutaRelativa = trimmed.slice('incluir '.length).trim()
 
            // Añadir .telar si no tiene extensión
            const rutaConExtension = rutaRelativa.endsWith('.telar')
                ? rutaRelativa
                : rutaRelativa + '.telar'
 
            const rutaIncluido = path.join(dirBase, rutaConExtension)
 
            // Insertar el contenido del archivo incluido
            // Los archivos incluidos pueden contener comentarios al inicio — se respetan
            const contenidoIncluido = resolverIncluciones(rutaIncluido, visitados)
 
            // Separador visual en caso de error (el nombre del archivo)
            resultado.push(`# — ${path.relative(process.cwd(), rutaIncluido)} —`)
            resultado.push(contenidoIncluido)
            resultado.push(``)
 
        } else {
            resultado.push(linea)
        }
    }
 
    visitados.delete(rutaAbsoluta) // permitir reusar en ramas distintas
    return resultado.join('\n')
}
 
// ── Comando: compilar ─────────────────────────────────────────
 
function comandoCompilar(args: string[]) {
    const { archivo, salida } = parsearArgs(args, 'dist')
 
    console.log(`\nTelar — compilando ${path.basename(archivo)}...\n`)
 
    const archivos = compilar(archivo)
    if (!archivos) process.exit(1)
 
    if (!fs.existsSync(salida)) {
        fs.mkdirSync(salida, { recursive: true })
    }
 
    for (const f of archivos) {
        const ruta = path.join(salida, f.nombre)
        fs.writeFileSync(ruta, f.contenido, 'utf-8')
        console.log(`✓  ${f.nombre}`)
    }
 
    console.log(`\n✓  ${archivos.length} archivos generados en ${salida}/\n`)
}
 
// ── Comando: servir ───────────────────────────────────────────
 
function comandoServir(args: string[]) {
    const { archivo, salida } = parsearArgs(args, '.telar-tmp')
    const puerto = 3000
    const puertoWS = 3001
 
    console.log(`\nTelar — compilando ${path.basename(archivo)}...\n`)
    const archivos = compilar(archivo)
    if (!archivos) process.exit(1)
 
    if (!fs.existsSync(salida)) {
        fs.mkdirSync(salida, { recursive: true })
    }
 
    function recompilarYEscribir() {
        const nuevos = compilar(archivo)
        if (!nuevos) return false
        for (const f of nuevos) {
            let contenido = f.contenido
            if (f.nombre.endsWith('.html')) {
                contenido = contenido.replace(
                    '</body>',
                    `<script>
    const ws = new WebSocket('ws://localhost:${puertoWS}');
    ws.onmessage = () => location.reload();
</script>
</body>`
                )
            }
            fs.writeFileSync(path.join(salida, f.nombre), contenido, 'utf-8')
        }
        return true
    }
 
    recompilarYEscribir()
 
    const net = require('net')
    const clientes: any[] = []
 
    const wsServer = net.createServer((socket: any) => {
        socket.once('data', (data: Buffer) => {
            const key = data.toString().match(/Sec-WebSocket-Key: (.+)/)?.[1]?.trim()
            if (!key) return
            const crypto = require('crypto')
            const accept = crypto
                .createHash('sha1')
                .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
                .digest('base64')
            socket.write(
                'HTTP/1.1 101 Switching Protocols\r\n' +
                'Upgrade: websocket\r\n' +
                'Connection: Upgrade\r\n' +
                `Sec-WebSocket-Accept: ${accept}\r\n\r\n`
            )
            clientes.push(socket)
            socket.on('close', () => {
                const i = clientes.indexOf(socket)
                if (i !== -1) clientes.splice(i, 1)
            })
        })
    })
 
    wsServer.listen(puertoWS)
 
    function notificarClientes() {
        const msg = Buffer.from('reload')
        const frame = Buffer.alloc(2 + msg.length)
        frame[0] = 0x81
        frame[1] = msg.length
        msg.copy(frame, 2)
        clientes.forEach(s => {
            try { s.write(frame) } catch (e) {}
        })
    }
 
    // ── Vigilar archivos del proyecto (multi-archivo) ──────────
    // En lugar de vigilar solo app.telar, vigilamos todos los
    // .telar del directorio del proyecto.
 
    const dirProyecto = path.dirname(path.resolve(archivo))
 
    function obtenerArchivosTelar(dir: string): string[] {
        const resultado: string[] = []
        for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
            const ruta = path.join(dir, entrada.name)
            if (entrada.isDirectory() && !entrada.name.startsWith('.') && entrada.name !== 'paquetes') {
                resultado.push(...obtenerArchivosTelar(ruta))
            } else if (entrada.isFile() && (entrada.name.endsWith('.telar') || entrada.name.endsWith('.css'))) {
                resultado.push(ruta)
            }
        }
        return resultado
    }
 
    let timeout: NodeJS.Timeout | null = null
    const watchers: fs.FSWatcher[] = []
 
    function vigilarProyecto() {
        // Limpiar watchers anteriores
        for (const w of watchers) w.close()
        watchers.length = 0
 
        const archivosTelar = obtenerArchivosTelar(dirProyecto)
        for (const archivoTelar of archivosTelar) {
            const w = fs.watch(archivoTelar, () => {
                if (timeout) clearTimeout(timeout)
                timeout = setTimeout(() => {
                    console.log(`\n↻  Cambio detectado en ${path.relative(dirProyecto, archivoTelar)} — recompilando...`)
                    const ok = recompilarYEscribir()
                    if (ok) {
                        console.log(`✓  Listo`)
                        notificarClientes()
                        vigilarProyecto() // refrescar por si hay nuevos archivos
                    }
                }, 100)
            })
            watchers.push(w)
        }
    }
 
    vigilarProyecto()
 
    const servidor = http.createServer((req, res) => {
        let urlPath = req.url === '/' ? '/index.html' : req.url ?? '/index.html'
        urlPath = urlPath.split('?')[0]
        if (!path.extname(urlPath)) urlPath = urlPath + '.html'
 
        const rutaArchivo = path.join(salida, urlPath)
 
        if (fs.existsSync(rutaArchivo)) {
            const ext = path.extname(rutaArchivo)
            const tipo = ext === '.html' ? 'text/html; charset=utf-8'
                        : ext === '.css'  ? 'text/css; charset=utf-8'
                        : ext === '.js'   ? 'application/javascript'
                        : 'text/plain'
            res.writeHead(200, { 'Content-Type': tipo })
            res.end(fs.readFileSync(rutaArchivo))
        } else {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
            res.end(`
                <h1>404 — Página no encontrada</h1>
                <p>No existe: ${urlPath}</p>
                <a href="/">Volver al inicio</a>
            `)
        }
    })
 
    servidor.listen(puerto, () => {
        console.log(`✓  Compilación completada`)
        console.log(`\n🌐  Telar sirviendo en http://localhost:${puerto}`)
        console.log(`⚡  Live reload activo — cualquier cambio en el proyecto recarga`)
        console.log(`\n   Presiona Ctrl+C para parar\n`)
    })
 
    process.on('SIGINT', () => {
        console.log('\n\n   Parando servidor...')
        for (const w of watchers) w.close()
        wsServer.close()
        fs.rmSync(salida, { recursive: true, force: true })
        process.exit(0)
    })
}
 
// ── Comando: verificar ────────────────────────────────────────
 
function comandoVerificar(args: string[]) {
    const { archivo } = parsearArgs(args, '')
    const nombreArchivo = path.basename(archivo)
 
    console.log(`\nTelar — verificando ${nombreArchivo}...\n`)
 
    try {
        const contenido = resolverIncluciones(archivo)
 
        const lexer = new Lexer(contenido)
        const tokens = lexer.tokenizar()
 
        const parser = new Parser(tokens)
        const arbol = parser.parsear()
 
        console.log(`✓  Sintaxis correcta`)
        console.log(`   ${arbol.paginas.length} páginas, ${arbol.datos.length} modelos\n`)
 
        arbol.paginas.forEach(p => {
            console.log(`   📄 ${p.nombre} (${p.ruta})`)
        })
 
        console.log()
 
    } catch (error) {
        if (error instanceof TelarError) {
            const contenidoRaw = fs.existsSync(archivo)
                ? fs.readFileSync(archivo, 'utf-8')
                : undefined
            console.error(error.formatear(nombreArchivo, contenidoRaw))
        } else {
            console.error(error)
        }
        process.exit(1)
    }
}
 
// ── Comando: nuevo ────────────────────────────────────────────
 
function comandoNuevo(args: string[]) {
    if (args.length === 0) {
        console.error('\n✗  Falta el nombre del proyecto')
        console.error('   Ejemplo: telar nuevo mi-proyecto\n')
        process.exit(1)
    }
 
    const nombre = args[0]
    const carpeta = path.join(process.cwd(), nombre)
 
    if (fs.existsSync(carpeta)) {
        console.error(`\n✗  Ya existe una carpeta llamada "${nombre}"\n`)
        process.exit(1)
    }
 
    const nombrePascal = nombre
        .split(/[-_]/)
        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
        .join('')
 
    console.log(`\nTelar — creando proyecto "${nombre}"...\n`)
 
    // Estructura de carpetas
    fs.mkdirSync(carpeta, { recursive: true })
    fs.mkdirSync(path.join(carpeta, 'paginas'), { recursive: true })
    fs.mkdirSync(path.join(carpeta, 'paquetes'), { recursive: true })
 
    // ── app.telar ─────────────────────────────────────────────
    fs.writeFileSync(path.join(carpeta, 'app.telar'),
`# ${nombre}
# Creado con Telar — telar.dev
 
aplicación ${nombrePascal}
  idioma español
 
incluir paginas/inicio
incluir paginas/sobre-nosotros
`, 'utf-8')
 
    // ── paginas/inicio.telar ──────────────────────────────────
    fs.writeFileSync(path.join(carpeta, 'paginas', 'inicio.telar'),
`página inicio en "/"
  título "Hola desde ${nombrePascal}"
  descripción "Bienvenido a tu primera aplicación con Telar"
 
  mostrar "Este es tu punto de partida."
  mostrar "Edita paginas/inicio.telar para empezar."
 
  botón "Sobre nosotros" ir a sobreNosotros
 
  optimizar para móvil
`, 'utf-8')
 
    // ── paginas/sobre-nosotros.telar ──────────────────────────
    fs.writeFileSync(path.join(carpeta, 'paginas', 'sobre-nosotros.telar'),
`página sobreNosotros en "/sobre-nosotros"
  título "Sobre nosotros"
 
  mostrar "Construido con Telar, un lenguaje declarativo para la web en español."
 
  botón "Volver al inicio" ir a inicio
 
  optimizar para móvil
`, 'utf-8')
 
    // ── estilos.css ──────────────────────────────────────────
    fs.writeFileSync(path.join(carpeta, 'estilos.css'),
`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
 
/* Para usar Tailwind en su lugar, añade en app.telar:        */
/*   estilos "https://cdn.tailwindcss.com"                    */
/* Y borra o vacía este archivo.                              */
 
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
 
:root {
    --primario:       #6d4aff;
    --primario-dark:  #5535ee;
    --texto:          #111827;
    --texto-suave:    #6b7280;
    --fondo:          #f9fafb;
    --superficie:     #ffffff;
    --borde:          #e5e7eb;
    --error:          #ef4444;
    --error-light:    #fef2f2;
    --radio:          10px;
    --radio-sm:       6px;
    --sombra-sm:      0 1px 3px rgba(0,0,0,.08);
    --sombra:         0 4px 16px rgba(0,0,0,.08);
    --transicion:     150ms ease;
}
 
html { font-size: 16px; scroll-behavior: smooth; }
 
body {
    font-family: 'Inter', system-ui, sans-serif;
    background: var(--fondo);
    color: var(--texto);
    line-height: 1.65;
    min-height: 100vh;
}
 
main {
    max-width: 720px;
    margin: 0 auto;
    padding: 3rem 1.5rem 5rem;
}
 
h1 {
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.2;
    margin-bottom: 0.75rem;
}
 
p { color: var(--texto-suave); margin-bottom: 1rem; }
 
.descripcion {
    font-size: 1.125rem;
    color: var(--texto-suave);
    margin-bottom: 2rem;
}
 
.boton {
    display: inline-flex;
    align-items: center;
    padding: 0.625rem 1.25rem;
    background: var(--primario);
    color: #fff;
    border: none;
    border-radius: var(--radio);
    font-size: 0.9375rem;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    text-decoration: none;
    transition: background var(--transicion), transform var(--transicion), box-shadow var(--transicion);
    box-shadow: 0 1px 3px rgba(109,74,255,.35);
    margin: 0.25rem 0.25rem 0.25rem 0;
}
 
.boton:hover {
    background: var(--primario-dark);
    box-shadow: 0 4px 12px rgba(109,74,255,.4);
    transform: translateY(-1px);
}
 
.boton:active { transform: translateY(0); box-shadow: none; }
 
.campo-grupo {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    margin-bottom: 1.25rem;
}
 
label { font-size: 0.875rem; font-weight: 500; }
 
input, textarea, select {
    padding: 0.625rem 0.875rem;
    border: 1.5px solid var(--borde);
    border-radius: var(--radio-sm);
    font-size: 1rem;
    font-family: inherit;
    background: var(--superficie);
    width: 100%;
    transition: border-color var(--transicion), box-shadow var(--transicion);
}
 
input:focus, textarea:focus {
    outline: none;
    border-color: var(--primario);
    box-shadow: 0 0 0 3px rgba(109,74,255,.15);
}
 
.lista { margin: 1.5rem 0; }
 
.cargando {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--texto-suave);
    font-size: 0.9rem;
    padding: 2rem 0;
}
 
.cargando::before {
    content: '';
    width: 16px;
    height: 16px;
    border: 2px solid var(--borde);
    border-top-color: var(--primario);
    border-radius: 50%;
    animation: girar 0.7s linear infinite;
    flex-shrink: 0;
}
 
@keyframes girar { to { transform: rotate(360deg); } }
 
.error {
    color: var(--error);
    font-size: 0.875rem;
    padding: 0.875rem 1rem;
    background: var(--error-light);
    border: 1px solid #fecaca;
    border-radius: var(--radio-sm);
    margin: 0.75rem 0;
}
 
.reintentar {
    background: none;
    border: 1.5px solid var(--borde);
    border-radius: var(--radio-sm);
    padding: 0.4rem 0.875rem;
    cursor: pointer;
    font-size: 0.875rem;
    font-family: inherit;
    color: var(--texto-suave);
    transition: border-color var(--transicion), color var(--transicion);
}
 
.reintentar:hover { border-color: var(--primario); color: var(--primario); }
 
@media (max-width: 600px) {
    main { padding: 1.5rem 1rem 4rem; }
    h1 { font-size: 1.625rem; }
}
 
@media (prefers-color-scheme: dark) {
    :root {
        --texto: #f3f4f6;
        --texto-suave: #9ca3af;
        --fondo: #0f1117;
        --superficie: #1a1d27;
        --borde: #2d3148;
    }
    input, textarea { background: #1a1d27; }
}
`, 'utf-8')
 
    // ── telar.paquetes.json ───────────────────────────────────
    fs.writeFileSync(
        path.join(carpeta, 'telar.paquetes.json'),
        JSON.stringify([], null, 2),
        'utf-8'
    )
 
    // ── .gitignore ────────────────────────────────────────────
    fs.writeFileSync(path.join(carpeta, '.gitignore'),
`dist/
paquetes/
.telar-tmp/
`, 'utf-8')
 
    // ── README.md ─────────────────────────────────────────────
    fs.writeFileSync(path.join(carpeta, 'README.md'),
`# ${nombre}
 
Proyecto creado con [Telar](https://github.com/davidbc01/telar).
 
## Desarrollo
 
\`\`\`bash
telar servir app.telar
\`\`\`
 
## Compilar
 
\`\`\`bash
telar compilar app.telar -o dist/
\`\`\`
 
## Añadir una página
 
1. Crea \`paginas/mi-pagina.telar\`
2. Añade \`incluir paginas/mi-pagina\` en \`app.telar\`
3. Guarda — el live reload recarga automáticamente
`, 'utf-8')
 
    console.log(`✓  estilos.css`)
    console.log(`✓  app.telar`)
    console.log(`✓  paginas/inicio.telar`)
    console.log(`✓  paginas/sobre-nosotros.telar`)
    console.log(`✓  telar.paquetes.json`)
    console.log(`✓  .gitignore`)
    console.log(`✓  README.md`)
    console.log(`\n✓  Proyecto "${nombre}" listo\n`)
    console.log(`   cd ${nombre}`)
    console.log(`   telar servir app.telar\n`)
}
 
// ── Comandos: paquetes ────────────────────────────────────────
 
async function comandoAñadir(args: string[]) {
    if (args.length === 0) {
        console.error('\n✗  Falta el nombre del paquete')
        console.error('   Ejemplo: telar añadir formulario\n')
        process.exit(1)
    }
    try {
        await instalarPaquete(args[0])
        process.exit(0)
    } catch (error: any) {
        console.error(`\n✗  ${error.message}\n`)
        process.exit(1)
    }
}
 
function comandoQuitar(args: string[]) {
    if (args.length === 0) {
        console.error('\n✗  Falta el nombre del paquete\n')
        process.exit(1)
    }
    try {
        eliminarPaquete(args[0])
    } catch (error: any) {
        console.error(`\n✗  ${error.message}\n`)
        process.exit(1)
    }
}
 
async function comandoBuscar(args: string[]) {
    if (args.length === 0) {
        console.error('\n✗  Falta el término de búsqueda\n')
        process.exit(1)
    }
    await buscarPaquetes(args[0])
    process.exit(0)
}
 
// ── Helpers ───────────────────────────────────────────────────
 
function compilar(rutaArchivo: string) {
    const nombreArchivo = path.basename(rutaArchivo)
 
    try {
        // Verificar que el archivo existe y tiene extensión correcta
        if (!fs.existsSync(rutaArchivo)) {
            console.error(`\n✗  No se encontró el archivo: ${rutaArchivo}\n`)
            return null
        }
        if (!rutaArchivo.endsWith('.telar')) {
            console.error(`\n✗  El archivo debe tener extensión .telar\n`)
            return null
        }
 
        // ↓ CAMBIO PRINCIPAL: resolvemos incluciones antes de tokenizar
        const contenido = resolverIncluciones(rutaArchivo)
 
        const lexer = new Lexer(contenido)
        const tokens = lexer.tokenizar()
 
        const parser = new Parser(tokens)
        const arbol = parser.parsear()
 
        const dirProyecto = path.dirname(path.resolve(rutaArchivo))
        const generador = new Generador(arbol, dirProyecto)
        return generador.generar()
 
    } catch (error) {
        if (error instanceof TelarError) {
            const contenidoRaw = fs.existsSync(rutaArchivo)
                ? fs.readFileSync(rutaArchivo, 'utf-8')
                : undefined
            console.error(error.formatear(nombreArchivo, contenidoRaw))
        } else {
            console.error(error)
        }
        return null
    }
}
 
function parsearArgs(args: string[], salidaDefault: string) {
    if (args.length === 0) {
        console.error(`\n✗  Falta el archivo .telar\n`)
        console.error(`   Ejemplo: telar compilar app.telar\n`)
        process.exit(1)
    }
 
    const archivo = args[0]
    const indiceO = args.indexOf('-o')
    const salida = indiceO !== -1 && args[indiceO + 1]
        ? args[indiceO + 1]
        : salidaDefault
 
    return { archivo, salida }
}
