"use strict";
// ---
// parser.ts
// Convierte la lista de tokens del lexer en un árbol (AST)
// Es el segundo paso del compilador
// ---
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const tipos_1 = require("./tipos");
const errores_1 = require("./errores");
class Parser {
    constructor(tokens) {
        this.posicion = 0;
        // Filtramos tokens de indentación — el parser no los necesita
        this.tokens = tokens.filter(t => t.tipo !== tipos_1.TipoToken.Indentacion &&
            t.tipo !== tipos_1.TipoToken.FinIndentacion &&
            t.tipo !== tipos_1.TipoToken.NuevaLinea);
    }
    parsear() {
        if (this.tokens.length === 0 || this.actual().tipo === tipos_1.TipoToken.FinArchivo) {
            throw new tipos_1.TelarError(errores_1.Errores.archivoVacio());
        }
        if (this.actual().tipo !== tipos_1.TipoToken.Aplicacion) {
            throw new tipos_1.TelarError(errores_1.Errores.faltaAplicacion(this.actual().linea, this.actual().columna));
        }
        return this.parsearAplicacion();
    }
    // ── aplicación MiTienda ─────────────────────────────────────
    parsearAplicacion() {
        const token = this.consumir(tipos_1.TipoToken.Aplicacion);
        if (this.actual().tipo !== tipos_1.TipoToken.Nombre) {
            throw new tipos_1.TelarError(errores_1.Errores.nombreAplicacion(this.actual().linea, this.actual().columna));
        }
        const nombre = this.consumir(tipos_1.TipoToken.Nombre).valor;
        let idioma = "español";
        const paginas = [];
        const datos = [];
        // Leer hijos de la aplicación
        while (!this.finArchivo()) {
            const actual = this.actual();
            if (actual.tipo === tipos_1.TipoToken.Idioma) {
                this.avanzar();
                idioma = this.consumirIdentificador().valor;
                continue;
            }
            if (actual.tipo === tipos_1.TipoToken.Datos) {
                datos.push(this.parsearDatos());
                continue;
            }
            if (actual.tipo === tipos_1.TipoToken.Pagina) {
                paginas.push(this.parsearPagina());
                continue;
            }
            // Token no reconocido a nivel raíz — saltar
            this.avanzar();
        }
        return {
            tipo: "aplicacion",
            nombre,
            idioma,
            paginas,
            datos,
            linea: token.linea
        };
    }
    // ── datos Producto ──────────────────────────────────────────
    parsearDatos() {
        const token = this.consumir(tipos_1.TipoToken.Datos);
        const nombre = this.consumir(tipos_1.TipoToken.Nombre).valor;
        const campos = [];
        // Leer campos hasta encontrar otra sección de nivel raíz
        while (!this.finArchivo() && this.esNivelRaiz()) {
            const campo = this.parsearCampoDatos();
            if (campo)
                campos.push(campo);
        }
        return { tipo: "datos", nombre, campos, linea: token.linea };
    }
    parsearCampoDatos() {
        if (this.actual().tipo !== tipos_1.TipoToken.Identificador)
            return null;
        const nombreToken = this.consumirIdentificador();
        if (this.actual().tipo !== tipos_1.TipoToken.DosPuntos)
            return null;
        this.consumir(tipos_1.TipoToken.DosPuntos);
        const tipoDato = this.parsearTipoDato();
        return {
            tipo: "campo_datos",
            nombre: nombreToken.valor,
            tipoCampo: tipoDato,
            linea: nombreToken.linea
        };
    }
    parsearTipoDato() {
        const token = this.actual();
        const valor = token.valor.toLowerCase();
        const tipos = {
            "texto": "texto",
            "número": "número",
            "numero": "número",
            "fecha": "fecha",
            "foto": "foto",
            "verdad": "verdad",
            "lista": "lista",
        };
        if (tipos[valor]) {
            this.avanzar();
            // Si es lista, saltar "de NombreModelo"
            if (tipos[valor] === "lista") {
                if (this.actual().valor === "de")
                    this.avanzar();
                if (this.actual().tipo === tipos_1.TipoToken.Nombre)
                    this.avanzar();
            }
            return tipos[valor];
        }
        throw new tipos_1.TelarError(errores_1.Errores.tipoDatoDesconocido(token.valor, token.linea, token.columna));
    }
    // ── página inicio en "/" ────────────────────────────────────
    parsearPagina() {
        const token = this.consumir(tipos_1.TipoToken.Pagina);
        const nombre = this.consumirIdentificador().valor;
        if (this.actual().tipo !== tipos_1.TipoToken.En) {
            throw new tipos_1.TelarError(errores_1.Errores.rutaPagina(nombre, this.actual().linea, this.actual().columna));
        }
        this.consumir(tipos_1.TipoToken.En);
        const ruta = this.consumir(tipos_1.TipoToken.Texto).valor;
        const hijos = [];
        // Leer hijos hasta encontrar otra página o fin
        while (!this.finArchivo() && !this.esSiguientePagina()) {
            const nodo = this.parsearNodo();
            if (nodo)
                hijos.push(nodo);
        }
        return { tipo: "pagina", nombre, ruta, hijos, linea: token.linea };
    }
    // ── Nodos dentro de una página ──────────────────────────────
    parsearNodo() {
        const actual = this.actual();
        switch (actual.tipo) {
            case tipos_1.TipoToken.Titulo: return this.parsearTitulo();
            case tipos_1.TipoToken.Descripcion: return this.parsearDescripcion();
            case tipos_1.TipoToken.Mostrar: return this.parsearMostrar();
            case tipos_1.TipoToken.Boton: return this.parsearBoton();
            case tipos_1.TipoToken.Campo: return this.parsearCampo();
            case tipos_1.TipoToken.Si: return this.parsearSi();
            case tipos_1.TipoToken.Optimizar: return this.parsearOptimizar();
            case tipos_1.TipoToken.Cache: return this.parsearCache();
            case tipos_1.TipoToken.Reintentar: return this.parsearReintentar();
            default:
                this.avanzar();
                return null;
        }
    }
    // título "Bienvenido"
    parsearTitulo() {
        const token = this.consumir(tipos_1.TipoToken.Titulo);
        const texto = this.consumir(tipos_1.TipoToken.Texto).valor;
        return { tipo: "titulo", texto, linea: token.linea };
    }
    // descripción "..."
    parsearDescripcion() {
        const token = this.consumir(tipos_1.TipoToken.Descripcion);
        const texto = this.consumir(tipos_1.TipoToken.Texto).valor;
        return { tipo: "descripcion", texto, linea: token.linea };
    }
    // mostrar Producto recientes / mostrar producto.nombre
    parsearMostrar() {
        const token = this.consumir(tipos_1.TipoToken.Mostrar);
        const modeloToken = this.actual();
        const modelo = modeloToken.valor;
        this.avanzar();
        const modificadores = [];
        let siFalla;
        let siFunciona;
        // Leer modificadores opcionales
        while (!this.finArchivo() && (!this.esInstruccionNueva() || this.actual().tipo === tipos_1.TipoToken.Si)) {
            const t = this.actual();
            if (t.tipo === tipos_1.TipoToken.Recientes) {
                modificadores.push({ tipo: "recientes" });
                this.avanzar();
                continue;
            }
            if (t.tipo === tipos_1.TipoToken.Maximo) {
                this.avanzar();
                const cantidad = parseInt(this.consumir(tipos_1.TipoToken.Numero).valor);
                modificadores.push({ tipo: "maximo", cantidad });
                continue;
            }
            if (t.tipo === tipos_1.TipoToken.Ordenados) {
                this.avanzar();
                if (this.actual().tipo === tipos_1.TipoToken.Por)
                    this.avanzar();
                const campo = this.consumirIdentificador().valor;
                modificadores.push({ tipo: "ordenados", campo });
                continue;
            }
            if (t.tipo === tipos_1.TipoToken.Filtrados) {
                this.avanzar();
                if (this.actual().tipo === tipos_1.TipoToken.Por)
                    this.avanzar();
                const campo = this.consumirIdentificador().valor;
                if (this.actual().tipo === tipos_1.TipoToken.Igual)
                    this.avanzar();
                const valor = this.consumir(tipos_1.TipoToken.Texto).valor;
                modificadores.push({ tipo: "filtrados", campo, valor });
                continue;
            }
            if (t.tipo === tipos_1.TipoToken.Si && this.siguiente()?.tipo === tipos_1.TipoToken.Falla) {
                this.avanzar(); // si
                this.avanzar(); // falla
                siFalla = this.parsearBloque();
                continue;
            }
            if (t.tipo === tipos_1.TipoToken.Si && this.siguiente()?.tipo === tipos_1.TipoToken.Funciona) {
                this.avanzar(); // si
                this.avanzar(); // funciona
                siFunciona = this.parsearBloque();
                continue;
            }
            break;
        }
        return { tipo: "mostrar", modelo, modificadores, siFalla, siFunciona, linea: token.linea };
    }
    // botón "Entrar" ir a login
    parsearBoton() {
        const token = this.consumir(tipos_1.TipoToken.Boton);
        const texto = this.consumir(tipos_1.TipoToken.Texto).valor;
        const accionToken = this.actual();
        if (accionToken.tipo !== tipos_1.TipoToken.Ir && accionToken.tipo !== tipos_1.TipoToken.Hacer) {
            throw new tipos_1.TelarError(errores_1.Errores.seEsperaba('"ir" o "hacer"', accionToken.valor, accionToken.linea, accionToken.columna));
        }
        const accion = accionToken.tipo === tipos_1.TipoToken.Ir ? "ir" : "hacer";
        this.avanzar();
        // Saltar "a" si existe
        if (this.actual().valor === "a")
            this.avanzar();
        const destino = this.consumirIdentificador().valor;
        // Leer bloque "si falla" opcional después del botón
        let siFalla;
        if (this.actual().tipo === tipos_1.TipoToken.Si && this.siguiente()?.tipo === tipos_1.TipoToken.Falla) {
            this.avanzar(); // si
            this.avanzar(); // falla
            siFalla = this.parsearBloque();
        }
        return { tipo: "boton", texto, accion, destino, siFalla, linea: token.linea };
    }
    // campo "Correo" tipo email
    parsearCampo() {
        const token = this.consumir(tipos_1.TipoToken.Campo);
        const etiqueta = this.consumir(tipos_1.TipoToken.Texto).valor;
        this.consumir(tipos_1.TipoToken.Tipo);
        const tipoCampo = this.parsearTipoCampo();
        return { tipo: "campo", etiqueta, tipoCampo, linea: token.linea };
    }
    parsearTipoCampo() {
        const token = this.actual();
        const valor = token.valor.toLowerCase();
        const tipos = {
            "texto": "texto",
            "email": "email",
            "contraseña": "contraseña",
            "numero": "texto",
            "número": "texto",
        };
        if (tipos[valor]) {
            this.avanzar();
            return tipos[valor];
        }
        // "área de texto" son tres tokens
        if (valor === "área" || valor === "area") {
            this.avanzar();
            if (this.actual().valor === "de")
                this.avanzar();
            if (this.actual().valor === "texto")
                this.avanzar();
            return "texto";
        }
        throw new tipos_1.TelarError(errores_1.Errores.tipoCampoDesconocido(token.valor, token.linea, token.columna));
    }
    // si el usuario está conectado / si hay resultados / si no
    parsearSi() {
        const token = this.consumir(tipos_1.TipoToken.Si);
        // "si no" — rama else
        if (this.actual().tipo === tipos_1.TipoToken.SiNo) {
            this.avanzar();
            const entonces = this.parsearBloque();
            return {
                tipo: "si",
                condicion: { tipo: "hay_resultados" }, // placeholder
                entonces,
                linea: token.linea
            };
        }
        const condicion = this.parsearCondicion();
        const entonces = this.parsearBloque();
        let siNo;
        // Buscar "si no" al mismo nivel
        if (this.actual().tipo === tipos_1.TipoToken.Si && this.siguiente()?.tipo === tipos_1.TipoToken.SiNo) {
            this.avanzar(); // si
            this.avanzar(); // no
            siNo = this.parsearBloque();
        }
        return { tipo: "si", condicion, entonces, siNo, linea: token.linea };
    }
    parsearCondicion() {
        const t = this.actual();
        // si el usuario está conectado / si el usuario es administrador
        if (t.tipo === tipos_1.TipoToken.El || t.tipo === tipos_1.TipoToken.La) {
            this.avanzar();
            if (this.actual().valor === "usuario") {
                this.avanzar();
                if (this.actual().tipo === tipos_1.TipoToken.Esta) {
                    this.avanzar();
                    if (this.actual().valor === "conectado") {
                        this.avanzar();
                        return { tipo: "usuario_conectado" };
                    }
                }
                if (this.actual().tipo === tipos_1.TipoToken.Es) {
                    this.avanzar();
                    if (this.actual().valor === "administrador") {
                        this.avanzar();
                        return { tipo: "usuario_admin" };
                    }
                }
            }
        }
        // si hay resultados
        if (t.tipo === tipos_1.TipoToken.Hay) {
            this.avanzar();
            if (this.actual().valor === "resultados") {
                this.avanzar();
                return { tipo: "hay_resultados" };
            }
        }
        // si producto.stock > 0
        if (t.tipo === tipos_1.TipoToken.Identificador) {
            const campo = t.valor;
            this.avanzar();
            if (this.actual().tipo === tipos_1.TipoToken.Mayor) {
                this.avanzar();
                const valor = parseFloat(this.consumir(tipos_1.TipoToken.Numero).valor);
                return { tipo: "campo_mayor", campo, valor };
            }
            if (this.actual().tipo === tipos_1.TipoToken.Igual) {
                this.avanzar();
                const valor = this.consumir(tipos_1.TipoToken.Texto).valor;
                return { tipo: "campo_igual", campo, valor };
            }
        }
        throw new tipos_1.TelarError(errores_1.Errores.condicionDesconocida(t.valor, t.linea, t.columna));
    }
    // optimizar para móvil
    parsearOptimizar() {
        const token = this.consumir(tipos_1.TipoToken.Optimizar);
        if (this.actual().tipo === tipos_1.TipoToken.Para)
            this.avanzar();
        if (this.actual().tipo === tipos_1.TipoToken.Movil)
            this.avanzar();
        return { tipo: "optimizar", objetivo: "movil", linea: token.linea };
    }
    // caché 10 minutos
    parsearCache() {
        const token = this.consumir(tipos_1.TipoToken.Cache);
        const cantidad = parseInt(this.consumir(tipos_1.TipoToken.Numero).valor);
        const unidad = this.actual().tipo === tipos_1.TipoToken.Horas ? "horas" : "minutos";
        this.avanzar();
        return { tipo: "cache", cantidad, unidad, linea: token.linea };
    }
    // reintentar en 5 segundos
    parsearReintentar() {
        const token = this.consumir(tipos_1.TipoToken.Reintentar);
        if (this.actual().tipo === tipos_1.TipoToken.En)
            this.avanzar();
        const segundos = parseInt(this.consumir(tipos_1.TipoToken.Numero).valor);
        if (this.actual().tipo === tipos_1.TipoToken.Segundos)
            this.avanzar();
        return { tipo: "reintentar", segundos, linea: token.linea };
    }
    // ── Helpers ─────────────────────────────────────────────────
    parsearBloque() {
        const nodos = [];
        while (!this.finArchivo() && !this.esInstruccionNueva() && !this.esSiguientePagina()) {
            const nodo = this.parsearNodo();
            if (nodo)
                nodos.push(nodo);
        }
        return nodos;
    }
    esNivelRaiz() {
        const t = this.actual().tipo;
        return t === tipos_1.TipoToken.Identificador;
    }
    esSiguientePagina() {
        return this.actual().tipo === tipos_1.TipoToken.Pagina ||
            this.actual().tipo === tipos_1.TipoToken.Datos ||
            this.actual().tipo === tipos_1.TipoToken.FinArchivo;
    }
    esInstruccionNueva() {
        const t = this.actual().tipo;
        return [
            tipos_1.TipoToken.Titulo, tipos_1.TipoToken.Descripcion, tipos_1.TipoToken.Mostrar,
            tipos_1.TipoToken.Boton, tipos_1.TipoToken.Campo, tipos_1.TipoToken.Si,
            tipos_1.TipoToken.Optimizar, tipos_1.TipoToken.Cache, tipos_1.TipoToken.Reintentar,
            tipos_1.TipoToken.Pagina, tipos_1.TipoToken.Datos, tipos_1.TipoToken.FinArchivo
        ].includes(t);
    }
    consumir(tipo) {
        const token = this.actual();
        if (token.tipo !== tipo) {
            throw new tipos_1.TelarError(errores_1.Errores.seEsperaba(tipo, token.valor, token.linea, token.columna));
        }
        this.avanzar();
        return token;
    }
    consumirIdentificador() {
        const token = this.actual();
        if (token.tipo !== tipos_1.TipoToken.Identificador && token.tipo !== tipos_1.TipoToken.Nombre) {
            throw new tipos_1.TelarError(errores_1.Errores.seEsperaba("un nombre", token.valor, token.linea, token.columna));
        }
        this.avanzar();
        return token;
    }
    actual() {
        return this.tokens[this.posicion] ?? {
            tipo: tipos_1.TipoToken.FinArchivo, valor: "", linea: 0, columna: 0
        };
    }
    siguiente() {
        return this.tokens[this.posicion + 1] ?? null;
    }
    avanzar() {
        this.posicion++;
    }
    finArchivo() {
        return this.posicion >= this.tokens.length || this.actual().tipo === tipos_1.TipoToken.FinArchivo;
    }
}
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map