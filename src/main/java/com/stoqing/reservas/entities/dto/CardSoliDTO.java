package com.stoqing.reservas.entities.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CardSoliDTO {
    private int id;
    private String codigo;
    private String nombreCliente;
    private LocalTime horaReserva;
    private int numeroPersonas;
    private double montoGarantia;
    private String comentarios;
}
