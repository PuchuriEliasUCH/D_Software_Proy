package com.stoqing.reservas.entities.dto;

import com.stoqing.reservas.entities.model.Reserva;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmailDTO {
    private String destinatario;
    private String asunto;
    private String mensaje;
    private Reserva reserva;
}
