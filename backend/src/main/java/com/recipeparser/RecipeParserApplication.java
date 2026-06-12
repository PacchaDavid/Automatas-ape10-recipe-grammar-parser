package com.recipeparser;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Clase principal de arranque de la aplicacion Spring Boot.
 *
 * <p>La anotacion {@link SpringBootApplication} es una meta-anotacion que
 * combina:</p>
 * <ul>
 *   <li><b>{@code @Configuration}:</b> Marca la clase como fuente de definicion
 *       de beans para el contexto de Spring.</li>
 *   <li><b>{@code @EnableAutoConfiguration}:</b> Habilita la configuracion
 *       automatica de Spring Boot basada en las dependencias del classpath.</li>
 *   <li><b>{@code @ComponentScan}:</b> Escanea automaticamente los paquetes
 *       en busca de componentes, servicios, controladores y repositorios.</li>
 * </ul>
 *
 * <p>Al ejecutarse, inicia el servidor Tomcat embebido en el puerto
 * configurado en {@code application.yml} (por defecto 9090) y expone los
 * endpoints REST definidos en {@link com.recipeparser.controller.CompilerController}.</p>
 */
@SpringBootApplication
public class RecipeParserApplication {

    /**
     * Punto de entrada principal de la aplicacion.
     *
     * <p>Delega en {@link SpringApplication#run(Class, String[])} para
     * inicializar el contexto de Spring, cargar la configuracion automatica
     * y arrancar el servidor web embebido.</p>
     *
     * @param args Argumentos de linea de comandos (no utilizados actualmente).
     */
    public static void main(String[] args) {
        SpringApplication.run(RecipeParserApplication.class, args);
    }
}
