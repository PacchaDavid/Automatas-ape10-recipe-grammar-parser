package com.recipeparser.model;

/**
 * Enumeracion de todos los tipos de tokens reconocidos por el analizador
 * lexico del lenguaje DSL de recetas.
 *
 * <p>Divide los tokens en cuatro categorias:</p>
 * <ul>
 *   <li><b>Palabras clave:</b> INGREDIENT, STEP, GRAMS, OF, BOIL, ADD, FOR, MINUTES</li>
 *   <li><b>Literales:</b> NUMBER (enteros), WORD (identificadores de usuario)</li>
 *   <li><b>Simbolos:</b> COLON (:), SEMICOLON (;)</li>
 *   <li><b>Especiales:</b> EOF (fin de archivo), ERROR (caracter invalido)</li>
 * </ul>
 *
 * <p>Cada constante se correlaciona directamente con los terminales definidos
 * en la gramatica CUP ({@code parser.cup}) y con las reglas del analizador
 * lexico JFlex ({@code RecipeLexer.flex}).</p>
 */
public enum TokenType {
    /** Palabra clave "INGREDIENT" que inicia la declaracion de un ingrediente. */
    INGREDIENT,
    /** Palabra clave "STEP" que inicia la declaracion de un paso de coccion. */
    STEP,
    /** Palabra clave "GRAMS" que indica la unidad de medida en gramos. */
    GRAMS,
    /** Palabra clave "OF" usada como preposicion entre la cantidad y el nombre del ingrediente. */
    OF,
    /** Palabra clave "BOIL" que representa la accion de hervir. */
    BOIL,
    /** Palabra clave "ADD" que representa la accion de anadir un ingrediente. */
    ADD,
    /** Palabra clave "FOR" usada para introducir la duracion de una accion. */
    FOR,
    /** Palabra clave "MINUTES" que indica la unidad de tiempo en minutos. */
    MINUTES,
    /** Secuencia de uno o mas digitos (0-9) que representa una cantidad numerica. */
    NUMBER,
    /** Secuencia de letras (a-z, A-Z) que no coincide con ninguna palabra clave reservada. */
    WORD,
    /** Simbolo de dos puntos (:) usado como separador en las declaraciones. */
    COLON,
    /** Simbolo de punto y coma (;) usado como terminador de sentencias. */
    SEMICOLON,
    /** Token especial que indica el final del archivo de entrada. */
    EOF,
    /** Token emitido cuando se encuentra un caracter que no pertenece al lenguaje. */
    ERROR
}
