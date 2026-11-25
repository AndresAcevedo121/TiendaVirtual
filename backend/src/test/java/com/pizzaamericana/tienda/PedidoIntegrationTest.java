package com.pizzaamericana.tienda;

import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pizzaamericana.tienda.dto.CotizacionDTO;
import com.pizzaamericana.tienda.dto.PedidoDTO;
import com.pizzaamericana.tienda.service.PedidoService;

@SpringBootTest
class PedidoIntegrationTest {

    @Autowired
    private PedidoService pedidoService;

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    public void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    void testCrearPedidoDomicilio() {
        PedidoDTO.CreacionRequest req = new PedidoDTO.CreacionRequest();
        req.setOrderToken("token_" + UUID.randomUUID());
        req.setIdtienda(1);
        req.setTipoEntrega("DOMICILIO");
        req.setClienteNombre("Andres");
        req.setClienteTelefono("3254589465");
        req.setClienteCorreo("juanandres19882010@gmail.com");
        req.setAutorizacionDatos(true);
        req.setDireccionTexto("avenida siempre viva");
        req.setDireccionDetalles("casa piso 1");
        req.setBarrio("Manrique");
        req.setMunicipio("Medellin");
        req.setFormaPago("WOMPI");

        CotizacionDTO.ItemRequest item = new CotizacionDTO.ItemRequest();
        item.setIdproducto(11); // Pizza Mediana
        item.setCantidad(1);
        item.setEsMitadMitad(false);
        item.setIdespecialidad1(101); // Hawaiana
        req.setItems(Collections.singletonList(item));

        PedidoDTO.Response res = pedidoService.crearPedido(req);
        assertNotNull(res);
        assertNotNull(res.getIdpedido());
    }

    @Test
    void testCrearPedidoRecogerEnTiendaHttp() throws Exception {
        PedidoDTO.CreacionRequest req = new PedidoDTO.CreacionRequest();
        req.setOrderToken("token_recoger_" + UUID.randomUUID());
        req.setIdtienda(1);
        req.setTipoEntrega("RECOGER");
        req.setClienteNombre("Andres");
        req.setClienteTelefono("3254589465");
        req.setClienteCorreo("juanandres19882010@gmail.com");
        req.setAutorizacionDatos(true);
        req.setDireccionTexto(""); // Vacía tal como viene cuando es recoger
        req.setMunicipio("Medellin");
        req.setFormaPago("DATAFONO");

        CotizacionDTO.ItemRequest item = new CotizacionDTO.ItemRequest();
        item.setIdproducto(12); // Pizza Grande ($48.000)
        item.setCantidad(1);
        item.setEsMitadMitad(true);
        item.setIdespecialidad1(105); // Peperoni (+3500/2 = 1750)
        item.setIdespecialidad2(101); // Hawaiana (+0)
        req.setItems(Collections.singletonList(item));

        mockMvc.perform(post("/api/v1/pedidos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idpedido").exists())
                .andExpect(jsonPath("$.valorDomicilio").value(0));
    }
}
