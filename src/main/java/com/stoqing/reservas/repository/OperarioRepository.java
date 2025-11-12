package com.stoqing.reservas.repository;

import com.stoqing.reservas.entities.model.Operario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OperarioRepository extends JpaRepository<Operario, Integer> {
    Optional<Operario> findByDni(String dni);
}
