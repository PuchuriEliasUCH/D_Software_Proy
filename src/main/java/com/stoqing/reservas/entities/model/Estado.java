package com.stoqing.reservas.entities.model;

import com.stoqing.reservas.entities.dto.Audit;
import com.stoqing.reservas.entities.enums.TipoEstado;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "estado")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Estado {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estado")
    private Long id;

    @NotBlank
    @Column(name = "nombre", nullable = false, length = 60)
    private String nombre;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private TipoEstado tipo;

    @NotBlank
    @Column(name = "descripcion", nullable = false, length = 150)
    private String descripcion;

    @NotBlank
    @Column(name = "color", nullable = false, length = 10)
    private String color;

    @NotNull
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @Embedded
    private Audit audit = new Audit();

}