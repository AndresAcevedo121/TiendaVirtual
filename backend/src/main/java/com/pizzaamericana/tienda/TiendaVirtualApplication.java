package com.pizzaamericana.tienda;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TiendaVirtualApplication {

    public static void main(String[] args) {
        cargarVariablesEnv();
        SpringApplication.run(TiendaVirtualApplication.class, args);
    }

    /**
     * Carga variables de entorno desde un archivo .env si existe en el directorio de trabajo
     * o en la raíz del proyecto, registrándolas como propiedades del sistema para Spring Boot.
     */
    private static void cargarVariablesEnv() {
        List<Path> posiblesRutas = List.of(
            Paths.get(".env"),
            Paths.get("../.env"),
            Paths.get("../../.env")
        );
        for (Path ruta : posiblesRutas) {
            if (Files.exists(ruta)) {
                try {
                    List<String> lineas = Files.readAllLines(ruta);
                    for (String linea : lineas) {
                        String limpia = linea.trim();
                        if (limpia.isEmpty() || limpia.startsWith("#")) {
                            continue;
                        }
                        int separador = limpia.indexOf('=');
                        if (separador > 0) {
                            String clave = limpia.substring(0, separador).trim();
                            String valor = limpia.substring(separador + 1).trim();
                            if ((valor.startsWith("\"") && valor.endsWith("\"")) ||
                                (valor.startsWith("'") && valor.endsWith("'"))) {
                                valor = valor.substring(1, valor.length() - 1);
                            }
                            if (System.getProperty(clave) == null && System.getenv(clave) == null) {
                                System.setProperty(clave, valor);
                            }
                        }
                    }
                    break;
                } catch (IOException ignored) {
                    // Si no se puede leer, continúa con la configuración por defecto
                }
            }
        }
    }
}

