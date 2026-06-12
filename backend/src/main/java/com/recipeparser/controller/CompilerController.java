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

/**
 * Controlador REST que expone el endpoint de compilacion del DSL de recetas.
 *
 * <p>Procesa solicitudes HTTP POST para analizar textos en el lenguaje DSL
 * definido, ejecutando el pipeline completo de compilacion:</p>
 * <ol>
 *   <li>Analisis lexico mediante {@link Lexer} (JFlex).</li>
 *   <li>Validacion de errores lexicos.</li>
 *   <li>Analisis sintactico mediante {@link Parser} (CUP).</li>
 *   <li>Construccion del AST.</li>
 *   <li>Retorno de resultados como JSON.</li>
 * </ol>
 *
 * <p>El controlador maneja tres escenarios posibles:</p>
 * <ul>
 *   <li><b>Exito:</b> {@code success=true}, tokens + AST completos, errores vacio.</li>
 *   <li><b>Error lexico:</b> {@code success=false}, tokens disponibles, AST nulo, errores lexicos.</li>
 *   <li><b>Error sintactico:</b> {@code success=false}, tokens disponibles, AST nulo, error sintactico.</li>
 * </ul>
 *
 * <p>Todas las respuestas utilizan HTTP 200 OK, delegando la informacion de
 * exito o fracaso al campo {@code success} del cuerpo JSON.</p>
 */
@RestController
@RequestMapping("/api/compiler")
public class CompilerController {

    /**
     * Endpoint principal que analiza un texto de receta y devuelve los
     * resultados del proceso de compilacion.
     *
     * <p>Flujo de procesamiento:</p>
     * <ol>
     *   <li>Extrae el texto del cuerpo de la solicitud ({@link AnalyzeRequest}).</li>
     *   <li>Inicializa el {@link Lexer} y obtiene la lista completa de tokens.</li>
     *   <li>Si hay tokens {@code ERROR} (caracteres invalidos), retorna
     *       inmediatamente con errores lexicos y sin AST.</li>
     *   <li>Si no hay errores lexicos, ejecuta el {@link Parser}.</li>
     *   <li>Si el parser lanza {@link ParseException}, retorna con error
     *       sintactico y sin AST.</li>
     *   <li>Si todo es correcto, retorna con el AST construido.</li>
     * </ol>
     *
     * @param request Cuerpo de la solicitud con el campo {@code text}.
     * @return Respuesta HTTP con el resultado del analisis.
     */
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
