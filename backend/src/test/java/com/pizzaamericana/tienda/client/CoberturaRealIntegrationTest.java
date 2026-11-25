package com.pizzaamericana.tienda.client;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.pizzaamericana.tienda.dto.CoberturaDTO;

/**
 * Prueba de conexión REAL contra el microservicio de cobertura configurado en el entorno.
 * Usa las credenciales reales cargadas desde el archivo .env.
 */
@SpringBootTest
class CoberturaRealIntegrationTest {

    @Autowired
    private CoberturaClient coberturaClient;

    @Test
    void probarConexionRealConServidorDocker() {
        CoberturaDTO.Solicitud solicitud = new CoberturaDTO.Solicitud("Carrera 45 # 70-10", "Medellin", "Manrique");
        CoberturaDTO.Respuesta respuesta = coberturaClient.consultar(solicitud);

        assertNotNull(respuesta, "La respuesta del servidor no debe ser nula");
        assertEquals("CON_COBERTURA", respuesta.estado(), "El estado debe ser CON_COBERTURA");
        assertTrue(respuesta.cobertura(), "Debe tener cobertura");
        assertNotNull(respuesta.tienda(), "Debe devolver una tienda asignada");
        assertEquals("Manrique", respuesta.tienda().nombre(), "La tienda asignada debe ser Manrique");
        System.out.println(">>> CONEXIÓN REAL EXITOSA CON MICROSERVICIO DE COBERTURA -> Tienda: " + respuesta.tienda().nombre());
    }
}
