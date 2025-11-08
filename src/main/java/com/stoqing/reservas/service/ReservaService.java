package com.stoqing.reservas.service;

import com.stoqing.reservas.entities.dto.CardSoliDTO;
import com.stoqing.reservas.entities.model.Reserva;
import com.stoqing.reservas.repository.EstadoRepository;
import com.stoqing.reservas.repository.ReservaRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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
        reservaRepo.save(reserva);
    }

    // Listar tarjetas DTO del dashboard
    public List<CardSoliDTO> listarCardSolicitud(LocalDate fecha){
        return reservaRepo.listarCardSolicitud(fecha);
    }

    public void actualizarEstadoReserva(Integer idEstado, Integer idReserva){
        reservaRepo.actualizarEstadoReserva(idEstado, idReserva);
    }


}
