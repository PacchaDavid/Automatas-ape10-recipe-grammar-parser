package com.recipeparser.parser;

import java.util.ArrayList;
import java.util.List;
import com.recipeparser.model.Token;
import com.recipeparser.model.TokenType;
import com.recipeparser.model.ast.*;

public class Parser {
    private final List<Token> tokens;
    private int pos;

    public Parser(List<Token> tokens) {
        this.tokens = tokens;
        this.pos = 0;
    }

    public RecipeNode parse() {
        IngredientNode ingredient = parseDeclaracionIngrediente();
        List<StepNode> steps = new ArrayList<>();

        if (peek().type() == TokenType.EOF) {
            Token t = peek();
            throw new ParseException("Se esperaba al menos un paso", t.line(), t.column());
        }

        while (peek().type() != TokenType.EOF) {
            steps.add(parsePaso());
        }

        return new RecipeNode(ingredient, steps);
    }

    private IngredientNode parseDeclaracionIngrediente() {
        expect(TokenType.INGREDIENT);
        expect(TokenType.COLON);
        Token number = expect(TokenType.NUMBER);
        expect(TokenType.GRAMS);
        expect(TokenType.OF);
        Token name = expect(TokenType.WORD);
        expect(TokenType.SEMICOLON);
        return new IngredientNode(Integer.parseInt(number.lexeme()), "GRAMS", name.lexeme());
    }

    private StepNode parsePaso() {
        expect(TokenType.STEP);
        Token number = expect(TokenType.NUMBER);
        expect(TokenType.COLON);
        ActionNode action = parseAccionCocina();
        expect(TokenType.SEMICOLON);
        return new StepNode(Integer.parseInt(number.lexeme()), action);
    }

    private ActionNode parseAccionCocina() {
        Token token = peek();
        if (token.type() == TokenType.BOIL) {
            consume();
            Token target = expect(TokenType.WORD);
            TimeNode time = parseTiempo();
            return new ActionNode("BOIL", target.lexeme(), time);
        } else if (token.type() == TokenType.ADD) {
            consume();
            Token target = expect(TokenType.WORD);
            return new ActionNode("ADD", target.lexeme(), null);
        } else {
            throw new ParseException(
                "Se esperaba BOIL o ADD pero se encontro " + token.type() + " ('" + token.lexeme() + "')",
                token.line(), token.column()
            );
        }
    }

    private TimeNode parseTiempo() {
        expect(TokenType.FOR);
        Token number = expect(TokenType.NUMBER);
        expect(TokenType.MINUTES);
        return new TimeNode(Integer.parseInt(number.lexeme()), "MINUTES");
    }

    private Token peek() {
        return tokens.get(pos);
    }

    private Token consume() {
        return tokens.get(pos++);
    }

    private Token expect(TokenType type) {
        Token token = peek();
        if (token.type() != type) {
            throw new ParseException(
                "Se esperaba " + type + " pero se encontro " + token.type() + " ('" + token.lexeme() + "')",
                token.line(), token.column()
            );
        }
        return consume();
    }
}
