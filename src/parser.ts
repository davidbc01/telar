// ---
// parser.ts
// Convierte la lista de tokens del lexer en un árbol (AST)
// Es el segundo paso del compilador
// ---

import {
    Token, TipoToken, TelarError,
    NodoAplicacion, NodoPagina, NodoDatos, NodoCamposDatos,
    NodoTitulo, NodoDescripcion, NodoMostrar, NodoBoton,
    NodoCampo, NodoSi, NodoOptimizar, NodoCache, NodoReintentar,
    NodoUsar, NodoCodigo, NodoDiseno, NodoComponente, NodoUsoComponente,
    NodoVariable, NodoTextoVariable, NodoImagen,
    Nodo, TipoDato, TipoCampo, ModificadorMostrar, Condicion, AccionBoton
} from './tipos'
import { Errores } from './errores'

export class Parser {
    private tokens: Token[]
    private posicion: number = 0
 
    constructor(tokens: Token[]) {
        this.tokens = tokens.filter(t =>
            t.tipo !== TipoToken.NuevaLinea
        )
    }
 
    parsear(): NodoAplicacion {
        if (this.tokens.length === 0 || this.actual().tipo === TipoToken.FinArchivo) {
            throw new TelarError(Errores.archivoVacio())
        }
 
        if (this.actual().tipo !== TipoToken.Aplicacion) {
            throw new TelarError(
                Errores.faltaAplicacion(this.actual().linea, this.actual().columna)
            )
        }
 
        const app = this.parsearAplicacion()
        this.validarReferencias(app)
        return app
    }

    // Detecta referencias a diseños y componentes que no existen — antes
    // esto compilaba en silencio (el diseño simplemente no se aplicaba, o
    // el componente generaba un comentario HTML fácil de no ver nunca).
    // Ahora es un error de compilación, con las opciones válidas a mano.
    private validarReferencias(app: NodoAplicacion) {
        const nombresDisenos = app.disenos.map(d => d.nombre)
        const nombresComponentes = app.componentes.map(c => c.nombre)

        for (const pagina of app.paginas) {
            if (pagina.diseno && !nombresDisenos.includes(pagina.diseno)) {
                throw new TelarError(
                    Errores.disenoNoExiste(pagina.diseno, nombresDisenos, pagina.linea, 1)
                )
            }
            this.validarNodosHijos(pagina.hijos, nombresComponentes)
        }

        for (const diseno of app.disenos) {
            this.validarNodosHijos(diseno.hijos, nombresComponentes)
        }
    }

    private validarNodosHijos(hijos: Nodo[], nombresComponentes: string[]) {
        for (const nodo of hijos) {
            if (nodo.tipo === 'uso_componente' && !nombresComponentes.includes(nodo.nombre)) {
                throw new TelarError(
                    Errores.componenteNoExiste(nodo.nombre, nombresComponentes, nodo.linea, 1)
                )
            }

            if (nodo.tipo === 'mostrar' && nodo.componentePlantilla &&
                !nombresComponentes.includes(nodo.componentePlantilla)) {
                throw new TelarError(
                    Errores.componentePlantillaNoExiste(nodo.componentePlantilla, nombresComponentes, nodo.linea, 1)
                )
            }

            // Recorrer bloques anidados (si/si no, si falla, si funciona)
            if (nodo.tipo === 'si') {
                this.validarNodosHijos(nodo.entonces, nombresComponentes)
                if (nodo.siNo) this.validarNodosHijos(nodo.siNo, nombresComponentes)
            }
            if (nodo.tipo === 'mostrar') {
                if (nodo.siFalla) this.validarNodosHijos(nodo.siFalla, nombresComponentes)
                if (nodo.siFunciona) this.validarNodosHijos(nodo.siFunciona, nombresComponentes)
            }
            if (nodo.tipo === 'boton' && nodo.siFalla) {
                this.validarNodosHijos(nodo.siFalla, nombresComponentes)
            }
        }
    }
 
    // ── aplicación MiTienda ─────────────────────────────────────
 
    private parsearAplicacion(): NodoAplicacion {
        const token = this.consumir(TipoToken.Aplicacion)
 
        if (this.actual().tipo !== TipoToken.Nombre) {
            throw new TelarError(
                Errores.nombreAplicacion(this.actual().linea, this.actual().columna)
            )
        }
 
        const nombre = this.consumir(TipoToken.Nombre).valor
        let idioma = "español"
        const estilos: string[] = []
        const paginas: NodoPagina[] = []
        const datos: NodoDatos[] = []
        const disenos: NodoDiseno[] = []
        const componentes: NodoComponente[] = []
        let tema: "automatico" | "oscuro" | "claro" = "automatico"
        let dominio: string | undefined
        let favicon: string | undefined
        const metasPersonalizadas: { nombre: string; valor: string }[] = []
 
        // Leer hijos de la aplicación
        while (!this.finArchivo()) {
            const actual = this.actual()
 
            // Saltar tokens de indentación a nivel raíz
            if (actual.tipo === TipoToken.Indentacion || 
                actual.tipo === TipoToken.FinIndentacion) {
                this.avanzar()
                continue
            }
 
            if (actual.tipo === TipoToken.Idioma) {
                this.avanzar()
                idioma = this.consumirIdentificador().valor
                continue
            }
 
            // tema oscuro / tema claro / tema automático
            if (actual.tipo === TipoToken.Tema) {
                this.avanzar()
                const valor = this.consumirIdentificador().valor.toLowerCase()
                if (valor === "oscuro" || valor === "claro") {
                    tema = valor
                }
                continue
            }

            // dominio "https://mitienda.com"
            if (actual.tipo === TipoToken.Dominio) {
                this.avanzar()
                dominio = this.consumir(TipoToken.Texto).valor
                continue
            }

            // favicon "https://.../favicon.ico"
            if (actual.tipo === TipoToken.Favicon) {
                this.avanzar()
                favicon = this.consumir(TipoToken.Texto).valor
                continue
            }

            // meta "theme-color" "#0B0B0D"
            if (actual.tipo === TipoToken.Meta) {
                this.avanzar()
                const nombre = this.consumir(TipoToken.Texto).valor
                const valor = this.consumir(TipoToken.Texto).valor
                metasPersonalizadas.push({ nombre, valor })
                continue
            }
 
            // estilos "https://cdn.tailwindcss.com"
            if (actual.tipo === TipoToken.Estilos) {
                this.avanzar()
                estilos.push(this.consumir(TipoToken.Texto).valor)
                continue
            }
 
            if (actual.tipo === TipoToken.Datos) {
                datos.push(this.parsearDatos())
                continue
            }
 
            if (actual.tipo === TipoToken.Pagina) {
                paginas.push(this.parsearPagina())
                continue
            }
 
            // diseño principal
            if (actual.tipo === TipoToken.Diseno) {
                disenos.push(this.parsearDiseno())
                continue
            }
 
            // componente TarjetaProducto
            if (actual.tipo === TipoToken.Componente) {
                componentes.push(this.parsearComponente())
                continue
            }
 
            this.avanzar()
        }
    
        return {
            tipo: "aplicacion",
            nombre,
            idioma,
            estilos,
            paginas,
            datos,
            disenos,
            componentes,
            tema,
            dominio,
            favicon,
            metasPersonalizadas,
            linea: token.linea
        }
    }
 
    // ── diseño principal ────────────────────────────────────────
 
    private parsearDiseno(): NodoDiseno {
        const token = this.consumir(TipoToken.Diseno)
        const nombre = this.consumirIdentificador().valor
        const { hijos } = this.parsearBloquePagina()
        return { tipo: "diseno", nombre, hijos, linea: token.linea }
    }
 
    // ── componente TarjetaProducto ──────────────────────────────
 
    private parsearComponente(): NodoComponente {
        const token = this.consumir(TipoToken.Componente)
        const nombre = this.consumir(TipoToken.Nombre).valor
        const hijos = this.parsearBloqueIndentado()
        return { tipo: "componente", nombre, hijos, linea: token.linea }
    }
 
    // TarjetaProducto con producto
    private parsearUsoComponente(): NodoUsoComponente {
        const token = this.consumir(TipoToken.Nombre)
        this.consumir(TipoToken.Con)
        const argumento = this.consumirIdentificador().valor
        return { tipo: "uso_componente", nombre: token.valor, argumento, linea: token.linea }
    }
 
  // ── datos Producto ──────────────────────────────────────────
 
    private parsearDatos(): NodoDatos {
        const token = this.consumir(TipoToken.Datos)
        const nombre = this.consumir(TipoToken.Nombre).valor
        const campos: NodoCamposDatos[] = []
 
        if (this.actual().tipo === TipoToken.Indentacion) {
            this.avanzar()
            let intentos = 0
            while (!this.finArchivo() && this.actual().tipo !== TipoToken.FinIndentacion) {
                intentos++
                if (intentos > 20) {
                    break
                }
                const campo = this.parsearCampoDatos()
                if (campo) campos.push(campo)
            }
            if (this.actual().tipo === TipoToken.FinIndentacion) this.avanzar()
        }
 
        return { tipo: "datos", nombre, campos, linea: token.linea }
    }
 
    private parsearCampoDatos(): NodoCamposDatos | null {
        // Un campo de datos es cualquier palabra seguida de ":" — incluso si
        // esa palabra coincide con una palabra reservada en otro contexto
        // (ej. un modelo con un campo llamado "imagen" o "texto")
        if (this.siguiente()?.tipo !== TipoToken.DosPuntos) {
            this.avanzar()
            return null
        }
    
        const nombreToken = this.actual()
        this.avanzar()
        this.consumir(TipoToken.DosPuntos)
    
        const tipoDato = this.parsearTipoDato()
    
        return {
            tipo: "campo_datos",
            nombre: nombreToken.valor,
            tipoCampo: tipoDato,
            linea: nombreToken.linea
        }
    }
 
    private parsearTipoDato(): TipoDato {
        const token = this.actual()
        const valor = token.valor.toLowerCase()
    
        const tipos: Record<string, TipoDato> = {
            "texto": "texto",
            "número": "número",
            "numero": "número",
            "fecha": "fecha",
            "foto": "foto",
            "verdad": "verdad",
            "lista": "lista",
        }
    
        if (tipos[valor]) {
            this.avanzar()
            // Si es lista, saltar "de NombreModelo"
            if (tipos[valor] === "lista") {
                if (this.actual().valor === "de") this.avanzar()
                if (this.actual().tipo === TipoToken.Nombre) this.avanzar()
            }
            return tipos[valor]
        }
    
        throw new TelarError(
            Errores.tipoDatoDesconocido(token.valor, token.linea, token.columna)
        )
    }
 
  // ── página inicio en "/" ────────────────────────────────────
 
    private parsearPagina(): NodoPagina {
        const token = this.consumir(TipoToken.Pagina)
        const nombre = this.consumirIdentificador().valor
        this.consumir(TipoToken.En)
        const ruta = this.consumir(TipoToken.Texto).valor
        const parametros = this.extraerParametrosRuta(ruta)
        const { hijos, diseno } = this.parsearBloquePagina()
        return { tipo: "pagina", nombre, ruta, hijos, diseno, parametros, linea: token.linea }
    }

    // "/producto/(id)" -> ["id"]
    private extraerParametrosRuta(ruta: string): string[] {
        const coincidencias = ruta.match(/\(([a-zA-Z_][a-zA-Z0-9_]*)\)/g) ?? []
        return coincidencias.map(m => m.slice(1, -1))
    }
 
  // ── Nodos dentro de una página ──────────────────────────────
 
    private parsearNodo(): Nodo | null {
        const actual = this.actual()
 
        if (actual.tipo === TipoToken.Indentacion || actual.tipo === TipoToken.FinIndentacion) {
            this.avanzar()
            return null
        }
 
        // Uso de componente: NombreComponente con producto
        if (actual.tipo === TipoToken.Nombre && this.siguiente()?.tipo === TipoToken.Con) {
            return this.parsearUsoComponente()
        }
 
        switch (actual.tipo) {
            case TipoToken.Titulo:      return this.parsearTitulo()
            case TipoToken.Descripcion: return this.parsearDescripcion()
            case TipoToken.Mostrar:     return this.parsearMostrar()
            case TipoToken.Boton:       return this.parsearBoton()
            case TipoToken.Campo:       return this.parsearCampo()
            case TipoToken.Si:          return this.parsearSi()
            case TipoToken.Optimizar:   return this.parsearOptimizar()
            case TipoToken.Cache:       return this.parsearCache()
            case TipoToken.Reintentar:  return this.parsearReintentar()
            case TipoToken.Usar:        return this.parsearUsar()
            case TipoToken.Codigo:      return this.parsearCodigo()
            case TipoToken.Variable:    return this.parsearVariable()
            case TipoToken.PalabraTexto: return this.parsearTextoVariable()
            case TipoToken.Imagen:      return this.parsearImagen()
            default:
            this.avanzar()
            return null
        }
    }
 
    // título "Bienvenido"
    private parsearTitulo(): NodoTitulo {
        const token = this.consumir(TipoToken.Titulo)
        const texto = this.consumir(TipoToken.Texto).valor
        const clase = this.leerClaseOpcional()
        return { tipo: "titulo", texto, clase, linea: token.linea }
    }

    // variable cuenta = 0
    private parsearVariable(): NodoVariable {
        const token = this.consumir(TipoToken.Variable)
        const nombre = this.consumirIdentificador().valor
        this.consumir(TipoToken.Igual)
        const valorInicial = parseInt(this.consumir(TipoToken.Numero).valor)
        return { tipo: "variable", nombre, valorInicial, linea: token.linea }
    }

    // texto cuenta
    private parsearTextoVariable(): NodoTextoVariable {
        const token = this.consumir(TipoToken.PalabraTexto)
        const nombre = this.consumirIdentificador().valor
        const clase = this.leerClaseOpcional()
        return { tipo: "texto_variable", nombre, clase, linea: token.linea }
    }

    // imagen "https://.../foto.jpg"
    private parsearImagen(): NodoImagen {
        const token = this.consumir(TipoToken.Imagen)
        const url = this.consumir(TipoToken.Texto).valor
        const clase = this.leerClaseOpcional()
        return { tipo: "imagen", url, clase, linea: token.linea }
    }
 
    // descripción "..."
    private parsearDescripcion(): NodoDescripcion {
        const token = this.consumir(TipoToken.Descripcion)
        const texto = this.consumir(TipoToken.Texto).valor
        const clase = this.leerClaseOpcional()
        return { tipo: "descripcion", texto, clase, linea: token.linea }
    }
 
    // mostrar Producto recientes / mostrar producto.nombre
    private parsearMostrar(): NodoMostrar {
        const token = this.consumir(TipoToken.Mostrar)
        const modeloToken = this.actual()
        const modelo = modeloToken.valor
        this.avanzar()
        const clase = this.leerClaseOpcional()
 
        const modificadores: ModificadorMostrar[] = []
        let siFalla: Nodo[] | undefined
        let siFunciona: Nodo[] | undefined
        let componentePlantilla: string | undefined
 
        // Los modificadores pueden venir directamente o en bloque indentado
        const leerModificadores = () => {
            while (!this.finArchivo()) {
                const t = this.actual()
 
                if (t.tipo === TipoToken.Indentacion) {
                    this.avanzar()
                    continue
                }
 
                if (t.tipo === TipoToken.FinIndentacion) {
                    break
                }
 
                if (t.tipo === TipoToken.Recientes) {
                    modificadores.push({ tipo: "recientes" })
                    this.avanzar()
                    continue
                }
 
                if (t.tipo === TipoToken.Maximo) {
                    this.avanzar()
                    const cantidad = parseInt(this.consumir(TipoToken.Numero).valor)
                    modificadores.push({ tipo: "maximo", cantidad })
                    continue
                }
 
                if (t.tipo === TipoToken.Ordenados) {
                    this.avanzar()
                    if (this.actual().tipo === TipoToken.Por) this.avanzar()
                    const campo = this.consumirIdentificador().valor
                    modificadores.push({ tipo: "ordenados", campo })
                    continue
                }
 
                if (t.tipo === TipoToken.Donde) {
                    this.avanzar()
                    const campo = this.consumirIdentificador().valor
                    if (this.actual().tipo === TipoToken.Igual) this.avanzar()

                    // donde id = parametro.id  →  valor viene de la ruta dinámica
                    if (this.actual().tipo === TipoToken.Identificador &&
                        this.actual().valor.startsWith('parametro.')) {
                        const parametro = this.consumirIdentificador().valor.slice('parametro.'.length)
                        modificadores.push({ tipo: "filtrados_parametro", campo, parametro })
                        continue
                    }

                    const valor = this.consumir(TipoToken.Texto).valor
                    modificadores.push({ tipo: "filtrados", campo, valor })
                    continue
                }
 
                if (t.tipo === TipoToken.Con) {
                    this.avanzar()
                    componentePlantilla = this.consumir(TipoToken.Nombre).valor
                    continue
                }

                if (t.tipo === TipoToken.Si && this.siguiente()?.tipo === TipoToken.Falla) {
                    this.avanzar()
                    this.avanzar()
                    siFalla = this.parsearBloqueIndentado()
                    continue
                }
 
                if (t.tipo === TipoToken.Si && this.siguiente()?.tipo === TipoToken.Funciona) {
                    this.avanzar()
                    this.avanzar()
                    siFunciona = this.parsearBloqueIndentado()
                    continue
                }
 
                break
            }
        }
 
        leerModificadores()
 
        return { tipo: "mostrar", modelo, modificadores, clase, componentePlantilla, siFalla, siFunciona, linea: token.linea }
    }
 
    // botón "Entrar" clase "..." ir a login
    // botón "Sumar" suma cuenta
    // botón "Guardar" guardar
    private parsearBoton(): NodoBoton {
        const token = this.consumir(TipoToken.Boton)
        const texto = this.consumir(TipoToken.Texto).valor
        const clase = this.leerClaseOpcional()

        const accionToken = this.actual()
        let accion: AccionBoton
        let destino: string
        let operacion: "sumar" | "restar" | "cambiar_tema" | undefined
        let variable: string | undefined

        if (accionToken.tipo === TipoToken.Ir) {
            this.avanzar()
            if (this.actual().valor === "a") this.avanzar()
            accion = "ir"
            // "ir a" acepta una URL externa entre comillas o el nombre
            // de una página interna sin comillas
            destino = this.actual().tipo === TipoToken.Texto
                ? this.consumir(TipoToken.Texto).valor
                : this.consumirIdentificador().valor

        } else if (accionToken.tipo === TipoToken.Suma) {
            this.avanzar()
            accion = "hacer"
            operacion = "sumar"
            variable = this.consumirIdentificador().valor
            destino = `sumar_${variable}`

        } else if (accionToken.tipo === TipoToken.Resta) {
            this.avanzar()
            accion = "hacer"
            operacion = "restar"
            variable = this.consumirIdentificador().valor
            destino = `restar_${variable}`

        } else if (accionToken.tipo === TipoToken.Alterna && this.siguiente()?.tipo === TipoToken.Tema) {
            this.avanzar() // alterna
            this.avanzar() // tema
            accion = "hacer"
            operacion = "cambiar_tema"
            destino = "cambiar_tema"

        } else if (accionToken.tipo === TipoToken.Identificador || accionToken.tipo === TipoToken.Nombre) {
            // acción personalizada: botón "Guardar" guardar
            accion = "hacer"
            destino = this.consumirIdentificador().valor

        } else {
            throw new TelarError(
                Errores.seEsperaba('"ir a", "suma", "resta", "alterna tema" o el nombre de una acción',
                    accionToken.valor, accionToken.linea, accionToken.columna)
            )
        }
 
        // Leer bloque "si falla" opcional después del botón
        let siFalla: Nodo[] | undefined
        if (this.actual().tipo === TipoToken.Si && this.siguiente()?.tipo === TipoToken.Falla) {
            this.avanzar() // si
            this.avanzar() // falla
            siFalla = this.parsearBloque()
        }
 
        return { tipo: "boton", texto, accion, destino, operacion, variable, clase, siFalla, linea: token.linea }
    }
 
    // campo "Correo" email
    private parsearCampo(): NodoCampo {
        const token = this.consumir(TipoToken.Campo)
        const etiqueta = this.consumir(TipoToken.Texto).valor
    
        const tipoCampo = this.parsearTipoCampo()
        const clase = this.leerClaseOpcional()

        let requerido = false
        let minimo: number | undefined
        let maximo: number | undefined

        while (true) {
            const t = this.actual()

            if (t.tipo === TipoToken.Requerido) {
                this.avanzar()
                requerido = true
                continue
            }

            if (t.tipo === TipoToken.Minimo) {
                this.avanzar()
                minimo = parseInt(this.consumir(TipoToken.Numero).valor)
                this.saltarPalabraOpcional('caracteres')
                continue
            }

            if (t.tipo === TipoToken.Maximo) {
                this.avanzar()
                maximo = parseInt(this.consumir(TipoToken.Numero).valor)
                this.saltarPalabraOpcional('caracteres')
                continue
            }

            break
        }
    
        return { tipo: "campo", etiqueta, tipoCampo, clase, requerido, minimo, maximo, linea: token.linea }
    }

    // Salta una palabra suelta y opcional (ej. "caracteres" en "mínimo 8 caracteres")
    private saltarPalabraOpcional(palabra: string) {
        if (this.actual().valor?.toLowerCase() === palabra) {
            this.avanzar()
        }
    }
 
    private parsearTipoCampo(): TipoCampo {
        const token = this.actual()
        const valor = token.valor.toLowerCase()
    
        const tipos: Record<string, TipoCampo> = {
            "texto": "texto",
            "email": "email",
            "contraseña": "contraseña",
            "numero": "numero",
            "número": "numero",
        }
    
        if (tipos[valor]) {
            this.avanzar()
            return tipos[valor]
        }
    
        // "área de texto" son tres tokens
        if (valor === "área" || valor === "area") {
            this.avanzar()
            if (this.actual().valor === "de") this.avanzar()
            if (this.actual().valor === "texto") this.avanzar()
            return "área de texto"
        }
    
        throw new TelarError(
            Errores.tipoCampoDesconocido(token.valor, token.linea, token.columna)
        )
    }
 
    // si el usuario está conectado / si hay resultados / si no
    private parsearSi(): NodoSi {
        const token = this.consumir(TipoToken.Si)
 
        // "si falla" — bloque de error
        if (this.actual().tipo === TipoToken.Falla) {
            this.avanzar()
            const entonces = this.parsearBloqueIndentado()
            return {
                tipo: "si",
                condicion: { tipo: "hay_resultados" },
                entonces,
                linea: token.linea
            }
        }
 
        // "si funciona" — bloque de éxito
        if (this.actual().tipo === TipoToken.Funciona) {
            this.avanzar()
            const entonces = this.parsearBloqueIndentado()
            return {
                tipo: "si",
                condicion: { tipo: "hay_resultados" },
                entonces,
                linea: token.linea
            }
        }
    
        // "si no" — rama else
        if (this.actual().tipo === TipoToken.SiNo) {
            this.avanzar()
            const entonces = this.parsearBloque()
            return {
                tipo: "si",
                condicion: { tipo: "hay_resultados" }, // placeholder
                entonces,
                linea: token.linea
            }
        }
    
        const condicion = this.parsearCondicion()
        const entonces = this.parsearBloque()
        let siNo: Nodo[] | undefined
    
        // Buscar "si no" al mismo nivel
        if (this.actual().tipo === TipoToken.Si && this.siguiente()?.tipo === TipoToken.SiNo) {
            this.avanzar() // si
            this.avanzar() // no
            siNo = this.parsearBloque()
        }
        
        return { tipo: "si", condicion, entonces, siNo, linea: token.linea }
    }
 
    private parsearCondicion(): Condicion {
        const t = this.actual()
 
        // si el usuario está conectado / si el usuario es administrador
        if (t.tipo === TipoToken.El || t.tipo === TipoToken.La) {
            this.avanzar()
            if (this.actual().valor === "usuario") {
                this.avanzar()
                if (this.actual().tipo === TipoToken.Esta) {
                    this.avanzar()
                    if (this.actual().valor === "conectado") {
                        this.avanzar()
                        return { tipo: "usuario_conectado" }
                    }
                }
                if (this.actual().tipo === TipoToken.Es) {
                    this.avanzar()
                    if (this.actual().valor === "administrador") {
                        this.avanzar()
                        return { tipo: "usuario_admin" }
                    }
                }
            }
        }
 
        // si hay resultados
        if (t.tipo === TipoToken.Hay) {
            this.avanzar()
            if (this.actual().valor === "resultados") {
                this.avanzar()
                return { tipo: "hay_resultados" }
            }
        }
 
        // si producto.stock > 0
        if (t.tipo === TipoToken.Identificador) {
            const campo = t.valor
            this.avanzar()
            if (this.actual().tipo === TipoToken.Mayor) {
                this.avanzar()
                const valor = parseFloat(this.consumir(TipoToken.Numero).valor)
                return { tipo: "campo_mayor", campo, valor }
            }
            if (this.actual().tipo === TipoToken.Igual) {
                this.avanzar()
                const valor = this.consumir(TipoToken.Texto).valor
                return { tipo: "campo_igual", campo, valor }
            }
        }
 
        throw new TelarError(
            Errores.condicionDesconocida(t.valor, t.linea, t.columna)
        )
    }
 
    // optimizar para móvil
    private parsearOptimizar(): NodoOptimizar {
        const token = this.consumir(TipoToken.Optimizar)
        if (this.actual().tipo === TipoToken.Para) this.avanzar()
        if (this.actual().tipo === TipoToken.Movil) this.avanzar()
        return { tipo: "optimizar", objetivo: "movil", linea: token.linea }
    }
 
    // caché 10 minutos
    private parsearCache(): NodoCache {
        const token = this.consumir(TipoToken.Cache)
        const cantidad = parseInt(this.consumir(TipoToken.Numero).valor)
        const unidad = this.actual().tipo === TipoToken.Horas ? "horas" : "minutos"
        this.avanzar()
        return { tipo: "cache", cantidad, unidad, linea: token.linea }
    }
 
    // reintentar en 5 segundos
    private parsearReintentar(): NodoReintentar {
        const token = this.consumir(TipoToken.Reintentar)
        if (this.actual().tipo === TipoToken.En) this.avanzar()
        const segundos = parseInt(this.consumir(TipoToken.Numero).valor)
        if (this.actual().tipo === TipoToken.Segundos) this.avanzar()
        return { tipo: "reintentar", segundos, linea: token.linea }
    }
 
    // usar formulario
    private parsearUsar(): NodoUsar {
        const token = this.consumir(TipoToken.Usar)
        const paquete = this.consumirIdentificador().valor
        return { tipo: "usar", paquete, linea: token.linea }
    }
 
    // código ... fin código
    private parsearCodigo(): NodoCodigo {
        const token = this.actual()
        const contenido = token.valor
        this.avanzar()
        return { tipo: "codigo", contenido, linea: token.linea }
    }
 
    // ── Helpers ─────────────────────────────────────────────────
 
    // Lee "clase \"...\"" si existe, si no devuelve undefined
    private leerClaseOpcional(): string | undefined {
        if (this.actual().tipo === TipoToken.Clase) {
            this.avanzar()
            return this.consumir(TipoToken.Texto).valor
        }
        return undefined
    }
 
    private parsearBloque(): Nodo[] {
        return this.parsearBloqueIndentado()
    }
 
    private parsearBloqueIndentado(): Nodo[] {
        const nodos: Nodo[] = []
 
        if (this.actual().tipo !== TipoToken.Indentacion) {
            return nodos
        }
        this.avanzar() // consumir INDENTACION de apertura
 
        while (!this.finArchivo()) {
            const t = this.actual().tipo
 
            if (t === TipoToken.FinIndentacion) {
            this.avanzar() // consumir FIN_INDENTACION
            break          // siempre parar — un nivel, un bloque
            }
 
            if (t === TipoToken.Pagina || t === TipoToken.Datos || t === TipoToken.Diseno ||
                t === TipoToken.Componente || t === TipoToken.FinArchivo) {
            break
            }
 
            const nodo = this.parsearNodo()
            if (nodo) nodos.push(nodo)
        }
 
        return nodos
    }
 
    // Bloque de una página o de un diseño. A diferencia de parsearBloqueIndentado,
    // permite continuar tras un FIN_INDENTACION si vuelve el mismo nivel (varios
    // sub-bloques hermanos), y reconoce "diseño <nombre>" como una referencia,
    // no como el inicio de una nueva declaración de diseño.
    private parsearBloquePagina(): { hijos: Nodo[]; diseno?: string } {
        const nodos: Nodo[] = []
        let diseno: string | undefined
 
        if (this.actual().tipo !== TipoToken.Indentacion) {
            return { hijos: nodos, diseno }
        }
        this.avanzar()
 
        while (!this.finArchivo()) {
            const t = this.actual().tipo
 
            if (t === TipoToken.FinIndentacion) {
                this.avanzar()
                // Si viene otro INDENTACION, es el mismo nivel de página — continuar
                if (this.actual().tipo === TipoToken.Indentacion) {
                    this.avanzar()
                    continue
                }
                break
            }
 
            if (t === TipoToken.Pagina || t === TipoToken.Datos || t === TipoToken.Componente ||
                t === TipoToken.FinArchivo) {
                break
            }
 
            // diseño principal — referencia al diseño a usar, no una declaración
            if (t === TipoToken.Diseno) {
                this.avanzar()
                diseno = this.consumirIdentificador().valor
                continue
            }
 
            const nodo = this.parsearNodo()
            if (nodo) nodos.push(nodo)
        }
 
        return { hijos: nodos, diseno }
    }
 
    private consumir(tipo: TipoToken): Token {
        const token = this.actual()
        if (token.tipo !== tipo) {
            throw new TelarError(
                Errores.seEsperaba(tipo, token.valor, token.linea, token.columna)
            )
        }
        this.avanzar()
        return token
    }
 
    private consumirIdentificador(): Token {
        const token = this.actual()
        if (token.tipo !== TipoToken.Identificador && token.tipo !== TipoToken.Nombre) {
            throw new TelarError(
                Errores.seEsperaba("un nombre", token.valor, token.linea, token.columna)
            )
        }
        this.avanzar()
        return token
    }
 
    private actual(): Token {
        return this.tokens[this.posicion] ?? {
            tipo: TipoToken.FinArchivo, valor: "", linea: 0, columna: 0
        }
    }
 
    private siguiente(): Token | null {
        return this.tokens[this.posicion + 1] ?? null
    }
 
    private avanzar(): void {
        this.posicion++
    }
 
    private finArchivo(): boolean {
        return this.posicion >= this.tokens.length || this.actual().tipo === TipoToken.FinArchivo
    }
}
