package com.stoqing.reservas.entities.model;

import com.stoqing.reservas.entities.dto.Audit;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "asignacion_mesa")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AsignacionMesa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_asignacion")
    private int idAsignacion;

    @ManyToOne
    @JoinColumn(name = "id_operario", nullable = false)
    private Operario operario;

    @ManyToOne
    @JoinColumn(name = "num_mesa", nullable = false)
    private Mesa mesa;

    @ManyToOne
    @JoinColumn(name = "id_reserva")
    private Reserva reserva;

    @Column(name = "fecha_asignacion", nullable = false)
    private LocalDate fechaAsignacion = LocalDate.now();

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio = LocalTime.now();

    @Column(name = "hora_fin", nullable = true)
    private LocalTime horaFin;

    @Embedded
    private Audit audit = new Audit();
}
