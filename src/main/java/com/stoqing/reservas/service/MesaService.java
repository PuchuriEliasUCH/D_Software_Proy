package com.stoqing.reservas.service;

import com.stoqing.reservas.entities.enums.TipoEstado;
import com.stoqing.reservas.entities.model.Estado;
import com.stoqing.reservas.entities.model.Mesa;
import com.stoqing.reservas.repository.EstadoRepository;
import com.stoqing.reservas.repository.MesaRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class MesaService {

    private final MesaRepository mesaRepository;
    private final EstadoRepository estadoRepository;

    public List<Mesa> listarTodas() {
        return mesaRepository.findAllByOrderByIdAsc();
    }

    public Mesa cambiarEstadoMesa(int numMesa, String nombreEstado) {
        Mesa mesa = mesaRepository.findById(numMesa)
                .orElseThrow(() -> new IllegalArgumentException("Mesa no encontrada: " + numMesa));

        Estado estado = estadoRepository
                .findByNombreAndTipo(nombreEstado, TipoEstado.MESA)
                .orElseThrow(() -> new IllegalArgumentException("Estado MESA no encontrado: " + nombreEstado));

        mesa.setEstado(estado);
        return mesaRepository.save(mesa);
    }
}
