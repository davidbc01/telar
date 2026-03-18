import { Token } from './tipos';
export declare class Lexer {
    private texto;
    private posicion;
    private linea;
    private columna;
    private nivelIndentacion;
    constructor(texto: string);
    tokenizar(): Token[];
    private siguienteToken;
    private procesarIndentacion;
    private leerTexto;
    private leerNumero;
    private leerPalabra;
    private actual;
    private avanzar;
    private finArchivo;
    private esDigito;
    private esLetra;
    private crearToken;
}
//# sourceMappingURL=lexer.d.ts.map