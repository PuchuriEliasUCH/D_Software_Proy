package com.stoqing.reservas.service;

import com.stoqing.reservas.entities.dto.AceptarSolicitudDTO;
import com.stoqing.reservas.entities.dto.CardSoliDTO;
import com.stoqing.reservas.entities.dto.PanelAdminDashDTO;
import com.stoqing.reservas.entities.model.Reserva;
import com.stoqing.reservas.repository.EstadoRepository;
import com.stoqing.reservas.repository.ReservaRepository;
import com.stoqing.reservas.utils.EstadosReserva;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@AllArgsConstructor
public class ReservaService {
    private ReservaRepository reservaRepo;
    private EstadoRepository estadoRepo;

    public List<Reserva> findAll(){
        return reservaRepo.findAll();
    }

    public List<Reserva> findByEstado_Id(Integer id){
        return reservaRepo.findByEstado_Id(id);
    }

    public void save(Reserva reserva){
        LocalDateTime actual = LocalDateTime.now(ZoneId.of("America/Lima"));
        reserva.setExpira(actual.plusMinutes(15L));
        reservaRepo.save(reserva);
    }

    // Listar tarjetas DTO del dashboard
    public List<CardSoliDTO> listarCardSolicitud(LocalDate fecha){
        return reservaRepo.listarCardSolicitud(fecha);
    }

    public PanelAdminDashDTO listarContadoresDashboard(LocalDate fecha){

        long programado = 0L;
        long enCurso = 0L;
        long finalizado = 0L;
        long cancelado = 0L;

        List<Integer> ids = reservaRepo.ids_estado(fecha);

        cancelado = ids.stream()
            .filter(id -> Set.of(
                EstadosReserva.CANCELADO_EXPIRADO,
                EstadosReserva.CANCELADO_CLIENTE,
                EstadosReserva.CANCELADO_INCONVENIENTES,
                EstadosReserva.CANCELADO_NO_SHOW
            ).contains(id))
            .count();

        finalizado = ids.stream().filter(id -> Objects.equals(id, EstadosReserva.FINALIZADA)).count();
        enCurso = ids.stream().filter(id -> Objects.equals(id, EstadosReserva.EN_CURSO)).count();
        programado = ids.stream().filter(id -> Objects.equals(id, EstadosReserva.RESERVA_PROGRAMADA)).count();

        return new PanelAdminDashDTO(cancelado, programado, enCurso, finalizado);
    }

    public void actualizarEstadoReserva(Integer idEstado, Integer idReserva){
        Reserva reserva = reservaRepo.findById(idReserva)
            .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        reserva.setExpira(null);
        reservaRepo.actualizarEstadoReserva(idEstado, idReserva);
    }

    public void aceptarSolicitudReserva(AceptarSolicitudDTO acepSoliDTO){
        Reserva reserva = reservaRepo.findById(acepSoliDTO.getIdReserva())
            .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        reserva.setExpira(null);
        reservaRepo.aceptarSolicitudReserva(acepSoliDTO);
    }
}
