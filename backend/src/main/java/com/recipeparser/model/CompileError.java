package com.recipeparser.model;

public record CompileError(String type, String message, int line, int column) {
}
