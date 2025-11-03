package com.stoqing.reservas.service;

import com.stoqing.reservas.entities.model.Reserva;
import com.stoqing.reservas.repository.EstadoRepository;
import com.stoqing.reservas.repository.ReservaRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class ReservaService {
    private ReservaRepository reservaRepo;
    private EstadoRepository estadoRepo;

    public List<Reserva> findAll(){
        return reservaRepo.findAll();
    }

    public void save(Reserva reserva){
        reservaRepo.save(reserva);
    }
}
