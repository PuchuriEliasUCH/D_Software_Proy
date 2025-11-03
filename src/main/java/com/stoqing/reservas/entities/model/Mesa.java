package com.stoqing.reservas.entities.model;

import com.stoqing.reservas.entities.enums.CapacidadMesa;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "mesa")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Mesa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "num_mesa")
    public Long id;

    @ManyToOne
    @JoinColumn(name = "id_estado", nullable = false)
    public Estado estado;

    @NotNull
    @Enumerated(EnumType.STRING)
    public CapacidadMesa capacidad;
}
