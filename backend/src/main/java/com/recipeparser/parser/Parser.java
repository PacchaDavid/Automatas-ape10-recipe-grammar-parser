package com.recipeparser.parser;

import java.util.List;
import com.recipeparser.model.Token;
import com.recipeparser.model.ast.RecipeNode;

public class Parser {
    private final List<Token> tokens;

    public Parser(List<Token> tokens) {
        this.tokens = tokens;
    }

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
