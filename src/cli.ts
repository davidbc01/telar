#!/usr/bin/env node
// ---
// cli.ts
// Interfaz de línea de comandos de Telar.
// Comandos: compilar, servir, verificar, añadir, quitar, paquetes, buscar
// ---

import * as fs from 'fs'
import * as path from 'path'
import * as http from 'http'
import { Lexer } from './lexer'
import { Parser } from './parser'
import { Generador } from './generador'
import { TelarError } from './tipos'
import { instalarPaquete, listarPaquetes, eliminarPaquete, buscarPaquetes } from './paquetes'

const VERSION = '0.4.0'

const AYUDA = `
  Telar v${VERSION} — Lenguaje de programación para la web

  Uso:
    telar <comando> [opciones]

  Comandos:
    compilar  <archivo.telar>               Compila a HTML + CSS + JS
    compilar  <archivo.telar> -o <carpeta>  Especifica carpeta de salida
    servir    <archivo.telar>               Compila y sirve en localhost
    verificar <archivo.telar>               Verifica la sintaxis sin compilar
    añadir    <paquete>                     Instala un paquete
    quitar    <paquete>                     Elimina un paquete
    paquetes                                Lista los paquetes instalados
    buscar    <término>                     Busca paquetes en GitHub

  Ejemplos:
    telar compilar app.telar
    telar compilar app.telar -o dist/
    telar servir app.telar
    telar verificar app.telar
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
    default:
        console.error(`\n✗  Comando desconocido: "${comando}"`)
        console.error(`   Usa "telar --ayuda" para ver los comandos disponibles\n`)
        process.exit(1)
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

    let timeout: NodeJS.Timeout | null = null
    fs.watch(archivo, () => {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => {
            console.log(`\n↻  Cambio detectado — recompilando...`)
            const ok = recompilarYEscribir()
            if (ok) {
                console.log(`✓  Listo`)
                notificarClientes()
            }
        }, 100)
    })

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
        console.log(`⚡  Live reload activo — guarda el archivo para recompilar`)
        console.log(`\n   Presiona Ctrl+C para parar\n`)
    })

    process.on('SIGINT', () => {
        console.log('\n\n   Parando servidor...')
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
        const contenido = leerArchivo(archivo)
        if (!contenido) process.exit(1)

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
            const contenido = fs.existsSync(archivo)
                ? fs.readFileSync(archivo, 'utf-8')
                : undefined
            console.error(error.formatear(nombreArchivo, contenido))
        } else {
            console.error(error)
        }
        process.exit(1)
    }
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
        const contenido = leerArchivo(rutaArchivo)
        if (!contenido) return null

        const lexer = new Lexer(contenido)
        const tokens = lexer.tokenizar()

        const parser = new Parser(tokens)
        const arbol = parser.parsear()

        const generador = new Generador(arbol)
        return generador.generar()

    } catch (error) {
        if (error instanceof TelarError) {
        const contenido = fs.existsSync(rutaArchivo)
            ? fs.readFileSync(rutaArchivo, 'utf-8')
            : undefined
        console.error(error.formatear(nombreArchivo, contenido))
        } else {
            console.error(error)
        }
        return null
    }
}

function leerArchivo(ruta: string): string | null {
    if (!fs.existsSync(ruta)) {
        console.error(`\n✗  No se encontró el archivo: ${ruta}\n`)
        return null
    }

    if (!ruta.endsWith('.telar')) {
        console.error(`\n✗  El archivo debe tener extensión .telar\n`)
        return null
    }

    return fs.readFileSync(ruta, 'utf-8')
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
