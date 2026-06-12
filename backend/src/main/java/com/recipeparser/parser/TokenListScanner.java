package com.recipeparser.parser;

import java.util.List;
import com.recipeparser.model.Token;
import com.recipeparser.model.TokenType;

/**
 * Adaptador ({@code Adapter}) que implementa la interfaz
 * {@link java_cup.runtime.Scanner} para permitir que el parser generado por
 * CUP consuma tokens desde una {@link List} de objetos {@link Token}.
 *
 * <p>CUP espera un escaner que implemente {@code next_token()} y devuelva
 * objetos {@link java_cup.runtime.Symbol} con identificadores enteros. Este
 * adaptador traduce los tipos {@link TokenType} del modelo del dominio a los
 * IDs de terminal definidos en la clase generada {@link sym}.</p>
 *
 * <p>Flujo de datos:</p>
 * <ol>
 *   <li>El {@link com.recipeparser.lexer.Lexer} produce una lista de tokens.</li>
 *   <li>Este adaptador itera sobre esa lista y convierte cada token en un
 *       {@code Symbol} que CUP entiende.</li>
 *   <li>El parser CUP procesa los simbolos y construye el AST.</li>
 * </ol>
 *
 * <p>Cuando se agotan los tokens disponibles (incluyendo el EOF), devuelve
 * un simbolo {@code EOF} para senializar al parser que la entrada termino.</p>
 */
public class TokenListScanner implements java_cup.runtime.Scanner {
    private final List<Token> tokens;
    private int index = 0;

    /**
     * Crea un escaner que itera sobre la lista de tokens proporcionada.
     *
     * @param tokens Lista de tokens producida por el analizador lexico.
     */
    public TokenListScanner(List<Token> tokens) {
        this.tokens = tokens;
    }

    /**
     * Devuelve el siguiente simbolo disponible para el parser CUP.
     *
     * <p>Convierte el siguiente {@link Token} de la lista en un
     * {@link java_cup.runtime.Symbol} con el ID de terminal apropiado.
     * Si no hay mas tokens, retorna {@code EOF}.</p>
     *
     * @return Simbolo CUP con el ID de terminal y el token como valor.
     * @throws Exception Si ocurre un error durante la lectura (no esperado
     *                   en condiciones normales con listas en memoria).
     */
    @Override
    public java_cup.runtime.Symbol next_token() throws Exception {
        if (index >= tokens.size()) {
            return new java_cup.runtime.Symbol(sym.EOF);
        }
        Token t = tokens.get(index++);
        int id = getSymId(t.type());
        return new java_cup.runtime.Symbol(id, t.line(), t.column(), t);
    }

    /**
     * Traduce un {@link TokenType} del modelo de dominio al ID numerico
     * que CUP utiliza internamente para identificar terminales.
     *
     * <p>Utiliza un {@code switch} exhaustivo que cubre todos los tipos de
     * tokens definidos en {@link TokenType}. Los tipos no reconocidos se
     * mapean a {@code sym.error}.</p>
     *
     * @param type Tipo de token a traducir.
     * @return ID numerico correspondiente en la clase {@code sym}.
     */
    private int getSymId(TokenType type) {
        return switch (type) {
            case INGREDIENT -> sym.INGREDIENT;
            case STEP        -> sym.STEP;
            case GRAMS       -> sym.GRAMS;
            case OF          -> sym.OF;
            case BOIL        -> sym.BOIL;
            case ADD         -> sym.ADD;
            case FOR         -> sym.FOR;
            case MINUTES     -> sym.MINUTES;
            case NUMBER      -> sym.NUMBER;
            case WORD        -> sym.WORD;
            case COLON       -> sym.COLON;
            case SEMICOLON   -> sym.SEMICOLON;
            case EOF         -> sym.EOF;
            default          -> sym.error;
        };
    }
}
