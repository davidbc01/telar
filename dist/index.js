"use strict";
// ---
// index.ts
// Punto de entrada del compilador de Telar.
// Uso: ts-node src/index.ts archivo.telar
// ---
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const lexer_1 = require("./lexer");
const parser_1 = require("./parser");
const generador_1 = require("./generador");
const tipos_1 = require("./tipos");
const args = process.argv.slice(2);
if (args.length === 0) {
    console.log(`
  Telar v0.1 — Compilador
  Uso: ts-node src/index.ts <archivo.telar> [carpeta-salida]
  Ejemplo: ts-node src/index.ts examples/tienda/app.telar dist/
  `);
    process.exit(0);
}
const rutaArchivo = args[0];
const carpetaSalida = args[1] ?? 'dist';
if (!fs.existsSync(rutaArchivo)) {
    console.error(`\n✗  No se encontró el archivo: ${rutaArchivo}\n`);
    process.exit(1);
}
const nombreArchivo = path.basename(rutaArchivo);
const contenido = fs.readFileSync(rutaArchivo, 'utf-8');
console.log(`\nTelar — compilando ${nombreArchivo}...\n`);
try {
    const lexer = new lexer_1.Lexer(contenido);
    const tokens = lexer.tokenizar();
    console.log(`✓  Lexer    — ${tokens.length} tokens`);
    const parser = new parser_1.Parser(tokens);
    const arbol = parser.parsear();
    console.log(`✓  Parser   — ${arbol.paginas.length} páginas, ${arbol.datos.length} modelos`);
    const generador = new generador_1.Generador(arbol);
    const archivos = generador.generar();
    if (!fs.existsSync(carpetaSalida)) {
        fs.mkdirSync(carpetaSalida, { recursive: true });
    }
    for (const archivo of archivos) {
        const ruta = path.join(carpetaSalida, archivo.nombre);
        fs.writeFileSync(ruta, archivo.contenido, 'utf-8');
        console.log(`✓  Generado — ${ruta}`);
    }
    console.log(`\n✓  Compilación completada — ${archivos.length} archivos en ${carpetaSalida}/\n`);
}
catch (error) {
    if (error instanceof tipos_1.TelarError) {
        console.error(error.formatear(nombreArchivo));
    }
    else {
        console.error(error);
    }
    process.exit(1);
}
//# sourceMappingURL=index.js.map