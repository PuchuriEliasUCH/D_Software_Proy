package com.stoqing.reservas.repository;

import com.stoqing.reservas.entities.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {
}
