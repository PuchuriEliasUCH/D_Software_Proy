package com.stoqing.reservas.repository;

import com.stoqing.reservas.entities.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    List<Reserva> findByFechaReserva(LocalDate date);
}
