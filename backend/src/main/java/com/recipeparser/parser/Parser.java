package com.recipeparser.parser;

import java.util.List;
import com.recipeparser.model.Token;
import com.recipeparser.model.ast.RecipeNode;

/**
 * Analizador sintactico que actua como fachada ({@code Facade}) sobre el
 * parser generado por CUP ({@link RecipeParser}).
 *
 * <p>Proporciona una interfaz simple que recibe una lista de tokens y devuelve
 * el {@link RecipeNode} raiz del AST. Internamente:</p>
 * <ol>
 *   <li>Crea un {@link TokenListScanner} para adaptar la lista de tokens al
 *       formato que CUP espera.</li>
 *   <li>Instancia el parser generado por CUP ({@code RecipeParser}).</li>
 *   <li>Ejecuta el analisis sintactico ({@code parser.parse()}).</li>
 *   <li>Captura y relanza las excepciones {@link ParseException}.</li>
 * </ol>
 *
 * <p>Las excepciones de CUP se envuelven apropiadamente para mantener una
 * interfaz de dominio limpia, independiente del generador de parser utilizado.</p>
 */
public class Parser {
    private final List<Token> tokens;

    /**
     * Crea un analizador sintactico para la lista de tokens especificada.
     *
     * @param tokens Lista de tokens producida por el analizador lexico.
     */
    public Parser(List<Token> tokens) {
        this.tokens = tokens;
    }

    /**
     * Ejecuta el analisis sintactico completo y construye el AST.
     *
     * <p>El proceso sigue estos pasos:</p>
     * <ul>
     *   <li>Crea un {@link TokenListScanner} que adapta los tokens al protocolo CUP.</li>
     *   <li>Invoca al parser LALR(1) generado por CUP.</li>
     *   <li>Si el analisis es exitoso, devuelve el nodo raiz {@link RecipeNode}.</li>
     *   <li>Si se encuentra un error sintactico, lanza {@link ParseException}
     *       con la posicion exacta del error.</li>
     * </ul>
     *
     * @return Nodo raiz del AST representando la receta completa.
     * @throws ParseException Si la secuencia de tokens no cumple con la gramatica.
     */
    public RecipeNode parse() {
        TokenListScanner scanner = new TokenListScanner(tokens);
        RecipeParser parser = new RecipeParser(scanner);
        try {
            java_cup.runtime.Symbol result = parser.parse();
            return (RecipeNode) result.value;
        } catch (ParseException e) {
            throw e;
        } catch (Exception e) {
            if (e.getCause() instanceof ParseException pe) {
                throw pe;
            }
            throw new ParseException("Error sintactico: " + e.getMessage(), 1, 1);
        }
    }
}
