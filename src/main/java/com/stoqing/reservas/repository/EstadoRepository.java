package com.stoqing.reservas.repository;

import com.stoqing.reservas.entities.enums.TipoEstado;
import com.stoqing.reservas.entities.model.Estado;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

public interface EstadoRepository extends CrudRepository<Estado,Integer> {
    List<Estado> findByActivoIsTrue();
    Optional<Estado> findByNombreAndTipo(String nombre, TipoEstado tipo);

}
