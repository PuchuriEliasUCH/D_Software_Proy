package com.stoqing.reservas.entities.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class PanelAdminDashDTO {
    private Long canceladas;
    private Long programadas;
    private Long enCurso;
    private Long finalizadas;
}
