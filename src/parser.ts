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
    Nodo, TipoDato, TipoCampo, ModificadorMostrar, Condicion
} from './tipos'
import { Errores } from './errores'

export class Parser {
    private tokens: Token[]
    private posicion: number = 0

    constructor(tokens: Token[]) {
        // Filtramos tokens de indentación — el parser no los necesita
        this.tokens = tokens.filter(t =>
            t.tipo !== TipoToken.Indentacion &&
            t.tipo !== TipoToken.FinIndentacion &&
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

        return this.parsearAplicacion()
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
        const paginas: NodoPagina[] = []
        const datos: NodoDatos[] = []
 
        // Leer hijos de la aplicación
        while (!this.finArchivo()) {
            const actual = this.actual()

            if (actual.tipo === TipoToken.Idioma) {
                this.avanzar()
                idioma = this.consumirIdentificador().valor
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

            // Token no reconocido a nivel raíz — saltar
            this.avanzar()
        }
    
        return {
            tipo: "aplicacion",
            nombre,
            idioma,
            paginas,
            datos,
            linea: token.linea
        }
    }

  // ── datos Producto ──────────────────────────────────────────

    private parsearDatos(): NodoDatos {
        const token = this.consumir(TipoToken.Datos)
        const nombre = this.consumir(TipoToken.Nombre).valor
        const campos: NodoCamposDatos[] = []
    
        // Leer campos hasta encontrar otra sección de nivel raíz
        while (!this.finArchivo() && this.esNivelRaiz()) {
            const campo = this.parsearCampoDatos()
            if (campo) campos.push(campo)
        }
    
        return { tipo: "datos", nombre, campos, linea: token.linea }
    }
 
    private parsearCampoDatos(): NodoCamposDatos | null {
        if (this.actual().tipo !== TipoToken.Identificador) return null
    
        const nombreToken = this.consumirIdentificador()
    
        if (this.actual().tipo !== TipoToken.DosPuntos) return null
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
    
        if (this.actual().tipo !== TipoToken.En) {
            throw new TelarError(
                Errores.rutaPagina(nombre, this.actual().linea, this.actual().columna)
            )
        }
        this.consumir(TipoToken.En)
        const ruta = this.consumir(TipoToken.Texto).valor
        const hijos: Nodo[] = []
    
        // Leer hijos hasta encontrar otra página o fin
        while (!this.finArchivo() && !this.esSiguientePagina()) {
            const nodo = this.parsearNodo()
            if (nodo) hijos.push(nodo)
        }
    
        return { tipo: "pagina", nombre, ruta, hijos, linea: token.linea }
    }
 
  // ── Nodos dentro de una página ──────────────────────────────
 
    private parsearNodo(): Nodo | null {
        const actual = this.actual()
    
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
            default:
                this.avanzar()
                return null
        }
    }
 
    // título "Bienvenido"
    private parsearTitulo(): NodoTitulo {
        const token = this.consumir(TipoToken.Titulo)
        const texto = this.consumir(TipoToken.Texto).valor
        return { tipo: "titulo", texto, linea: token.linea }
    }
 
    // descripción "..."
    private parsearDescripcion(): NodoDescripcion {
        const token = this.consumir(TipoToken.Descripcion)
        const texto = this.consumir(TipoToken.Texto).valor
        return { tipo: "descripcion", texto, linea: token.linea }
    }
 
    // mostrar Producto recientes / mostrar producto.nombre
    private parsearMostrar(): NodoMostrar {
        const token = this.consumir(TipoToken.Mostrar)
        const modeloToken = this.actual()
        const modelo = modeloToken.valor
        this.avanzar()
    
        const modificadores: ModificadorMostrar[] = []
        let siFalla: Nodo[] | undefined
        let siFunciona: Nodo[] | undefined
    
        // Leer modificadores opcionales
        while (!this.finArchivo() && (!this.esInstruccionNueva() || this.actual().tipo === TipoToken.Si)) {
            const t = this.actual()
        
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
        
            if (t.tipo === TipoToken.Filtrados) {
                this.avanzar()
                if (this.actual().tipo === TipoToken.Por) this.avanzar()
                const campo = this.consumirIdentificador().valor
                if (this.actual().tipo === TipoToken.Igual) this.avanzar()
                const valor = this.consumir(TipoToken.Texto).valor
                modificadores.push({ tipo: "filtrados", campo, valor })
                continue
            }
        
            if (t.tipo === TipoToken.Si && this.siguiente()?.tipo === TipoToken.Falla) {
                this.avanzar() // si
                this.avanzar() // falla
                siFalla = this.parsearBloque()
                continue
            }
        
            if (t.tipo === TipoToken.Si && this.siguiente()?.tipo === TipoToken.Funciona) {
                this.avanzar() // si
                this.avanzar() // funciona
                siFunciona = this.parsearBloque()
                continue
            }
        
            break
        }
    
        return { tipo: "mostrar", modelo, modificadores, siFalla, siFunciona, linea: token.linea }
    }
 
    // botón "Entrar" ir a login
    private parsearBoton(): NodoBoton {
        const token = this.consumir(TipoToken.Boton)
        const texto = this.consumir(TipoToken.Texto).valor

        const accionToken = this.actual()
        if (accionToken.tipo !== TipoToken.Ir && accionToken.tipo !== TipoToken.Hacer) {
            throw new TelarError(
                Errores.seEsperaba('"ir" o "hacer"', accionToken.valor, accionToken.linea, accionToken.columna)
            )
        }

        const accion = accionToken.tipo === TipoToken.Ir ? "ir" : "hacer"
        this.avanzar()

        // Saltar "a" si existe
        if (this.actual().valor === "a") this.avanzar()

        const destino = this.consumirIdentificador().valor

        // Leer bloque "si falla" opcional después del botón
        let siFalla: Nodo[] | undefined
        if (this.actual().tipo === TipoToken.Si && this.siguiente()?.tipo === TipoToken.Falla) {
            this.avanzar() // si
            this.avanzar() // falla
            siFalla = this.parsearBloque()
        }

        return { tipo: "boton", texto, accion, destino, siFalla, linea: token.linea }
    }
 
    // campo "Correo" tipo email
    private parsearCampo(): NodoCampo {
        const token = this.consumir(TipoToken.Campo)
        const etiqueta = this.consumir(TipoToken.Texto).valor
    
        this.consumir(TipoToken.Tipo)
        const tipoCampo = this.parsearTipoCampo()
    
        return { tipo: "campo", etiqueta, tipoCampo, linea: token.linea }
    }
 
    private parsearTipoCampo(): TipoCampo {
        const token = this.actual()
        const valor = token.valor.toLowerCase()
    
        const tipos: Record<string, TipoCampo> = {
            "texto": "texto",
            "email": "email",
            "contraseña": "contraseña",
            "numero": "texto",
            "número": "texto",
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
            return "texto"
        }
    
        throw new TelarError(
            Errores.tipoCampoDesconocido(token.valor, token.linea, token.columna)
        )
    }
 
    // si el usuario está conectado / si hay resultados / si no
    private parsearSi(): NodoSi {
        const token = this.consumir(TipoToken.Si)
    
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

    // ── Helpers ─────────────────────────────────────────────────

    private parsearBloque(): Nodo[] {
        const nodos: Nodo[] = []
        while (!this.finArchivo() && !this.esInstruccionNueva() && !this.esSiguientePagina()) {
            const nodo = this.parsearNodo()
            if (nodo) nodos.push(nodo)
        }
        return nodos
    }

    private esNivelRaiz(): boolean {
        const t = this.actual().tipo
        return t === TipoToken.Identificador
    }

    private esSiguientePagina(): boolean {
        return this.actual().tipo === TipoToken.Pagina ||
            this.actual().tipo === TipoToken.Datos ||
            this.actual().tipo === TipoToken.FinArchivo
    }

    private esInstruccionNueva(): boolean {
        const t = this.actual().tipo
        return [
            TipoToken.Titulo, TipoToken.Descripcion, TipoToken.Mostrar,
            TipoToken.Boton, TipoToken.Campo, TipoToken.Si,
            TipoToken.Optimizar, TipoToken.Cache, TipoToken.Reintentar,
            TipoToken.Pagina, TipoToken.Datos, TipoToken.FinArchivo
        ].includes(t)
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
