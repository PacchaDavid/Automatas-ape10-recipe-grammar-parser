package com.recipeparser.lexer;

import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;
import com.recipeparser.model.Token;
import com.recipeparser.model.TokenType;
import com.recipeparser.parser.sym;

public class Lexer {
    private final String input;

    public Lexer(String input) {
        this.input = input;
    }

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
            // Add the final EOF token
            tokens.add(new Token(TokenType.EOF, "", lexer.getLine() + 1, lexer.getColumn() + 1));
        } catch (Exception e) {
            // Under normal circumstances, StringReader will not throw IO exceptions.
            // If an unexpected error occurs, report it as an ERROR token.
            tokens.add(new Token(TokenType.ERROR, e.getMessage(), 1, 1));
        }
        return tokens;
    }
}
