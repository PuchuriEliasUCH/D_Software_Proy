package com.stoqing.reservas.repository;

import com.stoqing.reservas.entities.dto.AceptarSolicitudDTO;
import com.stoqing.reservas.entities.dto.CardSoliDTO;
import com.stoqing.reservas.entities.dto.PanelAdminDashDTO;
import com.stoqing.reservas.entities.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Integer> {

    List<Reserva> findByEstado_Id(Integer id);

    List<Reserva> findByEstado_IdAndExpiraBefore(Integer id, LocalDateTime actual);

    @Query("select new com.stoqing.reservas.entities.dto.CardSoliDTO(" +
            "r.id, " +
            "r.codigo, " +
            "r.nombreCliente, " +
            "r.horaReserva, " +
            "r.numeroPersonas, " +
            "r.montoGarantia, " +
            "r.comentarios" +
            ") " +
            "from Reserva r " +
            "where r.estado.id = 6 " + // 6 = Pago pendiente
            "and (:fecha is null or r.fechaReserva = :fecha) " +
            "order by r.fechaReserva, r.horaReserva")
    List<CardSoliDTO> listarCardSolicitud(@Param("fecha") LocalDate fecha);



    @Transactional
    @Modifying
    @Query("update Reserva r set r.estado.id = :idEstado where r.id = :idReserva")
    void actualizarEstadoReserva(@Param("idEstado") Integer idEstado, @Param("idReserva") Integer id);

    @Transactional
    @Modifying
    @Query("update Reserva r set r.estado.id = :#{#as.idEstado}, r.metodoPago = :#{#as.metodoPago} where r.id = :#{#as.idReserva}")
    void aceptarSolicitudReserva(@Param("as") AceptarSolicitudDTO acepSoliDTO);

    @Query("select r.estado.id from Reserva as r where r.fechaReserva = ?1")
    List<Integer> ids_estado(LocalDate fechaReserva);
}
