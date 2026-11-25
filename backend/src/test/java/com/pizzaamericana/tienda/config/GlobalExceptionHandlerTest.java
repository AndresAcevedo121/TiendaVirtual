package com.pizzaamericana.tienda.config;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pizzaamericana.tienda.exception.NegocioException;

/** Prueba de la corrección 2: el cliente nunca ve detalles internos de un error. */
class GlobalExceptionHandlerTest {

    @RestController
    static class ControladorDePrueba {
        @GetMapping("/prueba/interno")
        String interno() {
            throw new RuntimeException("SECRETO: tabla pedido, columna cliente_telefono");
        }

        @GetMapping("/prueba/negocio")
        String negocio() {
            throw new NegocioException("La tienda 9 no existe.");
        }

        @GetMapping("/prueba/numero")
        String numero(@RequestParam Integer n) {
            return "ok";
        }
    }

    private final MockMvc mvc = MockMvcBuilders.standaloneSetup(new ControladorDePrueba())
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    @Test
    void unErrorInternoNoRevelaSuMensaje() throws Exception {
        String cuerpo = mvc.perform(get("/prueba/interno"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").exists())
                .andReturn().getResponse().getContentAsString();

        assertFalse(cuerpo.contains("SECRETO"), "La respuesta no debe incluir el mensaje interno: " + cuerpo);
        assertFalse(cuerpo.contains("cliente_telefono"), "La respuesta no debe incluir nombres de columnas");
    }

    @Test
    void unaReglaDeNegocioSiMuestraSuMensaje() throws Exception {
        mvc.perform(get("/prueba/negocio"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("La tienda 9 no existe."));
    }

    @Test
    void unParametroConTipoIncorrectoDaUn400GenericoSinDetalleDelFramework() throws Exception {
        String cuerpo = mvc.perform(get("/prueba/numero").param("n", "abc"))
                .andExpect(status().isBadRequest())
                .andReturn().getResponse().getContentAsString();

        assertFalse(cuerpo.contains("NumberFormatException"));
        assertFalse(cuerpo.contains("java.lang"));
    }
}
