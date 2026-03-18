// ---
// generador-js.ts
// Genera el JavaScript de runtime para una aplicación Telar.
// Se encarga de condiciones dinámicas, carga de datos y acciones.
// ---

import {
    NodoAplicacion, NodoPagina, Nodo,
    NodoMostrar, NodoBoton, NodoSi,
    NodoReintentar, Condicion
} from './tipos'

export class GeneradorJS {
    private app: NodoAplicacion

    constructor(app: NodoAplicacion) {
        this.app = app
    }

    generar(): string {
        const secciones: string[] = []

        secciones.push(this.generarRuntime())
        secciones.push(this.generarCondiciones())
        secciones.push(this.generarCargadores())
        secciones.push(this.generarAcciones())
        secciones.push(this.generarInit())
    
        return secciones.join('\n\n')
    }

    // --- Runtime base ---
    // Funciones auxiliares que usa todo el código generado

    private generarRuntime(): string {
        return `// Telar runtime — generado automáticamente
'use strict';

const Telar = {
    // Estado de la sesión
    usuario: null,

    // Inicializar sesión desde localStorage
    iniciarSesion() {
        try {
            const datos = localStorage.getItem('telar_usuario')
            if (datos) this.usuario = JSON.parse(datos)
        } catch (e) {
            this.usuario = null
        }
    },

    // Comprobar condiciones
    evaluar(condicion) {
        switch (condicion) {
            case 'usuario-conectado': return this.usuario !== null
            case 'usuario-admin': return this.usuario?.rol === 'admin'
            case 'hay-resultados': return true // se actualiza dinámicamente
            default: return false
        }
    },

    // Mostrar u ocultar elementos según condición
    aplicarCondicion(condicion) {
        const elementos = document.querySelectorAll(\`[data-si="\${condicion}"]\`)
        const elementosNo = document.querySelectorAll(\`[data-si-no="\${condicion}"]\`)
        const valor = this.evaluar(condicion)

        elementos.forEach(el => {
            el.style.display = valor ? '' : 'none'
        })
        elementosNo.forEach(el => {
            el.style.display = valor ? 'none' : ''
        })
    },

    // Cargar datos desde la API
    async cargar(modelo, opciones = {}) {
        const params = new URLSearchParams()
        if (opciones.maximo)   params.set('limit', opciones.maximo)
        if (opciones.ordenar)  params.set('sort', opciones.ordenar)
        if (opciones.recientes) params.set('recientes', 'true')

        const url = \`/api/\${modelo.toLowerCase()}?\${params}\`

        try {
            const res = await fetch(url)
            if (!res.ok) throw new Error(\`Error \${res.status}\`)
            return await res.json()
        } catch (error) {
            throw error
        }
    },

    // Mostrar error en un contenedor
    mostrarError(contenedor, mensaje) {
        const errorEl = contenedor.querySelector('.error')
        const cargandoEl = contenedor.querySelector('.cargando')
        if (cargandoEl) cargandoEl.style.display = 'none'
        if (errorEl) {
            errorEl.textContent = mensaje
            errorEl.removeAttribute('hidden')
        }
    },

    // Renderizar lista de items
    renderizarLista(contenedor, items, modelo) {
        const cargandoEl = contenedor.querySelector('.cargando')
        const errorEl = contenedor.querySelector('.error')
        if (cargandoEl) cargandoEl.style.display = 'none'
        if (errorEl) errorEl.setAttribute('hidden', '')

        if (!items || items.length === 0) {
            contenedor.setAttribute('data-vacio', 'true')
            this.aplicarCondicion('hay-resultados')
            return
        }

        // Renderizar cada item
        const lista = document.createElement('ul')
        lista.className = 'telar-lista'
        items.forEach(item => {
            const li = document.createElement('li')
            li.className = 'telar-item'
            li.innerHTML = this.renderizarItem(item, modelo)
            lista.appendChild(li)
        })

        contenedor.appendChild(lista)
        this.aplicarCondicion('hay-resultados')
    },

    // Renderizar un item individual
    renderizarItem(item, modelo) {
        return Object.entries(item)
        .map(([clave, valor]) => \`<p><strong>\${clave}:</strong> \${valor}</p>\`)
        .join('')
    },

    // Reintentar una operación después de N segundos
    reintentar(fn, segundos) {
        setTimeout(fn, segundos * 1000)
    }
};`
    }

    // --- Condiciones ---
    // Aplica todas las condiciones si/sin-no de la página

    private generarCondiciones(): string {
        const condiciones = new Set<string>()
    
        for (const pagina of this.app.paginas) {
            this.extraerCondiciones(pagina.hijos, condiciones)
        }
    
        if (condiciones.size === 0) return ''
    
        const lineas = Array.from(condiciones).map(c =>
            `  Telar.aplicarCondicion('${c}');`
        )
    
        return `// Aplicar condiciones dinámicas
function aplicarCondiciones() {
${lineas.join('\n')}
}`
    }

    private extraerCondiciones(nodos: Nodo[], set: Set<string>) {
        for (const nodo of nodos) {
            if (nodo.tipo === 'si') {
                const attr = this.condicionAAtributo(nodo.condicion)
                set.add(attr)
                this.extraerCondiciones(nodo.entonces, set)
                if (nodo.siNo) this.extraerCondiciones(nodo.siNo, set)
            }
        }
    }

    // --- Cargadores de datos ---
    // Una función async por cada "mostrar Modelo"

    private generarCargadores(): string {
        const cargadores: string[] = []
    
        for (const pagina of this.app.paginas) {
            for (const nodo of pagina.hijos) {
                if (nodo.tipo === 'mostrar' && !nodo.modelo.includes('.')) {
                cargadores.push(this.generarCargador(nodo))
                }
            }
        }
    
        if (cargadores.length === 0) return ''
        return cargadores.join('\n\n')
    }

    private generarCargador(nodo: NodoMostrar): string {
        const modelo = nodo.modelo
        const atributos = [
            `data-modelo="${modelo}"`,
            ...nodo.modificadores.map(m => {
                if (m.tipo === 'maximo') return `data-maximo="${m.cantidad}"`
                if (m.tipo === 'ordenados') return `data-ordenar="${m.campo}"`
                if (m.tipo === 'recientes') return `data-recientes="true"`
                return ''
            }).filter(Boolean)
        ]
    
        const opciones: string[] = []
        nodo.modificadores.forEach(m => {
            if (m.tipo === 'maximo') opciones.push(`maximo: '${m.cantidad}'`)
            if (m.tipo === 'ordenados') opciones.push(`ordenar: '${m.campo}'`)
            if (m.tipo === 'recientes') opciones.push(`recientes: true`)
        })
    
        const reintentar = nodo.siFalla?.find(n => n.tipo === 'reintentar') as NodoReintentar | undefined
        const reintentarJS = reintentar
            ? `Telar.reintentar(() => cargar${modelo}(), ${reintentar.segundos});`
            : ''
    
        const siFallaMsg = nodo.siFalla?.find(n => n.tipo === 'mostrar')
        const mensajeError = siFallaMsg && 'texto' in siFallaMsg
            ? siFallaMsg.texto
            : 'Error al cargar los datos'
    
        return `// Cargar ${modelo}
async function cargar${modelo}() {
    const contenedor = document.querySelector('[data-modelo="${modelo}"]')
    if (!contenedor) return

    try {
        const datos = await Telar.cargar('${modelo}', { ${opciones.join(', ')} })
        Telar.renderizarLista(contenedor, datos, '${modelo}')
    } catch (error) {
        Telar.mostrarError(contenedor, '${mensajeError}')
        ${reintentarJS}
    }
}`
    }

    // --- Acciones de botones ---
    // Una función por cada botón con acción "hacer"

    private generarAcciones(): string {
        const acciones = new Set<string>()
    
        for (const pagina of this.app.paginas) {
            this.extraerAcciones(pagina.hijos, acciones)
        }
    
        if (acciones.size === 0) return ''
    
        const funciones = Array.from(acciones).map(accion => `
// Acción: ${accion}
async function ${accion}() {
    const boton = document.querySelector('[data-accion="${accion}"]')
    const errorEl = boton?.nextElementSibling

    try {
        if (boton) boton.disabled = true
        const res = await fetch('/api/accion/${accion}', { method: 'POST' })
        if (!res.ok) throw new Error()
        // Acción completada — redirigir o actualizar según contexto
    } catch (error) {
        if (errorEl && errorEl.classList.contains('error')) {
            errorEl.removeAttribute('hidden')
        }
    } finally {
        if (boton) boton.disabled = false
    }
}`)
    
        const listeners = Array.from(acciones).map(accion =>
            `  document.querySelector('[data-accion="${accion}"]')
            ?.addEventListener('click', ${accion});`
        )
    
        return `${funciones.join('\n')}
    
// Registrar listeners de acciones
function registrarAcciones() {
${listeners.join('\n')}
}`
    }

    private extraerAcciones(nodos: Nodo[], set: Set<string>) {
        for (const nodo of nodos) {
            if (nodo.tipo === 'boton' && nodo.accion === 'hacer') {
                set.add(nodo.destino)
            }
            if (nodo.tipo === 'si') {
                this.extraerAcciones(nodo.entonces, set)
                if (nodo.siNo) this.extraerAcciones(nodo.siNo, set)
            }
        }
    }

    // --- Inicialización ---

    private generarInit(): string {
        const tieneCargadores = this.app.paginas.some(p =>
            p.hijos.some(h => h.tipo === 'mostrar' && !('modelo' in h && (h as NodoMostrar).modelo.includes('.')))
        )
    
        const tieneCondiciones = this.app.paginas.some(p =>
            p.hijos.some(h => h.tipo === 'si')
        )
    
        const tieneAcciones = this.app.paginas.some(p =>
            p.hijos.some(h => h.tipo === 'boton' && (h as NodoBoton).accion === 'hacer')
        )
    
        const llamadas: string[] = ['  Telar.iniciarSesion();']
    
        if (tieneCondiciones) llamadas.push('  aplicarCondiciones();')
        if (tieneAcciones) llamadas.push('  registrarAcciones();')
    
        // Llamar a cada cargador
        for (const pagina of this.app.paginas) {
            for (const nodo of pagina.hijos) {
                if (nodo.tipo === 'mostrar' && !('modelo' in nodo && (nodo as NodoMostrar).modelo.includes('.'))) {
                llamadas.push(`  cargar${(nodo as NodoMostrar).modelo}();`)
                }
            }
        }
    
        return `// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
${llamadas.join('\n')}
});`
    }

    // --- Helpers ---

    private condicionAAtributo(condicion: Condicion): string {
        switch (condicion.tipo) {
            case 'usuario_conectado': return 'usuario-conectado'
            case 'usuario_admin': return 'usuario-admin'
            case 'hay_resultados': return 'hay-resultados'
            case 'campo_mayor': return `${condicion.campo}-mayor-${condicion.valor}`
            case 'campo_igual': return `${condicion.campo}-igual-${condicion.valor}`
            default: return 'desconocido'
        }
    }
}
