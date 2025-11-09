package com.stoqing.reservas.entities.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MesaDTO {
    private int numMesa;
    private String capacidad;
    private String estado;
    private String color;
}