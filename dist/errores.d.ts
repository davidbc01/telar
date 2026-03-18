import { ErrorTelar } from "./tipos";
export declare const Errores: {
    caracterDesconocido: (caracter: string, linea: number, columna: number) => ErrorTelar;
    textoSinCerrar: (linea: number, columna: number) => ErrorTelar;
    seEsperaba: (esperado: string, encontrado: string, linea: number, columna: number) => ErrorTelar;
    nombreAplicacion: (linea: number, columna: number) => ErrorTelar;
    rutaPagina: (nombre: string, linea: number, columna: number) => ErrorTelar;
    numeroEsperado: (valor: string, linea: number, columna: number) => ErrorTelar;
    tipoDatoDesconocido: (tipo: string, linea: number, columna: number) => ErrorTelar;
    tipoCampoDesconocido: (tipo: string, linea: number, columna: number) => ErrorTelar;
    condicionDesconocida: (texto: string, linea: number, columna: number) => ErrorTelar;
    indentacionIncorrecta: (linea: number, columna: number) => ErrorTelar;
    archivoVacio: () => ErrorTelar;
    faltaAplicacion: (linea: number, columna: number) => ErrorTelar;
};
//# sourceMappingURL=errores.d.ts.map