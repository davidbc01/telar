import { Token, NodoAplicacion } from './tipos';
export declare class Parser {
    private tokens;
    private posicion;
    constructor(tokens: Token[]);
    parsear(): NodoAplicacion;
    private parsearAplicacion;
    private parsearDatos;
    private parsearCampoDatos;
    private parsearTipoDato;
    private parsearPagina;
    private parsearNodo;
    private parsearTitulo;
    private parsearDescripcion;
    private parsearMostrar;
    private parsearBoton;
    private parsearCampo;
    private parsearTipoCampo;
    private parsearSi;
    private parsearCondicion;
    private parsearOptimizar;
    private parsearCache;
    private parsearReintentar;
    private parsearBloque;
    private esNivelRaiz;
    private esSiguientePagina;
    private esInstruccionNueva;
    private consumir;
    private consumirIdentificador;
    private actual;
    private siguiente;
    private avanzar;
    private finArchivo;
}
//# sourceMappingURL=parser.d.ts.map