// ---
// index.ts
// Punto de entrada del compilador de Telar.
// Uso: ts-node src/index.ts archivo.telar
// ---

import * as fs from "fs"
import * as path from "path"
import { Lexer } from "./lexer"
import { Parser } from "./parser"
import { TelarError } from "./tipos"
 
const args = process.argv.slice(2)

if (args.length === 0) {
    console.log(`
        Telar v0.1 — Compilador
        Uso: ts-node src/index.ts <archivo.telar>
    `)
    process.exit(0)
}

const rutaArchivo = args[0]

if (!fs.existsSync(rutaArchivo)) {
    console.error(`\n✗  No se encontró el archivo: ${rutaArchivo}\n`)
    process.exit(1)
}

const nombreArchivo = path.basename(rutaArchivo)
const contenido = fs.readFileSync(rutaArchivo, 'utf-8')

console.log(`\nTelar — analizando ${nombreArchivo}...\n`)

try {
    const lexer = new Lexer(contenido)
    const tokens = lexer.tokenizar()
    console.log(`✓  Lexer — ${tokens.length} tokens`)

    const parser = new Parser(tokens)
    const arbol = parser.parsear()

    console.log(`✓  Parser — árbol construido correctamente`)
    console.log(`\n   Aplicación: ${arbol.nombre}`)
    console.log(`   Idioma:      ${arbol.idioma}`)
    console.log(`   Modelos:     ${arbol.datos.length}`)
    console.log(`   Páginas:     ${arbol.paginas.length}`)

    arbol.paginas.forEach(p => {
        console.log(`\n   📄 ${p.nombre} (${p.ruta}) — ${p.hijos.length} elementos`)
        p.hijos.forEach(h => {
            console.log(`      · ${h.tipo}`)
        })
    })

    console.log(`\n✓  ${nombreArchivo} es válido\n`)

} catch (error) {
    if (error instanceof TelarError) {
        console.error(error.formatear(nombreArchivo))
    } else {
        console.error(error)
    }
    process.exit(1)
}
