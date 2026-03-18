// ---
// index.ts
// Punto de entrada del compilador de Telar.
// Uso: ts-node src/index.ts archivo.telar
// ---

import * as fs from "fs"
import * as path from "path"
import { Lexer } from "./lexer"
import { Parser } from "./parser"
import { Generador } from "./generador"
import { TelarError } from "./tipos"
 
const args = process.argv.slice(2)

if (args.length === 0) {
  console.log(`
  Telar v0.1 — Compilador
  Uso: ts-node src/index.ts <archivo.telar> [carpeta-salida]
  Ejemplo: ts-node src/index.ts examples/tienda/app.telar dist/
  `)
  process.exit(0)
}

const rutaArchivo = args[0]
const carpetaSalida = args[1] ?? 'dist'

if (!fs.existsSync(rutaArchivo)) {
  console.error(`\n✗  No se encontró el archivo: ${rutaArchivo}\n`)
  process.exit(1)
}

const nombreArchivo = path.basename(rutaArchivo)
const contenido = fs.readFileSync(rutaArchivo, 'utf-8')

console.log(`\nTelar — compilando ${nombreArchivo}...\n`)

try {
    const lexer = new Lexer(contenido)
    const tokens = lexer.tokenizar()
    console.log(`✓  Lexer    — ${tokens.length} tokens`)

    const parser = new Parser(tokens)
    const arbol = parser.parsear()
    console.log(`✓  Parser   — ${arbol.paginas.length} páginas, ${arbol.datos.length} modelos`)

    const generador = new Generador(arbol)
    const archivos = generador.generar()

    if (!fs.existsSync(carpetaSalida)) {
        fs.mkdirSync(carpetaSalida, { recursive: true })
    }

    for (const archivo of archivos) {
        const ruta = path.join(carpetaSalida, archivo.nombre)
        fs.writeFileSync(ruta, archivo.contenido, 'utf-8')
        console.log(`✓  Generado — ${ruta}`)
    }

    console.log(`\n✓  Compilación completada — ${archivos.length} archivos en ${carpetaSalida}/\n`)

} catch (error) {
    if (error instanceof TelarError) {
        console.error(error.formatear(nombreArchivo))
    } else {
        console.error(error)
    }
    process.exit(1)
}
