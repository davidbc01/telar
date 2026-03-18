#!/usr/bin/env node
"use strict";
// ---
// cli.ts
// Interfaz de línea de comandos de Telar.
// Comandos: compilar, servir, verificar
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
const http = __importStar(require("http"));
const lexer_1 = require("./lexer");
const parser_1 = require("./parser");
const generador_1 = require("./generador");
const tipos_1 = require("./tipos");
const VERSION = '0.1.0';
const AYUDA = `
  Telar v${VERSION} — Lenguaje de programación para la web
 
  Uso:
    telar <comando> [opciones]
 
  Comandos:
    compilar <archivo.telar>        Compila a HTML + CSS
    compilar <archivo.telar> -o <carpeta>  Especifica carpeta de salida
    servir   <archivo.telar>        Compila y sirve en localhost
    verificar <archivo.telar>       Verifica la sintaxis sin compilar
 
  Ejemplos:
    telar compilar app.telar
    telar compilar app.telar -o dist/
    telar servir app.telar
    telar verificar app.telar
 
  Opciones:
    --ayuda, -a       Muestra esta ayuda
    --version, -v     Muestra la versión
`;
// --- Entrada principal ---
const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--ayuda') || args.includes('-a')) {
    console.log(AYUDA);
    process.exit(0);
}
if (args.includes('--version') || args.includes('-v')) {
    console.log(`Telar v${VERSION}`);
    process.exit(0);
}
const comando = args[0];
switch (comando) {
    case 'compilar':
        comandoCompilar(args.slice(1));
        break;
    case 'servir':
        comandoServir(args.slice(1));
        break;
    case 'verificar':
        comandoVerificar(args.slice(1));
        break;
    default:
        console.error(`\n✗  Comando desconocido: "${comando}"`);
        console.error(`   Usa "telar --ayuda" para ver los comandos disponibles\n`);
        process.exit(1);
}
// --- Comando: compilar ---
function comandoCompilar(args) {
    const { archivo, salida } = parsearArgs(args, 'dist');
    console.log(`\nTelar — compilando ${path.basename(archivo)}...\n`);
    const archivos = compilar(archivo);
    if (!archivos)
        process.exit(1);
    // Crear carpeta de salida
    if (!fs.existsSync(salida)) {
        fs.mkdirSync(salida, { recursive: true });
    }
    for (const f of archivos) {
        const ruta = path.join(salida, f.nombre);
        fs.writeFileSync(ruta, f.contenido, 'utf-8');
        console.log(`✓  ${f.nombre}`);
    }
    console.log(`\n✓  ${archivos.length} archivos generados en ${salida}/\n`);
}
// --- Comando: servir ---
function comandoServir(args) {
    const { archivo, salida } = parsearArgs(args, '.telar-tmp');
    const puerto = 3000;
    // Compilar primero
    console.log(`\nTelar — compilando ${path.basename(archivo)}...\n`);
    const archivos = compilar(archivo);
    if (!archivos)
        process.exit(1);
    // Escribir a carpeta temporal
    if (!fs.existsSync(salida)) {
        fs.mkdirSync(salida, { recursive: true });
    }
    for (const f of archivos) {
        fs.writeFileSync(path.join(salida, f.nombre), f.contenido, 'utf-8');
    }
    // Servidor HTTP simple
    const servidor = http.createServer((req, res) => {
        let urlPath = req.url === '/' ? '/index.html' : req.url ?? '/index.html';
        // Quitar query strings
        urlPath = urlPath.split('?')[0];
        // Añadir .html si no tiene extensión
        if (!path.extname(urlPath)) {
            urlPath = urlPath + '.html';
        }
        const rutaArchivo = path.join(salida, urlPath);
        if (fs.existsSync(rutaArchivo)) {
            const ext = path.extname(rutaArchivo);
            const tipo = ext === '.html' ? 'text/html; charset=utf-8'
                : ext === '.css' ? 'text/css; charset=utf-8'
                    : ext === '.js' ? 'application/javascript'
                        : 'text/plain';
            res.writeHead(200, { 'Content-Type': tipo });
            res.end(fs.readFileSync(rutaArchivo));
        }
        else {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <h1>404 — Página no encontrada</h1>
                <p>No existe: ${urlPath}</p>
                <a href="/">Volver al inicio</a>
            `);
        }
    });
    servidor.listen(puerto, () => {
        console.log(`✓  Compilación completada`);
        console.log(`\n🌐  Telar sirviendo en http://localhost:${puerto}\n`);
        console.log(`   Presiona Ctrl+C para parar\n`);
    });
    // Limpiar carpeta temporal al salir
    process.on('SIGINT', () => {
        console.log('\n\n   Parando servidor...');
        fs.rmSync(salida, { recursive: true, force: true });
        process.exit(0);
    });
}
// --- Comando: verificar ---
function comandoVerificar(args) {
    const { archivo } = parsearArgs(args, '');
    const nombreArchivo = path.basename(archivo);
    console.log(`\nTelar — verificando ${nombreArchivo}...\n`);
    try {
        const contenido = leerArchivo(archivo);
        if (!contenido)
            process.exit(1);
        const lexer = new lexer_1.Lexer(contenido);
        const tokens = lexer.tokenizar();
        const parser = new parser_1.Parser(tokens);
        const arbol = parser.parsear();
        console.log(`✓  Sintaxis correcta`);
        console.log(`   ${arbol.paginas.length} páginas, ${arbol.datos.length} modelos\n`);
        arbol.paginas.forEach(p => {
            console.log(`   📄 ${p.nombre} (${p.ruta})`);
        });
        console.log();
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
}
// --- Helpers ---
function compilar(rutaArchivo) {
    const nombreArchivo = path.basename(rutaArchivo);
    try {
        const contenido = leerArchivo(rutaArchivo);
        if (!contenido)
            return null;
        const lexer = new lexer_1.Lexer(contenido);
        const tokens = lexer.tokenizar();
        const parser = new parser_1.Parser(tokens);
        const arbol = parser.parsear();
        const generador = new generador_1.Generador(arbol);
        return generador.generar();
    }
    catch (error) {
        if (error instanceof tipos_1.TelarError) {
            console.error(error.formatear(nombreArchivo));
        }
        else {
            console.error(error);
        }
        return null;
    }
}
function leerArchivo(ruta) {
    if (!fs.existsSync(ruta)) {
        console.error(`\n✗  No se encontró el archivo: ${ruta}\n`);
        return null;
    }
    if (!ruta.endsWith('.telar')) {
        console.error(`\n✗  El archivo debe tener extensión .telar\n`);
        return null;
    }
    return fs.readFileSync(ruta, 'utf-8');
}
function parsearArgs(args, salidaDefault) {
    if (args.length === 0) {
        console.error(`\n✗  Falta el archivo .telar\n`);
        console.error(`   Ejemplo: telar compilar app.telar\n`);
        process.exit(1);
    }
    const archivo = args[0];
    const indiceO = args.indexOf('-o');
    const salida = indiceO !== -1 && args[indiceO + 1]
        ? args[indiceO + 1]
        : salidaDefault;
    return { archivo, salida };
}
//# sourceMappingURL=cli.js.map