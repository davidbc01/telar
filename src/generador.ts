// ---
// generador.ts
// Convierte el AST en HTML + CSS + JS básico
// ---

import {
    NodoAplicacion, NodoPagina, Nodo,
    NodoTitulo, NodoDescripcion, NodoMostrar,
    NodoBoton, NodoCampo, NodoSi,
    NodoOptimizar, NodoCache, NodoReintentar
} from './tipos'

export interface ArchivoGenerado {
    nombre: string // e.g. "index.html"
    contenido: string
}

export class Generador {
    private app: NodoAplicacion

    constructor(app: NodoAplicacion) {
        this.app = app
    }

    generar(): ArchivoGenerado[] {
        const archivos: ArchivoGenerado[] = []

        // Generar una página HTML por cada página Telar
        for (const pagina of this.app.paginas) {
            const nombreArchivo = this.rutaANombre(pagina.ruta)
            const contenido = this.generarPagina(pagina)
            archivos.push({ nombre: nombreArchivo, contenido })
        }

        // Generar CSS compartido
        archivos.push({
            nombre: 'telar.css',
            contenido: this.generarCSS()
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

        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapar(titulo)}</title>
    ${descripcion ? `<meta name="description" content="${this.escapar(descripcion)}">` : ''}
    ${tieneCache ? '<meta http-equiv="Cache-Control" content="max-age=600">' : ''}
    ${esMovil ? '<meta name="mobile-web-app-capable" content="yes">' : ''}
    <link rel="stylesheet" href="telar.css">
</head>
<body>
    <main role="main">
${this.indentar(cuerpo, 4)}
    </main>
    <script src="telar.js" defer></script>
</body>
</html>`
    }

    // --- Nodos ---

    private generarNodo(nodo: Nodo): string {
        switch (nodo.tipo) {
            case 'titulo':      return this.generarTitulo(nodo)
            case 'descripcion': return this.generarDescripcion(nodo)
            case 'mostrar':     return this.generarMostrar(nodo)
            case 'boton':       return this.generarBoton(nodo)
            case 'campo':       return this.generarCampo(nodo)
            case 'si':          return this.generarSi(nodo)
            case 'optimizar':   return '' // ya procesado en el head
            case 'cache':       return '' // ya procesado en el head
            case 'reintentar':  return this.generarReintentar(nodo)
            default:            return ''
        }
    }

    // título "Bienvenido"
    private generarTitulo(nodo: NodoTitulo): string {
        return `<h1>${this.escapar(nodo.texto)}</h1>`
    }
    
    // descripción "..."
    private generarDescripcion(nodo: NodoDescripcion): string {
        return `<p class="descripcion">${this.escapar(nodo.texto)}</p>`
    }

    // mostrar Producto recientes
    private generarMostrar(nodo: NodoMostrar): string {
        const maximo = nodo.modificadores.find(m => m.tipo === 'maximo')
        const ordenados = nodo.modificadores.find(m => m.tipo === 'ordenados')
        const recientes = nodo.modificadores.find(m => m.tipo === 'recientes')
    
        // Si es un campo simple (producto.nombre)
        if (nodo.modelo.includes('.')) {
            return `<p class="campo" data-campo="${nodo.modelo}">{${nodo.modelo}}</p>`
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
    
        return `<section class="lista" ${atributos}>
    <div class="cargando" aria-live="polite">Cargando...</div>${siFallaHTML}
</section>`
    }

    // botón "Entrar" ir a login
    private generarBoton(nodo: NodoBoton): string {
        if (nodo.accion === 'ir') {
            const href = nodo.destino.startsWith('http') ? nodo.destino : `/${nodo.destino}`
            return `<a href="${href}" class="boton" role="button">${this.escapar(nodo.texto)}</a>`
        }
    
        const siFallaHTML = nodo.siFalla
            ? `\n<div class="error" role="alert" hidden>\n${this.indentar(nodo.siFalla.map(n => this.generarNodo(n)).join('\n'), 2)}\n</div>`
            : ''
    
        return `<button class="boton" data-accion="${nodo.destino}" type="button">
    ${this.escapar(nodo.texto)}
</button>${siFallaHTML}`
    }

    // campo "Correo" tipo email
    private generarCampo(nodo: NodoCampo): string {
        const id = this.textoAId(nodo.etiqueta)
        const tipo = nodo.tipoCampo === 'área de texto' ? null : nodo.tipoCampo
    
        if (!tipo) {
            return `<div class="campo-grupo">
    <label for="${id}">${this.escapar(nodo.etiqueta)}</label>
    <textarea id="${id}" name="${id}" rows="4"></textarea>
</div>`
        }
    
        return `<div class="campo-grupo">
    <label for="${id}">${this.escapar(nodo.etiqueta)}</label>
    <input type="${tipo}" id="${id}" name="${id}" ${tipo === 'email' ? 'autocomplete="email"' : ''}>
</div>`
    }

    // si el usuario está conectado
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

    // reintentar en 5 segundos
    private generarReintentar(nodo: NodoReintentar): string {
        return `<button class="reintentar" data-reintentar="${nodo.segundos}" type="button">
    Reintentar
</button>`
    }

    // --- CSS ---

    private generarCSS(): string {
        return `/* Telar — estilos base generados automáticamente */
 
*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}
 
:root {
    --color-fondo: #ffffff;
    --color-texto: #1a1a1a;
    --color-primario: #5B4AB7;
    --color-borde: #e0e0e0;
    --color-error: #dc2626;
    --radio: 8px;
    --espacio: 1rem;
    font-size: 16px;
}
 
body {
    font-family: system-ui, -apple-system, sans-serif;
    background: var(--color-fondo);
    color: var(--color-texto);
    line-height: 1.6;
    padding: var(--espacio);
}
 
main {
    max-width: 680px;
    margin: 0 auto;
    padding: var(--espacio);
}
 
h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: var(--espacio);
}
 
.descripcion {
    color: #555;
    margin-bottom: var(--espacio);
}
 
.boton {
    display: inline-block;
    padding: 0.6rem 1.2rem;
    background: var(--color-primario);
    color: white;
    border: none;
    border-radius: var(--radio);
    font-size: 1rem;
    cursor: pointer;
    text-decoration: none;
    margin: 0.25rem 0;
}
 
.boton:hover {
    
}
 
.campo-grupo {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: var(--espacio);
}
 
label {
    font-weight: 500;
    font-size: 0.9rem;
}
 
input, textarea {
    padding: 0.6rem 0.8rem;
    border: 1px solid var(--color-borde);
    border-radius: var(--radio);
    font-size: 1rem;
    width: 100%;
}
 
input:focus, textarea:focus {
    outline: 2px solid var(--color-primario);
    border-color: transparent;
}
 
.lista {
    margin: var(--espacio) 0;
}
 
.cargando {
    color: #888;
    font-size: 0.9rem;
}
 
.error {
    color: var(--color-error);
    font-size: 0.9rem;
    padding: 0.5rem;
    border: 1px solid var(--color-error);
    border-radius: var(--radio);
    margin: 0.5rem 0;
}
 
.reintentar {
    background: none;
    border: 1px solid var(--color-borde);
    border-radius: var(--radio);
    padding: 0.4rem 0.8rem;
    cursor: pointer;
    font-size: 0.85rem;
}
 
/* Responsive — optimizar para móvil */
@media (max-width: 600px) {
    h1 { font-size: 1.5rem; }
    main { padding: 0.5rem; }
}
`
    }

    // --- Helpers ---

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
