package com.pizzaamericana.tienda;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.Test;

/** Pruebas de la corrección 1: ninguna clave ni usuario root escrito en la configuración. */
class ConfiguracionSinSecretosTest {

    private static String propiedades() throws IOException {
        return Files.readString(Path.of("src/main/resources/application.properties"));
    }

    private static String valorDe(String clave) throws IOException {
        return propiedades().lines()
                .filter(l -> l.startsWith(clave + "="))
                .map(l -> l.substring(clave.length() + 1).trim())
                .findFirst().orElse("");
    }

    @Test
    void laClaveDeLaBaseNoEstaEscritaEnElArchivo() throws IOException {
        assertTrue(valorDe("spring.datasource.password").startsWith("${"),
                "La clave debe venir de una variable de entorno, por ejemplo ${DB_PASSWORD}");
    }

    @Test
    void elUsuarioDeLaBaseNoEsRootEscritoEnElArchivo() throws IOException {
        assertFalse(valorDe("spring.datasource.username").equalsIgnoreCase("root"));
    }

    @Test
    void losMensajesDeErrorNoSeIncluyenEnLasRespuestas() throws IOException {
        assertFalse(propiedades().contains("server.error.include-message=always"));
        assertTrue(valorDe("server.error.include-message").equals("never"));
    }
}
