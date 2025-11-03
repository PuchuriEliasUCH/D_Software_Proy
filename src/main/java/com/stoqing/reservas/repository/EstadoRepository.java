package com.stoqing.reservas.repository;

import com.stoqing.reservas.entities.model.Estado;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface EstadoRepository extends CrudRepository<Estado,Long> {
    List<Estado> findByActivoIsTrue();
}
