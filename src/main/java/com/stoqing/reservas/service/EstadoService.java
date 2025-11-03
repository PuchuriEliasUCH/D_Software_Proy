package com.stoqing.reservas.service;

import com.stoqing.reservas.entities.model.Estado;
import com.stoqing.reservas.repository.EstadoRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class EstadoService {
    private EstadoRepository estadoRepo;

    public List<Estado> finByTrueActivo() {
        return estadoRepo.findByActivoIsTrue();
    }

    public void createEstado(Estado estado) {
        estadoRepo.save(estado);
    }
}
