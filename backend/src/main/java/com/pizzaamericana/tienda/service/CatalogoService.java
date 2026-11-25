package com.pizzaamericana.tienda.service;

import com.pizzaamericana.tienda.dto.CatalogoDTO;
import com.pizzaamericana.tienda.exception.NegocioException;
import com.pizzaamericana.tienda.model.*;
import com.pizzaamericana.tienda.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class CatalogoService {

    @Autowired
    private TiendaRepository tiendaRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private EspecialidadTamanoRepository especialidadTamanoRepository;

    @Autowired
    private ProductoModificadorRepository productoModificadorRepository;

    @Autowired
    private ProductoAdicionRepository productoAdicionRepository;

    @Autowired
    private TiendaProductoExcepcionRepository excepcionRepository;

    public CatalogoDTO.MenuTiendaResponse obtenerMenuPorTienda(Integer idtienda) {
        Tienda tienda = tiendaRepository.findById(idtienda)
                .orElseThrow(() -> new NegocioException("La tienda " + idtienda + " no existe."));

        CatalogoDTO.MenuTiendaResponse response = new CatalogoDTO.MenuTiendaResponse();
        response.setIdtienda(tienda.getIdtienda());
        response.setNombreTienda(tienda.getNombre());
        response.setDisponible(!Boolean.TRUE.equals(tienda.getBloqueada()));
        response.setTiempoEstimadoMinutos(tienda.getTiempoEntregaMinutos());

        // Cargar mapa de excepciones de la tienda
        Map<Integer, TiendaProductoExcepcion> mapaExcepciones = excepcionRepository.findByIdtienda(idtienda)
                .stream().collect(Collectors.toMap(TiendaProductoExcepcion::getIdproducto, e -> e));

        List<Categoria> categorias = categoriaRepository.findByActivoTrueOrderByOrdenAsc();
        List<Producto> todosProductos = productoRepository.findByActivoTrue();

        // Agrupar productos activos por categoría
        Map<Integer, List<Producto>> productosPorCategoria = todosProductos.stream()
                .filter(p -> p.getCategoria() != null && ("P".equals(p.getTipoProducto()) || "O".equals(p.getTipoProducto())))
                .collect(Collectors.groupingBy(p -> p.getCategoria().getIdcategoria()));

        List<CatalogoDTO.CategoriaResponse> categoriasDto = new ArrayList<>();

        for (Categoria cat : categorias) {
            CatalogoDTO.CategoriaResponse catDto = new CatalogoDTO.CategoriaResponse();
            catDto.setIdcategoria(cat.getIdcategoria());
            catDto.setNombre(cat.getNombre());
            catDto.setDescripcion(cat.getDescripcion());
            catDto.setIcono(cat.getIcono());

            List<Producto> prods = productosPorCategoria.getOrDefault(cat.getIdcategoria(), Collections.emptyList());
            List<CatalogoDTO.ProductoResponse> prodsDto = new ArrayList<>();

            for (Producto p : prods) {
                CatalogoDTO.ProductoResponse pDto = new CatalogoDTO.ProductoResponse();
                pDto.setIdproducto(p.getIdproducto());
                pDto.setNombre(p.getNombre());
                pDto.setDescripcion(p.getDescripcion());
                pDto.setImagenUrl(p.getImagenUrl());
                pDto.setTipoProducto(p.getTipoProducto());
                pDto.setTamanoCodigo(p.getTamanoCodigo());
                pDto.setPorciones(p.getPorciones());
                pDto.setPermiteMitadMitad(p.getPermiteDividir());

                // Excepciones de tienda
                TiendaProductoExcepcion exc = mapaExcepciones.get(p.getIdproducto());
                if (exc != null) {
                    pDto.setDisponible(exc.getDisponible());
                    pDto.setPrecioBase(exc.getPrecioSobrescrito() != null ? exc.getPrecioSobrescrito() : p.getPrecioBase());
                } else {
                    pDto.setDisponible(true);
                    pDto.setPrecioBase(p.getPrecioBase());
                }

                // Si es tipo P (Pizza Padre), cargar sus especialidades y adiciones
                if ("P".equals(p.getTipoProducto())) {
                    cargarEspecialidadesYAdiciones(p, pDto);
                }

                prodsDto.add(pDto);
            }

            catDto.setProductos(prodsDto);
            categoriasDto.add(catDto);
        }

        response.setCategorias(categoriasDto);
        return response;
    }

    private void cargarEspecialidadesYAdiciones(Producto pizzaPadre, CatalogoDTO.ProductoResponse pDto) {
        // 1. Especialidades por tamaño
        List<EspecialidadTamano> espTamanos = especialidadTamanoRepository.findByTamanoIdproducto(pizzaPadre.getIdproducto());
        List<CatalogoDTO.EspecialidadResponse> espDtos = new ArrayList<>();

        for (EspecialidadTamano et : espTamanos) {
            Producto esp = et.getEspecialidad();
            CatalogoDTO.EspecialidadResponse espDto = new CatalogoDTO.EspecialidadResponse();
            espDto.setIdespecialidad(esp.getIdproducto());
            espDto.setNombre(esp.getNombre());
            espDto.setDescripcion(esp.getDescripcion());
            espDto.setRecargoCompleta(et.getRecargo());
            // Regla matemática de mitad: recargo / 2 (Skill 01)
            espDto.setRecargoMitad(et.getRecargo().divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP));

            // Modificadores de la especialidad
            List<ProductoModificador> mods = productoModificadorRepository.findByEspecialidadIdproducto(esp.getIdproducto());
            List<CatalogoDTO.ModificadorItemResponse> sin = new ArrayList<>();
            List<CatalogoDTO.ModificadorItemResponse> con = new ArrayList<>();

            for (ProductoModificador m : mods) {
                if ("SIN".equalsIgnoreCase(m.getTipo())) {
                    sin.add(new CatalogoDTO.ModificadorItemResponse(m.getModificadorItem().getIdproducto(), m.getModificadorItem().getNombre()));
                } else if ("CON".equalsIgnoreCase(m.getTipo())) {
                    con.add(new CatalogoDTO.ModificadorItemResponse(m.getModificadorItem().getIdproducto(), m.getModificadorItem().getNombre()));
                }
            }
            espDto.setIngredientesSin(sin);
            espDto.setIngredientesCon(con);

            espDtos.add(espDto);
        }
        pDto.setEspecialidades(espDtos);

        // 2. Adiciones por tamaño
        List<ProductoAdicion> adiciones = productoAdicionRepository.findByTamanoIdproducto(pizzaPadre.getIdproducto());
        List<CatalogoDTO.AdicionResponse> adicDtos = adiciones.stream()
                .map(a -> new CatalogoDTO.AdicionResponse(a.getAdicionItem().getIdproducto(), a.getAdicionItem().getNombre(), a.getPrecioAdicion()))
                .collect(Collectors.toList());
        pDto.setAdiciones(adicDtos);
    }
}

