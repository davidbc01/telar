// ---
// generador.ts
// Convierte el AST en HTML + CSS + JS básico
//
// Lógica:
//  1. Si el proyecto tiene un estilos.css local -> se copia tal cual y no se genera el CSS base
//  2. Si app.telar tiene "estilos url" -> se inyectan como <link> en el <head>
//  3. Si no hay nada -> se genera el telar.css automático
// ---

import * as fs from 'fs'
import * as path from 'path'
import {
    NodoAplicacion, NodoPagina, Nodo,
    NodoTitulo, NodoDescripcion, NodoMostrar,
    NodoBoton, NodoCampo, NodoSi,
    NodoOptimizar, NodoCache, NodoReintentar,
    NodoUsar, NodoCodigo
} from './tipos'
import { GeneradorJS } from './generador-js'

export interface ArchivoGenerado {
    nombre: string // e.g. "index.html"
    contenido: string
}

export class Generador {
    private app: NodoAplicacion
    private dirProyecto: string  // ← NUEVO: para buscar estilos.css local
 
    constructor(app: NodoAplicacion, dirProyecto: string = process.cwd()) {
        this.app = app
        this.dirProyecto = dirProyecto
    }
 
    generar(): ArchivoGenerado[] {
        const archivos: ArchivoGenerado[] = []
 
        for (const pagina of this.app.paginas) {
            const nombreArchivo = this.rutaANombre(pagina.ruta)
            const contenido = this.generarPagina(pagina)
            archivos.push({ nombre: nombreArchivo, contenido })
        }
 
        // ── Estilos ───────────────────────────────────────────
        // Prioridad: estilos.css local > CSS automático
        const rutaEstilosLocal = path.join(this.dirProyecto, 'estilos.css')
 
        if (fs.existsSync(rutaEstilosLocal)) {
            // Copiar el estilos.css del proyecto al output
            archivos.push({
                nombre: 'telar.css',
                contenido: fs.readFileSync(rutaEstilosLocal, 'utf-8')
            })
        } else {
            // Generar CSS automático
            archivos.push({
                nombre: 'telar.css',
                contenido: this.generarCSS()
            })
        }
 
        const generadorJS = new GeneradorJS(this.app)
        archivos.push({
            nombre: 'telar.js',
            contenido: generadorJS.generar()
        })
 
        return archivos
    }
 
    // --- Página completa ---
 
    private generarPagina(pagina: NodoPagina): string {
        const titulo = this.extraerTitulo(pagina) ?? this.app.nombre
        const descripcion = this.extraerDescripcion(pagina) ?? ''
        const cuerpo = pagina.hijos.map(h => this.generarNodo(h)).join('\n')
        const tieneCache = pagina.hijos.some(h => h.tipo === 'cache')
        const esMovil = pagina.hijos.some(h => h.tipo === 'optimizar')
 
        // ── Estilos externos declarados en app.telar ──────────
        // estilos "https://cdn.tailwindcss.com"
        const estilosExternos = (this.app.estilos ?? [])
            .map(url => {
                // Si es una URL externa → <link>
                if (url.startsWith('http')) {
                    return `    <link rel="stylesheet" href="${url}">`
                }
                // Si es un script (tailwind, bootstrap JS) → <script>
                if (url.endsWith('.js')) {
                    return `    <script src="${url}"></script>`
                }
                // Ruta local → <link>
                return `    <link rel="stylesheet" href="${url}">`
            })
            .join('\n')
 
        // Si hay estilos externos declarados, no enlazamos telar.css
        // (el usuario toma el control total del CSS)
        const enlaceCSS = (this.app.estilos ?? []).length === 0
            ? `    <link rel="stylesheet" href="telar.css">`
            : ''
 
        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapar(titulo)}</title>
    ${descripcion ? `<meta name="description" content="${this.escapar(descripcion)}">` : ''}
    ${tieneCache ? '<meta http-equiv="Cache-Control" content="max-age=600">' : ''}
    ${esMovil ? '<meta name="mobile-web-app-capable" content="yes">' : ''}
${enlaceCSS}
${estilosExternos}
</head>
<body>
    <main role="main">
${this.indentar(cuerpo, 4)}
    </main>
    <script src="telar.js" defer></script>
</body>
</html>`
    }
 
    // --- Nodos --- (sin cambios)
 
    private generarNodo(nodo: Nodo): string {
        switch (nodo.tipo) {
            case 'titulo':      return this.generarTitulo(nodo)
            case 'descripcion': return this.generarDescripcion(nodo)
            case 'mostrar':     return this.generarMostrar(nodo)
            case 'boton':       return this.generarBoton(nodo)
            case 'campo':       return this.generarCampo(nodo)
            case 'si':          return this.generarSi(nodo)
            case 'optimizar':   return ''
            case 'cache':       return ''
            case 'reintentar':  return this.generarReintentar(nodo)
            case 'usar':        return this.generarUsar(nodo)
            case 'codigo':      return this.generarCodigo(nodo)
            default:            return ''
        }
    }
 
    private generarTitulo(nodo: NodoTitulo): string {
        const slug = this.slugify(nodo.texto)
        return `<h1 ${this.claseHTML(`titulo titulo-${slug}`, nodo.clase)}>${this.escapar(nodo.texto)}</h1>`
    }
 
    private generarDescripcion(nodo: NodoDescripcion): string {
        const slug = this.slugify(nodo.texto.slice(0, 30))
        return `<p ${this.claseHTML(`descripcion descripcion-${slug}`, nodo.clase)}>${this.escapar(nodo.texto)}</p>`
    }
 
    private generarMostrar(nodo: NodoMostrar): string {
        const maximo = nodo.modificadores.find(m => m.tipo === 'maximo')
        const ordenados = nodo.modificadores.find(m => m.tipo === 'ordenados')
        const recientes = nodo.modificadores.find(m => m.tipo === 'recientes')
 
        if (nodo.modelo.includes('.')) {
            return `<p class="campo" data-campo="${nodo.modelo}">${nodo.modelo}</p>`
        }
 
        const atributos = [
            `data-modelo="${nodo.modelo}"`,
            maximo ? `data-maximo="${(maximo as any).cantidad}"` : '',
            ordenados ? `data-ordenar="${(ordenados as any).campo}"` : '',
            recientes ? `data-recientes="true"` : '',
        ].filter(Boolean).join(' ')
 
        const siFallaHTML = nodo.siFalla
            ? `\n  <div class="error" role="alert" hidden>\n${this.indentar(nodo.siFalla.map(n => this.generarNodo(n)).join('\n'), 4)}\n  </div>`
            : ''
 
        const claseSeccion = nodo.clase ? `lista ${nodo.clase}` : 'lista'
        return `<section class="${claseSeccion}" ${atributos}>
    <div class="cargando" aria-live="polite">Cargando...</div>${siFallaHTML}
</section>`
    }
 
    private generarBoton(nodo: NodoBoton): string {
        const slug = this.slugify(nodo.texto)
        if (nodo.accion === 'ir') {
            const href = nodo.destino.startsWith('http')
                ? nodo.destino
                : this.resolverRuta(nodo.destino)
            return `<a href="${href}" ${this.claseHTML(`boton boton-${slug}`, nodo.clase)} role="button">${this.escapar(nodo.texto)}</a>`
        }
 
        const siFallaHTML = nodo.siFalla
            ? `\n<div class="error" role="alert" hidden>\n${this.indentar(nodo.siFalla.map(n => this.generarNodo(n)).join('\n'), 2)}\n</div>`
            : ''
 
        return `<button ${this.claseHTML(`boton boton-${slug}`, nodo.clase)} data-accion="${nodo.destino}" type="button">
    ${this.escapar(nodo.texto)}
</button>${siFallaHTML}`
    }
 
    private generarCampo(nodo: NodoCampo): string {
        const id = this.textoAId(nodo.etiqueta)
        const tipo = nodo.tipoCampo === 'área de texto' ? null : nodo.tipoCampo
        const claseInput = nodo.clase ?? ''
 
        if (!tipo) {
            return `<div class="campo-grupo">
    <label for="${id}">${this.escapar(nodo.etiqueta)}</label>
    <textarea id="${id}" name="${id}" rows="4"${claseInput ? ` class="${claseInput}"` : ''}></textarea>
</div>`
        }
 
        return `<div class="campo-grupo">
    <label for="${id}">${this.escapar(nodo.etiqueta)}</label>
    <input type="${tipo}" id="${id}" name="${id}" ${tipo === 'email' ? 'autocomplete="email"' : ''}${claseInput ? ` class="${claseInput}"` : ''}>
</div>`
    }
 
    private generarSi(nodo: NodoSi): string {
        const condicionAttr = this.condicionAAtributo(nodo.condicion)
        const entonces = nodo.entonces.map(n => this.generarNodo(n)).join('\n')
        const siNo = nodo.siNo ? nodo.siNo.map(n => this.generarNodo(n)).join('\n') : null
 
        const entoncesHTML = `<div data-si="${condicionAttr}">\n${this.indentar(entonces, 2)}\n</div>`
        const siNoHTML = siNo
            ? `\n<div data-si-no="${condicionAttr}">\n${this.indentar(siNo, 2)}\n</div>`
            : ''
 
        return entoncesHTML + siNoHTML
    }
 
    private generarReintentar(nodo: NodoReintentar): string {
        return `<button class="reintentar" data-reintentar="${nodo.segundos}" type="button">
    Reintentar
</button>`
    }
 
    private generarUsar(nodo: NodoUsar): string {
        return `<div data-paquete="${nodo.paquete}" class="telar-paquete">
<!-- Paquete: ${nodo.paquete} -->
</div>`
    }
 
    private generarCodigo(nodo: NodoCodigo): string {
        return `<script>
(function() {
${nodo.contenido}
})();
</script>`
    }
 
    // --- CSS base ---
 
    private generarCSS(): string {
        return `/* Telar — estilos base generados automáticamente */
/* Para personalizar: edita estilos.css en la raíz del proyecto */
/* Para usar Tailwind: añade   estilos "https://cdn.tailwindcss.com"   en app.telar */
 
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
 
*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}
 
:root {
    --primario:       #6d4aff;
    --primario-dark:  #5535ee;
    --primario-light: #ede9ff;
    --texto:          #111827;
    --texto-suave:    #6b7280;
    --fondo:          #f9fafb;
    --superficie:     #ffffff;
    --borde:          #e5e7eb;
    --error:          #ef4444;
    --error-light:    #fef2f2;
    --exito:          #10b981;
    --radio-sm:       6px;
    --radio:          10px;
    --radio-lg:       16px;
    --sombra-sm:      0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04);
    --sombra:         0 4px 16px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.04);
    --sombra-lg:      0 10px 40px rgba(0,0,0,.12), 0 4px 8px rgba(0,0,0,.06);
    --transicion:     150ms ease;
}
 
/* ── Base ── */
 
html { font-size: 16px; scroll-behavior: smooth; }
 
body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background: var(--fondo);
    color: var(--texto);
    line-height: 1.65;
    min-height: 100vh;
}
 
/* ── Layout ── */
 
main {
    max-width: 720px;
    margin: 0 auto;
    padding: 3rem 1.5rem 5rem;
}
 
/* ── Tipografía ── */
 
h1 {
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.2;
    color: var(--texto);
    margin-bottom: 0.75rem;
}
 
h2 {
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    margin-bottom: 0.5rem;
}
 
p {
    color: var(--texto-suave);
    margin-bottom: 1rem;
}
 
.descripcion {
    font-size: 1.125rem;
    color: var(--texto-suave);
    margin-bottom: 2rem;
    max-width: 56ch;
}
 
/* ── Botones ── */
 
.boton {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
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
 
.boton:active {
    transform: translateY(0);
    box-shadow: none;
}
 
.boton-secundario {
    background: var(--superficie);
    color: var(--texto);
    border: 1px solid var(--borde);
    box-shadow: var(--sombra-sm);
}
 
.boton-secundario:hover {
    background: var(--fondo);
    box-shadow: var(--sombra);
}
 
/* ── Formularios ── */
 
.campo-grupo {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    margin-bottom: 1.25rem;
}
 
label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--texto);
}
 
input, textarea, select {
    padding: 0.625rem 0.875rem;
    border: 1.5px solid var(--borde);
    border-radius: var(--radio-sm);
    font-size: 1rem;
    font-family: inherit;
    color: var(--texto);
    background: var(--superficie);
    width: 100%;
    transition: border-color var(--transicion), box-shadow var(--transicion);
}
 
input::placeholder, textarea::placeholder {
    color: #9ca3af;
}
 
input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: var(--primario);
    box-shadow: 0 0 0 3px rgba(109,74,255,.15);
}
 
textarea {
    resize: vertical;
    min-height: 100px;
}
 
/* ── Tarjetas / Secciones ── */
 
.lista {
    margin: 1.5rem 0;
}
 
.lista-item {
    background: var(--superficie);
    border: 1px solid var(--borde);
    border-radius: var(--radio);
    padding: 1.25rem 1.5rem;
    margin-bottom: 0.75rem;
    box-shadow: var(--sombra-sm);
    transition: box-shadow var(--transicion), transform var(--transicion);
}
 
.lista-item:hover {
    box-shadow: var(--sombra);
    transform: translateY(-1px);
}
 
/* ── Estados ── */
 
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
 
@keyframes girar {
    to { transform: rotate(360deg); }
}
 
.error {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    color: var(--error);
    font-size: 0.875rem;
    padding: 0.875rem 1rem;
    background: var(--error-light);
    border: 1px solid #fecaca;
    border-radius: var(--radio-sm);
    margin: 0.75rem 0;
}
 
/* ── Condicionales ── */
 
[data-si], [data-si-no] { display: contents; }
 
/* ── Separadores y espaciado ── */
 
.seccion {
    margin: 2.5rem 0;
    padding-top: 2.5rem;
    border-top: 1px solid var(--borde);
}
 
/* ── Reintentar ── */
 
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
 
.reintentar:hover {
    border-color: var(--primario);
    color: var(--primario);
}
 
/* ── Responsive ── */
 
@media (max-width: 600px) {
    main { padding: 1.5rem 1rem 4rem; }
    h1 { font-size: 1.625rem; }
    .descripcion { font-size: 1rem; }
}
 
/* ── Modo oscuro ── */
 
@media (prefers-color-scheme: dark) {
    :root {
        --texto:         #f3f4f6;
        --texto-suave:   #9ca3af;
        --fondo:         #0f1117;
        --superficie:    #1a1d27;
        --borde:         #2d3148;
        --primario-light:#1e1640;
    }
    input, textarea, select { background: #1a1d27; }
}
`
    }
 
    // --- Helpers ---
 
    // Construye el atributo class combinando clase base + clase del usuario
    private claseHTML(claseBase: string, claseUsuario?: string): string {
        if (claseUsuario) {
            // Si el usuario pone clases, las añadimos a las base
            // Así funciona tanto con CSS propio como con Tailwind
            return `class="${claseBase} ${claseUsuario}"`
        }
        return `class="${claseBase}"`
    }
 
    // Genera un id/slug limpio a partir de un texto
    private slugify(texto: string): string {
        return texto.toLowerCase()
            .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
            .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ü/g, 'u')
            .replace(/ñ/g, 'n')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
    }
 
    private resolverRuta(destino: string): string {
        const destinoKebab = this.camelAKebab(destino)
        const pagina = this.app.paginas.find(p =>
            p.nombre === destino ||
            p.nombre === destinoKebab ||
            p.ruta === `/${destino}` ||
            p.ruta === `/${destinoKebab}`
        )
        return pagina ? pagina.ruta : `/${destinoKebab}`
    }
 
    private camelAKebab(texto: string): string {
        return texto.replace(/([A-Z])/g, c => '-' + c.toLowerCase())
    }
 
    private condicionAAtributo(condicion: any): string {
        switch (condicion.tipo) {
            case 'usuario_conectado': return 'usuario-conectado'
            case 'usuario_admin':     return 'usuario-admin'
            case 'hay_resultados':    return 'hay-resultados'
            case 'campo_mayor':       return `${condicion.campo}-mayor-${condicion.valor}`
            case 'campo_igual':       return `${condicion.campo}-igual-${condicion.valor}`
            default:                  return 'desconocido'
        }
    }
 
    private extraerTitulo(pagina: NodoPagina): string | null {
        const nodo = pagina.hijos.find(h => h.tipo === 'titulo') as NodoTitulo | undefined
        return nodo?.texto ?? null
    }
 
    private extraerDescripcion(pagina: NodoPagina): string | null {
        const nodo = pagina.hijos.find(h => h.tipo === 'descripcion') as NodoDescripcion | undefined
        return nodo?.texto ?? null
    }
 
    private rutaANombre(ruta: string): string {
        if (ruta === '/') return 'index.html'
        return ruta.replace(/^\//, '').replace(/\//g, '-') + '.html'
    }
 
    private textoAId(texto: string): string {
        return texto.toLowerCase()
            .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
            .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ü/g, 'u')
            .replace(/ñ/g, 'n')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
    }
 
    private escapar(texto: string): string {
        return texto
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
    }
 
    private indentar(texto: string, espacios: number): string {
        const pad = ' '.repeat(espacios)
        return texto.split('\n').map(l => l ? pad + l : l).join('\n')
    }
}
