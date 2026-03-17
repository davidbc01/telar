// ---
// index.ts
// Punto de entrada del compilador de Telar.
// Uso: ts-node src/index.ts archivo.telar
// ---

import * as fs from "fs"
import * as path from "path"
import { Lexer } from "./lexer"
import { TelarError } from "./tipos"
 
const args = process.argv.slice(2)
 
if (args.length === 0) {
    console.log(`
    Telar v0.1 — Compilador
    
    Uso:
        ts-node src/index.ts <archivo.telar>
    
    Ejemplo:
        ts-node src/index.ts examples/tienda/app.telar
    `)
    process.exit(0)
}
 
const rutaArchivo = args[0]
 
if (!fs.existsSync(rutaArchivo)) {
    console.error(`\n✗  No se encontró el archivo: ${rutaArchivo}\n`)
    process.exit(1)
}
 
const nombreArchivo = path.basename(rutaArchivo)
const contenido = fs.readFileSync(rutaArchivo, "utf-8")
 
console.log(`\nTelar — analizando ${nombreArchivo}...\n`)
 
try {
    const lexer = new Lexer(contenido)
    const tokens = lexer.tokenizar()
 
    console.log(`✓  Análisis completado — ${tokens.length} tokens encontrados\n`)
 
    // Mostrar tokens para depuración
    tokens.forEach(t => {
        console.log(`   [${t.tipo.padEnd(16)}] "${t.valor}" (línea ${t.linea})`)
    })
 
} catch (error) {
    if (error instanceof TelarError) {
        console.error(error.formatear(nombreArchivo))
    } else {
        console.error(error)
    }
    process.exit(1)
}
