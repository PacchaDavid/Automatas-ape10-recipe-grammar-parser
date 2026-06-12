package com.recipeparser.lexer;

import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;
import com.recipeparser.model.Token;
import com.recipeparser.model.TokenType;
import com.recipeparser.parser.sym;

/**
 * Analizador lexico que actua como fachada ({@code Facade}) sobre el generador
 * JFlex {@link RecipeLexer}.
 *
 * <p>Proporciona una interfaz simple que recibe el texto de entrada como
 * {@link String} y devuelve una {@link List} de objetos {@link Token}.
 * Internamente delega en el escaner generado por JFlex ({@code RecipeLexer}),
 * manejando la creacion del {@link StringReader} y la iteracion de simbolos.</p>
 *
 * <p>Flujo de operacion:</p>
 * <ol>
 *   <li>Envuelve el texto de entrada en un {@code StringReader}.</li>
 *   <li>Instancia el escaner JFlex {@code RecipeLexer}.</li>
 *   <li>Itera llamando a {@code next_token()} hasta recibir {@code EOF}.</li>
 *   <li>Agrega un token {@link TokenType#EOF} explicito al final.</li>
 *   <li>Captura cualquier excepcion y la convierte en un token de error.</li>
 * </ol>
 *
 * <p>El uso de un {@code StringReader} elimina la necesidad de archivos
 * temporales o entrada estandar, permitiendo procesar texto directamente
 * desde la solicitud HTTP.</p>
 */
public class Lexer {
    private final String input;

    /**
     * Crea un analizador lexico para el texto de entrada especificado.
     *
     * @param input Cadena de texto con la receta en DSL a analizar.
     */
    public Lexer(String input) {
        this.input = input;
    }

    /**
     * Ejecuta el analisis lexico completo del texto de entrada.
     *
     * <p>Procesa el texto caracter por caracter utilizando el escaner JFlex
     * generado, produciendo una lista ordenada de tokens. Cada token incluye
     * su tipo, lexema, linea y columna de origen.</p>
     *
     * <p>El proceso garantiza que:</p>
     * <ul>
     *   <li>Siempre se incluye un token {@code EOF} al final de la lista.</li>
     *   <li>Los caracteres no validos generan tokens {@code ERROR} en lugar
     *       de abortar el analisis.</li>
     *   <li>Excepciones inesperadas del escaner se capturan y reportan como
     *       tokens de error.</li>
     * </ul>
     *
     * @return Lista completa de tokens encontrados en el texto de entrada.
     */
    public List<Token> tokenize() {
        List<Token> tokens = new ArrayList<>();
        RecipeLexer lexer = new RecipeLexer(new StringReader(input));
        try {
            java_cup.runtime.Symbol symObj;
            while ((symObj = lexer.next_token()).sym != sym.EOF) {
                if (symObj.value instanceof Token t) {
                    tokens.add(t);
                }
            }
            tokens.add(new Token(TokenType.EOF, "", lexer.getLine() + 1, lexer.getColumn() + 1));
        } catch (Exception e) {
            tokens.add(new Token(TokenType.ERROR, e.getMessage(), 1, 1));
        }
        return tokens;
    }
}
