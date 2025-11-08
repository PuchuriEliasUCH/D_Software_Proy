package com.stoqing.reservas.entities.dto;

import com.stoqing.reservas.entities.enums.MetodoPago;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AceptarSolicitudDTO {
    Integer idEstado;
    Integer idReserva;

    @Enumerated(EnumType.STRING)
    MetodoPago metodoPago;
}
