package com.recipeparser.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.recipeparser.dto.AnalyzeRequest;
import com.recipeparser.dto.AnalyzeResponse;
import com.recipeparser.lexer.Lexer;
import com.recipeparser.model.CompileError;
import com.recipeparser.model.Token;
import com.recipeparser.model.TokenType;
import com.recipeparser.model.ast.RecipeNode;
import com.recipeparser.parser.ParseException;
import com.recipeparser.parser.Parser;

@RestController
@RequestMapping("/api/compiler")
public class CompilerController {

    @PostMapping("/analyze")
    public ResponseEntity<AnalyzeResponse> analyze(@RequestBody AnalyzeRequest request) {
        String text = request.text();
        if (text == null) {
            text = "";
        }

        Lexer lexer = new Lexer(text);
        List<Token> tokens = lexer.tokenize();

        List<CompileError> lexicalErrors = tokens.stream()
            .filter(t -> t.type() == TokenType.ERROR)
            .map(t -> new CompileError("LEXICO", "Caracter invalido: '" + t.lexeme() + "'", t.line(), t.column()))
            .toList();

        if (!lexicalErrors.isEmpty()) {
            return ResponseEntity.ok(new AnalyzeResponse(false, tokens, null, lexicalErrors));
        }

        try {
            Parser parser = new Parser(tokens);
            RecipeNode ast = parser.parse();
            return ResponseEntity.ok(new AnalyzeResponse(true, tokens, ast, List.of()));
        } catch (ParseException e) {
            return ResponseEntity.ok(new AnalyzeResponse(
                false, tokens, null,
                List.of(new CompileError("SINTACTICO", e.getMessage(), e.getLine(), e.getColumn()))
            ));
        }
    }
}
