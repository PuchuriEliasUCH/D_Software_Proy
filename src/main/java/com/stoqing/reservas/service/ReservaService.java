package com.stoqing.reservas.service;

import com.stoqing.reservas.entities.dto.AceptarSolicitudDTO;
import com.stoqing.reservas.entities.dto.CardSoliDTO;
import com.stoqing.reservas.entities.model.Reserva;
import com.stoqing.reservas.repository.EstadoRepository;
import com.stoqing.reservas.repository.ReservaRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

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
