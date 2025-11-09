package com.stoqing.reservas.repository;

import com.stoqing.reservas.entities.model.Mesa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MesaRepository extends JpaRepository<Mesa, Integer> {

    List<Mesa> findAllByOrderByIdAsc();
}
