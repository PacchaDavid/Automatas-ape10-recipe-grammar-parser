package com.recipeparser.dto;

import com.recipeparser.model.CompileError;
import com.recipeparser.model.Token;
import com.recipeparser.model.ast.RecipeNode;
import java.util.List;

public record AnalyzeResponse(
    boolean success,
    List<Token> tokens,
    RecipeNode ast,
    List<CompileError> errors
) {
}
