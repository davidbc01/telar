export declare enum TipoToken {
    Aplicacion = "aplicacion",
    Pagina = "pagina",
    Datos = "datos",
    En = "en",
    Titulo = "titulo",
    Descripcion = "descripcion",
    Mostrar = "mostrar",
    Boton = "boton",
    Campo = "campo",
    Si = "si",
    SiNo = "si_no",
    El = "el",
    La = "la",
    Esta = "esta",
    Es = "es",
    Hay = "hay",
    Falla = "falla",
    Funciona = "funciona",
    Maximo = "maximo",
    Ordenados = "ordenados",
    Filtrados = "filtrados",
    Por = "por",
    Recientes = "recientes",
    Para = "para",
    Movil = "movil",
    Cache = "cache",
    Reintentar = "reintentar",
    Minutos = "minutos",
    Horas = "horas",
    Segundos = "segundos",
    Optimizar = "optimizar",
    Ir = "ir",
    Hacer = "hacer",
    Tipo = "tipo",
    Idioma = "idioma",
    Texto = "TEXTO",// "hola mundo"
    Numero = "NUMERO",// 42
    Nombre = "NOMBRE",// MiTienda, Producto...
    Identificador = "IDENTIFICADOR",// inicio, login...
    DosPuntos = ":",
    Mayor = ">",
    Igual = "=",
    NuevaLinea = "NUEVA_LINEA",
    Indentacion = "INDENTACION",
    FinIndentacion = "FIN_INDENTACION",
    FinArchivo = "FIN_ARCHIVO",
    Desconocido = "DESCONOCIDO"
}
export interface Token {
    tipo: TipoToken;
    valor: string;
    linea: number;
    columna: number;
}
export type Nodo = NodoAplicacion | NodoPagina | NodoDatos | NodoCamposDatos | NodoTitulo | NodoDescripcion | NodoMostrar | NodoBoton | NodoCampo | NodoSi | NodoOptimizar | NodoCache | NodoReintentar;
export interface NodoAplicacion {
    tipo: "aplicacion";
    nombre: string;
    idioma: string;
    paginas: NodoPagina[];
    datos: NodoDatos[];
    linea: number;
}
export interface NodoPagina {
    tipo: "pagina";
    nombre: string;
    ruta: string;
    hijos: Nodo[];
    linea: number;
}
export interface NodoDatos {
    tipo: "datos";
    nombre: string;
    campos: NodoCamposDatos[];
    linea: number;
}
export interface NodoCamposDatos {
    tipo: "campo_datos";
    nombre: string;
    tipoCampo: TipoDato;
    linea: number;
}
export interface NodoTitulo {
    tipo: "titulo";
    texto: string;
    linea: number;
}
export interface NodoDescripcion {
    tipo: "descripcion";
    texto: string;
    linea: number;
}
export interface NodoMostrar {
    tipo: "mostrar";
    modelo: string;
    modificadores: ModificadorMostrar[];
    siFalla?: Nodo[];
    siFunciona?: Nodo[];
    linea: number;
}
export interface NodoBoton {
    tipo: "boton";
    texto: string;
    accion: AccionBoton;
    destino: string;
    siFalla?: Nodo[];
    linea: number;
}
export interface NodoCampo {
    tipo: "campo";
    etiqueta: string;
    tipoCampo: TipoCampo;
    linea: number;
}
export interface NodoSi {
    tipo: "si";
    condicion: Condicion;
    entonces: Nodo[];
    siNo?: Nodo[];
    linea: number;
}
export interface NodoOptimizar {
    tipo: "optimizar";
    objetivo: "movil";
    linea: number;
}
export interface NodoCache {
    tipo: "cache";
    cantidad: number;
    unidad: "minutos" | "horas" | "segundos";
    linea: number;
}
export interface NodoReintentar {
    tipo: "reintentar";
    segundos: number;
    linea: number;
}
export type TipoDato = "texto" | "número" | "fecha" | "foto" | "verdad" | "lista";
export type TipoCampo = "texto" | "email" | "contraseña" | "numero" | "área de texto";
export type AccionBoton = "ir" | "hacer";
export type ModificadorMostrar = {
    tipo: "maximo";
    cantidad: number;
} | {
    tipo: "ordenados";
    campo: string;
} | {
    tipo: "filtrados";
    campo: string;
    valor: string;
} | {
    tipo: "recientes";
};
export type Condicion = {
    tipo: "usuario_conectado";
} | {
    tipo: "usuario_admin";
} | {
    tipo: "hay_resultados";
} | {
    tipo: "campo_igual";
    campo: string;
    valor: string;
} | {
    tipo: "campo_mayor";
    campo: string;
    valor: number;
};
export interface ErrorTelar {
    mensaje: string;
    sugerencia?: string;
    linea: number;
    columna: number;
}
export declare class TelarError extends Error {
    readonly linea: number;
    readonly columna: number;
    readonly sugerencia?: string;
    constructor(error: ErrorTelar);
    formatear(nombreArchivo: string): string;
}
//# sourceMappingURL=tipos.d.ts.map