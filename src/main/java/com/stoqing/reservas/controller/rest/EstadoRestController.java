package com.stoqing.reservas.controller.rest;

import com.stoqing.reservas.entities.model.Estado;
import com.stoqing.reservas.service.EstadoService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/estado")
@AllArgsConstructor
public class EstadoRestController {

    private EstadoService estadoService;

    @GetMapping("/listar")
    public ResponseEntity<?> listar(){
        return ResponseEntity.status(HttpStatus.OK).body(estadoService.finByTrueActivo());
    }

    @PostMapping("/crear")
    public ResponseEntity<?> crear(@RequestBody Estado estado){

        estadoService.createEstado(estado);

        return ResponseEntity.status(HttpStatus.CREATED).body(estado);
    }
}
