package com.recipeparser.parser;

/**
 * Excepcion no verificada ({@link RuntimeException}) lanzada cuando el
 * analizador sintactico encuentra un error en la estructura del DSL.
 *
 * <p>A diferencia de las excepciones genericas, {@code ParseException} incluye
 * informacion posicional precisa (linea y columna) que permite al controlador
 * REST construir respuestas de error detalladas y utiles para el usuario.</p>
 *
 * <p>Esta excepcion es lanzada tanto por:</p>
 * <ul>
 *   <li>El parser generado por CUP a traves de su metodo {@code syntax_error()}
 *       sobreescrito en el archivo {@code parser.cup}.</li>
 *   <li>Metodos internos de validacion en la clase {@link Parser}.</li>
 * </ul>
 *
 * <p>Al ser una {@code RuntimeException}, no obliga a los llamadores a
 * declararla en su firma, simplificando la integracion con el flujo del
 * controlador REST.</p>
 */
public class ParseException extends RuntimeException {
    private final int line;
    private final int column;

    /**
     * Crea una excepcion con el mensaje y la posicion del error.
     *
     * @param message Descripcion del error sintactico en espanol.
     * @param line    Linea donde se detected el error (1-indexed).
     * @param column  Columna donde se detected el error (1-indexed).
     */
    public ParseException(String message, int line, int column) {
        super(message);
        this.line = line;
        this.column = column;
    }

    /**
     * Devuelve la linea donde ocurrio el error sintactico.
     *
     * @return Numero de linea (comienza en 1).
     */
    public int getLine() {
        return line;
    }

    /**
     * Devuelve la columna donde ocurrio el error sintactico.
     *
     * @return Numero de columna (comienza en 1).
     */
    public int getColumn() {
        return column;
    }
}
