package com.stoqing.reservas.utils;

import org.springframework.stereotype.Component;

@Component
public class EstadosReserva {
    public static final Integer PAGO_PENDIENTE = 1;
    public static final Integer RESERVA_PROGRAMADA = 2;
    public static final Integer CANCELADO_EXPIRADO = 3;
    public static final Integer CANCELADO_CLIENTE = 4;
    public static final Integer CANCELADO_INCONVENIENTES = 5;
    public static final Integer EN_CURSO = 6;
    public static final Integer FINALIZADA = 7;
    public static final Integer CANCELADO_NO_SHOW = 8;
}
