package com.recipeparser.model;

public record Token(TokenType type, String lexeme, int line, int column) {
}
