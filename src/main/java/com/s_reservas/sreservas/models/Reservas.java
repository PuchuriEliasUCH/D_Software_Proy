package com.s_reservas.sreservas.models;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class Reservas {
    public String tipo_reserva;
    public String cod_reserva;
    public String id_estado_reserva;
    public LocalDate fecha_reserva;
    public LocalDateTime hora_reserva;
    public String nombre_cliente;
    public int numero_personas;
    public String email_contacto;
    public String comentarios;

    public Reservas () {

    }

    public String getTipo_reserva() {
        return tipo_reserva;
    }

    public void setTipo_reserva(String tipo_reserva) {
        this.tipo_reserva = tipo_reserva;
    }

    public String getCod_reserva() {
        return cod_reserva;
    }

    public void setCod_reserva(String cod_reserva) {
        this.cod_reserva = cod_reserva;
    }

    public String getId_estado_reserva() {
        return id_estado_reserva;
    }

    public void setId_estado_reserva(String id_estado_reserva) {
        this.id_estado_reserva = id_estado_reserva;
    }

    public LocalDate getFecha_reserva() {
        return fecha_reserva;
    }

    public void setFecha_reserva(LocalDate fecha_reserva) {
        this.fecha_reserva = fecha_reserva;
    }

    public LocalDateTime getHora_reserva() {
        return hora_reserva;
    }

    public void setHora_reserva(LocalDateTime hora_reserva) {
        this.hora_reserva = hora_reserva;
    }

    public String getNombre_cliente() {
        return nombre_cliente;
    }

    public void setNombre_cliente(String nombre_cliente) {
        this.nombre_cliente = nombre_cliente;
    }

    public int getNumero_personas() {
        return numero_personas;
    }

    public void setNumero_personas(int numero_personas) {
        this.numero_personas = numero_personas;
    }

    public String getEmail_contacto() {
        return email_contacto;
    }

    public void setEmail_contacto(String email_contacto) {
        this.email_contacto = email_contacto;
    }

    public String getComentarios() {
        return comentarios;
    }

    public void setComentarios(String comentarios) {
        this.comentarios = comentarios;
    }
}
