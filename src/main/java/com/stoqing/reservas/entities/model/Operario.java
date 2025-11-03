package com.stoqing.reservas.entities.model;

import com.stoqing.reservas.entities.dto.Audit;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Operario {
    @Id
	@GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name = "id_operario")
	private Long id;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String nombre;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String apellido;

    @Column(unique = true, nullable = false, length = 8)
    @Pattern(regexp = "\\d{8}", message = "Debe tener 8 dígitos")
    private String dni;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contrasena;

    @Column(nullable = false, length = 9)
    @Pattern(regexp = "\\d{9}", message = "Debe tener 9 dígitos")
    private String telefono;

    @Column(nullable = false)
    private Boolean enabled = true;

    @Embedded
    private Audit audit = new Audit();
}
