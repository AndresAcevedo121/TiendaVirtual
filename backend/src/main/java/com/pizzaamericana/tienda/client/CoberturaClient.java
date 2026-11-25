package com.pizzaamericana.tienda.client;

import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import com.pizzaamericana.tienda.dto.CoberturaDTO;
import com.pizzaamericana.tienda.exception.ServicioCoberturaException;

/**
 * Llama al servicio de cobertura de servicios-pizzaamericana, de servidor a servidor.
 * La API Key vive solo aquí (variable de entorno): nunca llega al navegador.
 */
@Component
public class CoberturaClient {

    private static final Logger log = LoggerFactory.getLogger(CoberturaClient.class);

    private final RestClient http;

    @Autowired
    public CoberturaClient(
            @Value("${cobertura.url:}") String url,
            @Value("${cobertura.api-key:}") String apiKey) {
        this(RestClient.builder().requestFactory(fabricaConTiempos()), url, apiKey);
    }

    /** Para pruebas: permite enlazar un servidor simulado al constructor. */
    CoberturaClient(RestClient.Builder builder, String url, String apiKey) {
        this.http = builder.baseUrl(url).defaultHeader("X-API-Key", apiKey).build();
    }

    private static JdkClientHttpRequestFactory fabricaConTiempos() {
        JdkClientHttpRequestFactory fabrica = new JdkClientHttpRequestFactory();
        fabrica.setReadTimeout(Duration.ofSeconds(5));
        return fabrica;
    }

    public CoberturaDTO.Respuesta consultar(CoberturaDTO.Solicitud solicitud) {
        try {
            return http.post()
                    .uri("/api/v1/cobertura/consultar")
                    .body(solicitud)
                    .retrieve()
                    .body(CoberturaDTO.Respuesta.class);
        } catch (RestClientResponseException e) {
            // 400, 401, 403, 429, 503...: se registra el código y el cliente recibe un mensaje genérico
            log.warn("El servicio de cobertura respondió {}", e.getStatusCode().value());
            throw new ServicioCoberturaException("Cobertura respondió " + e.getStatusCode().value(), e);
        } catch (RestClientException e) {
            // Sin conexión o tiempo agotado
            log.warn("No se pudo llamar al servicio de cobertura: {}", e.getClass().getSimpleName());
            throw new ServicioCoberturaException("Cobertura no disponible", e);
        }
    }
}
