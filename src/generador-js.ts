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
    private plantillas: Record<string, string>

    constructor(app: NodoAplicacion, plantillas: Record<string, string> = {}) {
        this.app = app
        this.plantillas = plantillas
    }

    // Todas las listas de hijos relevantes para generar JS: las de cada
    // página, y también las de cada diseño. Antes solo se miraban las
    // páginas — un botón, variable o condición dentro de un "diseño"
    // (ej. el botón de tema en un navbar compartido) nunca se registraba.
    // Un grupo por diseño realmente usado (una vez, aunque lo compartan
    // varias páginas) y un grupo por cada página, con su propio nombre
    // como contexto. El "contexto" sirve para dar nombres únicos a los
    // cargadores — antes, dos páginas con "mostrar" del mismo modelo (con
    // modificadores distintos) se pisaban entre sí en el JS generado,
    // porque el nombre de la función solo dependía del modelo.
    private todosLosHijos(): { contexto: string; hijos: Nodo[] }[] {
        const disenos = this.app.disenos ?? []
        const grupos: { contexto: string; hijos: Nodo[] }[] = []
        const disenosVistos = new Set<string>()

        for (const p of this.app.paginas) {
            const nombreDiseno = p.diseno ?? disenos[0]?.nombre
            if (nombreDiseno && !disenosVistos.has(nombreDiseno)) {
                disenosVistos.add(nombreDiseno)
                const diseno = disenos.find(d => d.nombre === nombreDiseno)
                if (diseno) grupos.push({ contexto: `diseno-${diseno.nombre}`, hijos: diseno.hijos })
            }
            grupos.push({ contexto: p.nombre, hijos: p.hijos })
        }
        return grupos
    }

    generar(): string {
        const secciones: string[] = []

        secciones.push(this.generarRuntime())
        secciones.push(this.generarCondiciones())
        secciones.push(this.generarFuncionesPlantilla())
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

    // Aplicar el tema guardado en localStorage, si el usuario ya lo cambió
    // alguna vez. Si no hay nada guardado, se respeta el que trae el HTML
    // (fijado en app.telar, o "automático" si no se declaró ninguno).
    iniciarTema() {
        try {
            const guardado = localStorage.getItem('telar_tema')
            if (guardado === 'oscuro' || guardado === 'claro') {
                document.documentElement.setAttribute('data-tema', guardado)
            }
        } catch (e) {}
    },

    // Alternar entre tema oscuro y claro, y recordarlo entre visitas
    alternarTema() {
        const actual = document.documentElement.getAttribute('data-tema')
        const nuevo = actual === 'oscuro' ? 'claro' : 'oscuro'
        document.documentElement.setAttribute('data-tema', nuevo)
        try {
            localStorage.setItem('telar_tema', nuevo)
        } catch (e) {}
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
        if (opciones.filtroCampo && opciones.filtroValor != null) {
            params.set(opciones.filtroCampo, opciones.filtroValor)
        }

        const url = \`/api/\${modelo.toLowerCase()}?\${params}\`

        try {
            const res = await fetch(url)
            if (!res.ok) throw new Error(\`Error \${res.status}\`)
            return await res.json()
        } catch (error) {
            throw error
        }
    },

    // Extraer un parámetro de la ruta actual (rutas dinámicas, ej. /producto/(id))
    parametroActual(nombre) {
        for (const clave in Telar.rutas) {
            const r = Telar.rutas[clave]
            const m = window.location.pathname.match(r.patron)
            if (!m) continue
            const i = r.nombres.indexOf(nombre)
            if (i !== -1) return decodeURIComponent(m[i + 1])
        }
        return null
    },

    // Validar todos los campos con nombre de la página (required, minlength,
    // maxlength, type=email...). Marca los errores visualmente y devuelve
    // true solo si todos los campos son válidos.
    validarCampos() {
        let valido = true
        document.querySelectorAll('input[name], textarea[name]').forEach(campo => {
            const errorEl = document.getElementById(\`\${campo.id}-error\`)
            if (!campo.checkValidity()) {
                valido = false
                campo.setAttribute('aria-invalid', 'true')
                if (errorEl) {
                    errorEl.textContent = campo.validationMessage
                    errorEl.removeAttribute('hidden')
                }
            } else {
                campo.removeAttribute('aria-invalid')
                if (errorEl) errorEl.setAttribute('hidden', '')
            }
        })
        return valido
    },

    // Recoger los valores de todos los campos con nombre en un objeto plano
    recogerCampos() {
        const datos = {}
        document.querySelectorAll('input[name], textarea[name]').forEach(campo => {
            datos[campo.name] = campo.value
        })
        return datos
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
    renderizarLista(contenedor, items, modelo, plantilla) {
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
            li.innerHTML = plantilla ? plantilla(item) : this.renderizarItem(item, modelo)
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
    },

    // Actualizar en pantalla todos los elementos que muestran esta variable
    actualizarVariable(nombre) {
        document.querySelectorAll(\`[data-variable="\${nombre}"]\`).forEach(el => {
            el.textContent = Telar.estado[nombre]
        })
    }
};

${this.generarTablaRutas()}

${this.generarEstadoInicial()}`
    }

    // --- Variables y estado local (v0.11) ---
    // Estado inicial de todas las variables de página, compartido en un solo
    // objeto global — no hay colisión real porque cada página compilada solo
    // contiene en el DOM los elementos de sus propias variables.

    private generarEstadoInicial(): string {
        // Map, no array: si un diseño comparte una variable entre varias
        // páginas, no queremos claves duplicadas en Telar.estado
        const variables = new Map<string, number>()
        for (const { hijos } of this.todosLosHijos()) {
            for (const nodo of hijos) {
                if (nodo.tipo === 'variable') {
                    variables.set(nodo.nombre, nodo.valorInicial)
                }
            }
        }

        if (variables.size === 0) return 'Telar.estado = {};'

        const entradas = Array.from(variables.entries()).map(([nombre, valorInicial]) => `    ${nombre}: ${valorInicial}`)
        return `Telar.estado = {\n${entradas.join(',\n')}\n};`
    }

    // --- Rutas dinámicas ---
    // Mapa de páginas con segmentos "(parametro)" en su ruta, para que
    // Telar.parametroActual() pueda extraerlos de la URL en el navegador.

    private generarTablaRutas(): string {
        const paginasDinamicas = this.app.paginas.filter(p => p.parametros.length > 0)
        if (paginasDinamicas.length === 0) return 'Telar.rutas = {};'

        const entradas = paginasDinamicas.map(p => {
            const patron = this.rutaARegex(p.ruta)
            const nombres = JSON.stringify(p.parametros)
            return `    ${p.nombre}: { patron: ${patron}, nombres: ${nombres} }`
        })

        return `Telar.rutas = {\n${entradas.join(',\n')}\n};`
    }

    // "/producto/(id)" -> /^\/producto\/([^\/]+)$/
    private rutaARegex(ruta: string): string {
        const escapada = ruta
            .replace(/[.*+?^${}|[\]\\/]/g, '\\$&')
            .replace(/\(([a-zA-Z_][a-zA-Z0-9_]*)\)/g, '([^\\/]+)')
        return `/^${escapada}$/`
    }

    // --- Condiciones ---
    // Aplica todas las condiciones si/sin-no de la página

    private generarCondiciones(): string {
        const condiciones = new Set<string>()
    
        for (const { hijos } of this.todosLosHijos()) {
            this.extraerCondiciones(hijos, condiciones)
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

    // --- Plantillas de componente para listas (mostrar ... con X) ---
    // Solo genera función para los componentes realmente usados así —
    // no todos los que existan en la app, para no meter código muerto.

    private generarFuncionesPlantilla(): string {
        const usados = new Set<string>()
        for (const { hijos } of this.todosLosHijos()) {
            for (const nodo of hijos) {
                if (nodo.tipo === 'mostrar' && nodo.componentePlantilla) {
                    usados.add(nodo.componentePlantilla)
                }
            }
        }

        if (usados.size === 0) return ''

        const funciones = Array.from(usados).map(nombre => {
            const html = this.plantillas[nombre]
            const definicion = (this.app.componentes ?? []).find(c => c.nombre === nombre)
            const nombreParam = definicion?.parametros[0] ?? 'item'

            if (!html) {
                return `// La plantilla "${nombre}" se referenció con "con" pero el componente no existe
function plantilla_${nombre}(${nombreParam}) { return ''; }`
            }
            return `// Plantilla del componente ${nombre}, una por elemento de la lista
function plantilla_${nombre}(${nombreParam}) {
    return \`
${html}
\`
}`
        })

        return funciones.join('\n\n')
    }

    private generarCargadores(): string {
        const cargadores: string[] = []
    
        for (const { contexto, hijos } of this.todosLosHijos()) {
            for (const nodo of hijos) {
                if (nodo.tipo === 'mostrar' && !nodo.modelo.includes('.')) {
                cargadores.push(this.generarCargador(nodo, contexto))
                }
            }
        }
    
        if (cargadores.length === 0) return ''
        return cargadores.join('\n\n')
    }

    // Nombre único por (contexto, modelo) — antes era solo "cargar${modelo}",
    // así que dos páginas mostrando el mismo modelo (con modificadores
    // distintos: máximo, donde, con-componente...) se pisaban entre sí:
    // la segunda función declarada ganaba silenciosamente sobre la primera,
    // y todas las páginas acababan usando la configuración equivocada.
    private nombreCargador(modelo: string, contexto: string): string {
        return `cargar${modelo}_${this.slugify(contexto)}`
    }

    private slugify(texto: string): string {
        return texto.toLowerCase().replace(/[^a-z0-9]+/g, '')
    }

    private generarCargador(nodo: NodoMostrar, contexto: string): string {
        const modelo = nodo.modelo
        const nombreFuncion = this.nombreCargador(modelo, contexto)
        const selector = `[data-modelo="${modelo}"][data-instancia="${this.slugify(contexto)}"]`
    
        const opciones: string[] = []
        nodo.modificadores.forEach(m => {
            if (m.tipo === 'maximo') opciones.push(`maximo: '${m.cantidad}'`)
            if (m.tipo === 'ordenados') opciones.push(`ordenar: '${m.campo}'`)
            if (m.tipo === 'recientes') opciones.push(`recientes: true`)
            if (m.tipo === 'filtrados') {
                opciones.push(`filtroCampo: '${m.campo}'`)
                opciones.push(`filtroValor: '${m.valor}'`)
            }
            if (m.tipo === 'filtrados_parametro') {
                opciones.push(`filtroCampo: '${m.campo}'`)
                opciones.push(`filtroValor: Telar.parametroActual('${m.parametro}')`)
            }
        })
    
        const reintentar = nodo.siFalla?.find(n => n.tipo === 'reintentar') as NodoReintentar | undefined
        const reintentarJS = reintentar
            ? `Telar.reintentar(() => ${nombreFuncion}(), ${reintentar.segundos});`
            : ''
    
        const siFallaMsg = nodo.siFalla?.find(n => n.tipo === 'mostrar')
        const mensajeError = siFallaMsg && 'texto' in siFallaMsg
            ? siFallaMsg.texto
            : 'Error al cargar los datos'
    
        const argPlantilla = nodo.componentePlantilla ? `, plantilla_${nodo.componentePlantilla}` : ''

        return `// Cargar ${modelo} (${contexto})
async function ${nombreFuncion}() {
    const contenedor = document.querySelector('${selector}')
    if (!contenedor) return

    try {
        const datos = await Telar.cargar('${modelo}', { ${opciones.join(', ')} })
        Telar.renderizarLista(contenedor, datos, '${modelo}'${argPlantilla})
    } catch (error) {
        Telar.mostrarError(contenedor, '${mensajeError}')
        ${reintentarJS}
    }
}`
    }

    // --- Acciones de botones ---
    // Una función por cada botón con acción "hacer"

    private generarAcciones(): string {
        const acciones = new Map<string, { operacion?: 'sumar' | 'restar' | 'cambiar_tema'; variable?: string }>()
    
        for (const { hijos } of this.todosLosHijos()) {
            this.extraerAcciones(hijos, acciones)
        }
    
        if (acciones.size === 0) return ''
    
        const funciones = Array.from(acciones.entries()).map(([accion, info]) => {
            if (info.operacion === 'cambiar_tema') return this.generarAccionTema(accion)
            if (info.operacion && info.variable) {
                return this.generarAccionVariable(accion, info.operacion, info.variable)
            }
            return this.generarAccionAPI(accion)
        })
    
        const listeners = Array.from(acciones.keys()).map(accion =>
            `  document.querySelector('[data-accion="${accion}"]')
            ?.addEventListener('click', ${accion});`
        )
    
        return `${funciones.join('\n')}
    
// Registrar listeners de acciones
function registrarAcciones() {
${listeners.join('\n')}
}`
    }

    // Acción incorporada: suma o resta 1 a una variable de página y actualiza
    // en pantalla todos los elementos que la muestran — sin llamar a ninguna API
    private generarAccionVariable(accion: string, operacion: 'sumar' | 'restar', variable: string): string {
        const delta = operacion === 'sumar' ? '+ 1' : '- 1'
        return `
// Acción: ${accion} (variable de página, sin API)
function ${accion}() {
    Telar.estado.${variable} = Telar.estado.${variable} ${delta}
    Telar.actualizarVariable('${variable}')
}`
    }

    // Acción incorporada: alterna entre tema oscuro y claro, y lo recuerda
    // entre visitas — sin llamar a ninguna API
    private generarAccionTema(accion: string): string {
        return `
// Acción: ${accion} (alterna el tema visual, sin API)
function ${accion}() {
    Telar.alternarTema()
}`
    }

    private generarAccionAPI(accion: string): string {
        return `
// Acción: ${accion}
async function ${accion}() {
    const boton = document.querySelector('[data-accion="${accion}"]')
    const errorEl = boton?.nextElementSibling

    if (!Telar.validarCampos()) return

    try {
        if (boton) boton.disabled = true
        const res = await fetch('/api/accion/${accion}', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Telar.recogerCampos())
        })
        if (!res.ok) throw new Error()
        // Acción completada — redirigir o actualizar según contexto
    } catch (error) {
        if (errorEl && errorEl.classList.contains('error')) {
            errorEl.removeAttribute('hidden')
        }
    } finally {
        if (boton) boton.disabled = false
    }
}`
    }

    private extraerAcciones(
        nodos: Nodo[],
        mapa: Map<string, { operacion?: 'sumar' | 'restar' | 'cambiar_tema'; variable?: string }>
    ) {
        for (const nodo of nodos) {
            if (nodo.tipo === 'boton' && nodo.accion === 'hacer') {
                mapa.set(nodo.destino, { operacion: nodo.operacion, variable: nodo.variable })
            }
            if (nodo.tipo === 'si') {
                this.extraerAcciones(nodo.entonces, mapa)
                if (nodo.siNo) this.extraerAcciones(nodo.siNo, mapa)
            }
        }
    }

    // --- Inicialización ---

    private generarInit(): string {
        const todosHijos = this.todosLosHijos()

        const tieneCargadores = todosHijos.some(({ hijos }) =>
            hijos.some(h => h.tipo === 'mostrar' && !('modelo' in h && (h as NodoMostrar).modelo.includes('.')))
        )
    
        const tieneCondiciones = todosHijos.some(({ hijos }) =>
            hijos.some(h => h.tipo === 'si')
        )
    
        const tieneAcciones = todosHijos.some(({ hijos }) =>
            hijos.some(h => h.tipo === 'boton' && (h as NodoBoton).accion === 'hacer')
        )
    
        const llamadas: string[] = ['  Telar.iniciarSesion();', '  Telar.iniciarTema();']
    
        if (tieneCondiciones) llamadas.push('  aplicarCondiciones();')
        if (tieneAcciones) llamadas.push('  registrarAcciones();')
    
        // Llamar a cada cargador
        for (const { contexto, hijos } of this.todosLosHijos()) {
            for (const nodo of hijos) {
                if (nodo.tipo === 'mostrar' && !('modelo' in nodo && (nodo as NodoMostrar).modelo.includes('.'))) {
                llamadas.push(`  ${this.nombreCargador((nodo as NodoMostrar).modelo, contexto)}();`)
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
