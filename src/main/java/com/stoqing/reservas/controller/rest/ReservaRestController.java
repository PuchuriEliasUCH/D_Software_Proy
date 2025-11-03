package com.stoqing.reservas.controller.rest;

import com.stoqing.reservas.entities.model.Reserva;
import com.stoqing.reservas.service.ReservaService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/reserva")
@AllArgsConstructor
public class ReservaRestController {

    private ReservaService reservaService;

    @GetMapping("/listar")
    public ResponseEntity<?> listar(){
        return ResponseEntity.status(HttpStatus.OK).body(reservaService.findAll());
    }

    @PostMapping("/crear")
    public ResponseEntity<?> crear(@RequestBody Reserva reserva){
        reservaService.save(reserva);
        return ResponseEntity.status(HttpStatus.CREATED).body(reserva);
    }

}
