package com.recipeparser.lexer;

import java.util.ArrayList;
import java.util.List;
import com.recipeparser.model.Token;
import com.recipeparser.model.TokenType;

public class Lexer {
    private final String input;
    private int pos;
    private int line;
    private int column;
    private final List<Token> tokens;

    public Lexer(String input) {
        this.input = input;
        this.pos = 0;
        this.line = 1;
        this.column = 1;
        this.tokens = new ArrayList<>();
    }

    public List<Token> tokenize() {
        while (pos < input.length()) {
            char c = input.charAt(pos);

            if (Character.isWhitespace(c)) {
                if (c == '\n') {
                    line++;
                    column = 1;
                } else if (c == '\r') {
                    line++;
                    column = 1;
                    pos++;
                    if (pos < input.length() && input.charAt(pos) == '\n') {
                        pos++;
                    }
                    continue;
                } else if (c == '\t') {
                    column += 4;
                } else {
                    column++;
                }
                pos++;
                continue;
            }

            if (Character.isDigit(c)) {
                tokens.add(readNumber());
                continue;
            }

            if (Character.isLetter(c)) {
                tokens.add(readWord());
                continue;
            }

            if (c == ':') {
                tokens.add(new Token(TokenType.COLON, ":", line, column));
                pos++;
                column++;
                continue;
            }

            if (c == ';') {
                tokens.add(new Token(TokenType.SEMICOLON, ";", line, column));
                pos++;
                column++;
                continue;
            }

            tokens.add(new Token(TokenType.ERROR, String.valueOf(c), line, column));
            pos++;
            column++;
        }

        tokens.add(new Token(TokenType.EOF, "", line, column));
        return tokens;
    }

    private Token readNumber() {
        int startCol = column;
        int startLine = line;
        StringBuilder sb = new StringBuilder();
        while (pos < input.length() && Character.isDigit(input.charAt(pos))) {
            sb.append(input.charAt(pos));
            pos++;
            column++;
        }
        return new Token(TokenType.NUMBER, sb.toString(), startLine, startCol);
    }

    private Token readWord() {
        int startCol = column;
        int startLine = line;
        StringBuilder sb = new StringBuilder();
        while (pos < input.length() && Character.isLetter(input.charAt(pos))) {
            sb.append(input.charAt(pos));
            pos++;
            column++;
        }
        String word = sb.toString();
        TokenType type = switch (word) {
            case "INGREDIENT" -> TokenType.INGREDIENT;
            case "STEP"       -> TokenType.STEP;
            case "GRAMS"      -> TokenType.GRAMS;
            case "OF"         -> TokenType.OF;
            case "BOIL"       -> TokenType.BOIL;
            case "ADD"        -> TokenType.ADD;
            case "FOR"        -> TokenType.FOR;
            case "MINUTES"    -> TokenType.MINUTES;
            default           -> TokenType.WORD;
        };
        return new Token(type, word, startLine, startCol);
    }
}
