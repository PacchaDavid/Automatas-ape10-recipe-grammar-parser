package com.recipeparser.parser;

import java.util.List;
import com.recipeparser.model.Token;
import com.recipeparser.model.TokenType;

public class TokenListScanner implements java_cup.runtime.Scanner {
    private final List<Token> tokens;
    private int index = 0;

    public TokenListScanner(List<Token> tokens) {
        this.tokens = tokens;
    }

    @Override
    public java_cup.runtime.Symbol next_token() throws Exception {
        if (index >= tokens.size()) {
            return new java_cup.runtime.Symbol(sym.EOF);
        }
        Token t = tokens.get(index++);
        int id = getSymId(t.type());
        return new java_cup.runtime.Symbol(id, t.line(), t.column(), t);
    }

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
