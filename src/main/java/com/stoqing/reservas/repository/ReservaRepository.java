package com.stoqing.reservas.repository;

import com.stoqing.reservas.entities.dto.AceptarSolicitudDTO;
import com.stoqing.reservas.entities.dto.CardSoliDTO;
import com.stoqing.reservas.entities.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    List<Reserva> findByFechaReservaAndEstado_Id(LocalDate date, Integer id);

    List<Reserva> findByEstado_Id(Integer id);

    @Query("select new com.stoqing.reservas.entities.dto.CardSoliDTO(" +
        "r.id, " +
        "r.nombreCliente, " +
        "r.horaReserva, " +
        "r.numeroPersonas, " +
        "r.montoGarantia, " +
        "r.comentarios" +
        ") from Reserva r where r.estado.id = 1 and r.fechaReserva = ?1")
    List<CardSoliDTO> listarCardSolicitud(LocalDate date);


    @Transactional
    @Modifying
    @Query("update Reserva r set r.estado.id = :idEstado where r.id = :idReserva")
    void actualizarEstadoReserva(@Param("idEstado") Integer idEstado, @Param("idReserva") Integer id);

    @Transactional
    @Modifying
    @Query("update Reserva r set r.estado.id = :#{#as.idEstado}, r.metodoPago = :#{#as.metodoPago} where r.id = :#{#as.idReserva}")
    void aceptarSolicitudReserva(@Param("as") AceptarSolicitudDTO acepSoliDTO);
}
