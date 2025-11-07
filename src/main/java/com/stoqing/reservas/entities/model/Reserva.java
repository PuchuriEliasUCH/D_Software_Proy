package com.stoqing.reservas.entities.model;

import com.stoqing.reservas.entities.dto.Audit;
import com.stoqing.reservas.entities.enums.MetodoPago;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "reserva")
@Data
@ToString(exclude = "reserva")
@AllArgsConstructor
@NoArgsConstructor
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reserva")
    private int id;

    @ManyToOne()
    @JoinColumn(name = "id_estado")
    private Estado estado;

    @NotNull
    @Column(name = "fecha_reserva", nullable = false)
    private LocalDate fechaReserva;

    @NotNull
    @Column(name = "hora_reserva", nullable = false)
    private LocalTime horaReserva;

    @NotBlank
    @Column(name = "nombre_cliente", nullable = false, length = 50)
    private String nombreCliente;

    @NotBlank
    @Column(name = "apellido_cliente", nullable = false, length = 50)
    private String apellidoCliente;

    @Pattern(regexp = "\\d{9}", message = "Número de teléfono inválido")
    @Column(name = "tel_cliente", nullable = false, length = 9)
    private String telCliente;

    @Min(1)
    @Max(8)
    @Column(name = "numero_personas", nullable = false)
    private int numeroPersonas;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pago")
    private MetodoPago metodoPago;

    @DecimalMin(value = "0.00")
    @Column(name = "monto_garantia", columnDefinition = "DECIMAL(5,2)", nullable = false)
    private double montoGarantia;

    @Email
    @Column(name = "email_contacto", nullable = false, length = 150)
    private String emailContacto;

    @Pattern(regexp = "\\d{8}", message = "DNI inválido")
    @Column(name = "dni_cliente", nullable = false, length = 8)
    private String dniCliente;

    @Column(name = "comentarios", columnDefinition = "TEXT")
    private String comentarios;

    @Embedded
    private Audit audit = new Audit();

}
