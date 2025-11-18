package com.stoqing.reservas.utils;

import org.springframework.stereotype.Component;

@Component
public class EstadosReserva {
    public static final Integer PAGO_PENDIENTE = 6;
    public static final Integer RESERVA_PROGRAMADA = 7;
    public static final Integer CANCELADO_EXPIRADO = 8;
    public static final Integer CANCELADO_CLIENTE = 9;
    public static final Integer CANCELADO_INCONVENIENTES = 10;
    public static final Integer EN_CURSO = 11;
    public static final Integer FINALIZADA = 12;
    public static final Integer CANCELADO_NO_SHOW = 13;
}
